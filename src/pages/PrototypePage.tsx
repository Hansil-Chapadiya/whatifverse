import { useMemo, useState } from 'react';
import { DebugPanel } from '../components/DebugPanel';
import { EntityAssetGrid } from '../components/EntityAssetGrid';
import { EntityEditor } from '../components/EntityEditor';
import { GenerationProgress } from '../components/GenerationProgress';
import { PromptForm } from '../components/PromptForm';
import { ScenarioCard } from '../components/ScenarioCard';
import { SceneViewer } from '../components/SceneViewer';
import {
  createSceneAssets,
  extractEntities,
  generateScenario,
  getJobStatus,
  getSceneById,
} from '../lib/api';
import { validateEnv } from '../lib/env';
import { toAppError } from '../lib/request';
import {
  EditableEntity,
  FlowState,
  JobResponse,
  NormalizedAppError,
  SceneResult,
  ImageServiceRequestPayload,
} from '../lib/types';
import { buildScenePayload, isSceneResult, mapEntityStringsToEditable, sleep } from '../lib/utils';
import '../styles/prototype.css';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export function PrototypePage() {
  const envValidation = useMemo(() => validateEnv(), []);

  const [phase, setPhase] = useState<FlowState>('idle');
  const [prompt, setPrompt] = useState('');
  const [scenarioText, setScenarioText] = useState('');
  const [rawExtractedEntities, setRawExtractedEntities] = useState<string[]>([]);
  const [entities, setEntities] = useState<EditableEntity[]>([]);
  const [jobId, setJobId] = useState('');
  const [sceneId, setSceneId] = useState('');
  const [jobStatus, setJobStatus] = useState<JobResponse['status']>();
  const [finalScene, setFinalScene] = useState<SceneResult | null>(null);
  const [error, setError] = useState<NormalizedAppError | null>(null);
  const [debugPayload, setDebugPayload] = useState<ImageServiceRequestPayload | null>(null);
  const [finalResponseJson, setFinalResponseJson] = useState<unknown>(null);

  const resetFlow = () => {
    setPhase('idle');
    setScenarioText('');
    setEntities([]);
    setRawExtractedEntities([]);
    setJobId('');
    setSceneId('');
    setJobStatus(undefined);
    setFinalScene(null);
    setError(null);
    setDebugPayload(null);
    setFinalResponseJson(null);
  };

  const failWith = (incoming: unknown) => {
    const normalized = toAppError(incoming);
    setError(normalized);
    setPhase('failed');
  };

  const runGenerateScenarioFlow = async () => {
    if (!envValidation.ok) {
      return;
    }

    if (!prompt.trim()) {
      setError({
        code: 'INVALID_RESPONSE',
        message: 'Prompt is required.',
      });
      return;
    }

    setError(null);
    setFinalScene(null);
    setDebugPayload(null);
    setFinalResponseJson(null);
    setPhase('generatingScenario');

    try {
      const generateRes = await generateScenario(envValidation.env, prompt.trim());
      if (!generateRes || typeof generateRes.generated_text !== 'string') {
        throw {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response shape from scenario generation endpoint.',
        };
      }

      setScenarioText(generateRes.generated_text);
      setPhase('extractingEntities');

      const entitiesRes = await extractEntities(envValidation.env, generateRes.generated_text);
      if (!entitiesRes || !Array.isArray(entitiesRes.entities)) {
        throw {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response shape from entity extraction endpoint.',
        };
      }

      const sanitized = entitiesRes.entities.filter((item): item is string => typeof item === 'string');
      setRawExtractedEntities(sanitized);
      setEntities(mapEntityStringsToEditable(sanitized));
      setPhase('reviewingEntities');
    } catch (incoming) {
      failWith(incoming);
    }
  };

  const resolveCompletedScene = async (jobResponse: JobResponse): Promise<SceneResult> => {
    if (jobResponse.result && isSceneResult(jobResponse.result)) {
      return jobResponse.result;
    }

    if (!jobResponse.scene_id) {
      throw {
        code: 'INVALID_RESPONSE',
        message: 'Completed job has no scene_id.',
      };
    }

    const scene = await getSceneById(envValidation.env, jobResponse.scene_id);
    if (!isSceneResult(scene)) {
      throw {
        code: 'INVALID_RESPONSE',
        message: 'Scene fetch response is missing required scene GLB fields.',
        details: scene,
      };
    }

    return scene;
  };

  const pollSceneGeneration = async (activeJobId: string): Promise<SceneResult> => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
      const jobRes = await getJobStatus(envValidation.env, activeJobId);
      setJobStatus(jobRes.status);
      setSceneId(jobRes.scene_id || '');
      setFinalResponseJson(jobRes);

      if (jobRes.status === 'completed') {
        return resolveCompletedScene(jobRes);
      }

      if (jobRes.status === 'failed') {
        throw {
          code: 'JOB_FAILED',
          message:
            (typeof jobRes.error === 'string' ? jobRes.error : null) ||
            (jobRes.error && typeof jobRes.error === 'object' && 'message' in (jobRes.error as object)
              ? String((jobRes.error as { message?: unknown }).message)
              : 'Scene generation job failed.'),
          details: jobRes.error,
        };
      }

      await sleep(POLL_INTERVAL_MS);
    }

    throw {
      code: 'POLL_TIMEOUT',
      message: 'Scene generation timed out after 5 minutes.',
    };
  };

  const runSceneGenerationFlow = async () => {
    if (!envValidation.ok) {
      return;
    }

    if (!scenarioText) {
      setError({
        code: 'INVALID_RESPONSE',
        message: 'Scenario text is required before generating a scene.',
      });
      return;
    }

    const validEntities = entities
      .filter((entity: EditableEntity) => entity.name.trim())
      .map((entity: EditableEntity) => ({ ...entity, name: entity.name.trim() }));

    const payload = buildScenePayload(prompt, scenarioText, validEntities);
    setDebugPayload(payload);
    setError(null);
    setPhase('requestingSceneGeneration');

    try {
      const createRes = await createSceneAssets(envValidation.env, payload);
      if (!createRes?.job_id || !createRes?.scene_id) {
        throw {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response shape from scene creation endpoint.',
          details: createRes,
        };
      }

      setJobId(createRes.job_id);
      setSceneId(createRes.scene_id);
      setJobStatus(createRes.status);
      setPhase('pollingSceneGeneration');

      const sceneResult = await pollSceneGeneration(createRes.job_id);
      setFinalScene(sceneResult);
      setFinalResponseJson(sceneResult);
      setPhase('completed');
    } catch (incoming) {
      failWith(incoming);
    }
  };

  const retryPolling = async () => {
    if (!jobId) {
      return;
    }

    setError(null);
    setPhase('pollingSceneGeneration');

    try {
      const sceneResult = await pollSceneGeneration(jobId);
      setFinalScene(sceneResult);
      setFinalResponseJson(sceneResult);
      setPhase('completed');
    } catch (incoming) {
      failWith(incoming);
    }
  };

  if (!envValidation.ok) {
    return (
      <main className="page">
        <section className="card error-card">
          <h1>Setup Error</h1>
          <p>Missing required environment variables.</p>
          <ul>
            {envValidation.missing.map((name: string) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <p>Update your .env file and restart the app.</p>
        </section>
      </main>
    );
  }

  const isGeneratingScenario = phase === 'generatingScenario' || phase === 'extractingEntities';
  const isBusyForEntities =
    phase === 'requestingSceneGeneration' || phase === 'pollingSceneGeneration' || phase === 'generatingScenario' || phase === 'extractingEntities';

  return (
    <main className="page">
      <div className="layout">
        <section className="layout-main stack">
          <PromptForm
            appName={envValidation.env.appName}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={runGenerateScenarioFlow}
            isLoading={isGeneratingScenario}
          />

          {scenarioText ? <ScenarioCard text={scenarioText} /> : null}

          {phase === 'extractingEntities' ? (
            <section className="card">
              <p>Extracting entities...</p>
            </section>
          ) : null}

          {phase === 'reviewingEntities' || phase === 'requestingSceneGeneration' || phase === 'pollingSceneGeneration' || phase === 'completed' || phase === 'failed' ? (
            <EntityEditor
              entities={entities}
              onChange={setEntities}
              onGenerateScene={runSceneGenerationFlow}
              disabled={isBusyForEntities}
            />
          ) : null}

          {phase === 'pollingSceneGeneration' ? (
            <section className="card">
              <p>Waiting for asset generation...</p>
            </section>
          ) : null}

          {finalScene?.assets?.scene?.glb_model?.url ? <SceneViewer url={finalScene.assets.scene.glb_model.url} /> : null}

          {finalScene ? <EntityAssetGrid assets={finalScene.assets.entities || []} /> : null}

        </section>

        <aside className="layout-side stack">
          <GenerationProgress phase={phase} jobStatus={jobStatus} />

          {error ? (
            <section className="card error-card">
              <h2>Flow Error</h2>
              <p>{error.message}</p>
              {error.code === 'POLL_TIMEOUT' && jobId ? (
                <button type="button" className="btn" onClick={retryPolling}>
                  Retry Polling
                </button>
              ) : null}
            </section>
          ) : null}

          <div className="actions">
            <button type="button" className="btn" onClick={resetFlow}>
              Restart Flow
            </button>
          </div>

          <DebugPanel
            prompt={prompt}
            generatedScenarioText={scenarioText}
            extractedEntitiesJson={rawExtractedEntities}
            imageRequestPayload={debugPayload}
            jobId={jobId}
            sceneId={sceneId}
            finalResponseJson={finalResponseJson}
          />
        </aside>
      </div>
    </main>
  );
}
