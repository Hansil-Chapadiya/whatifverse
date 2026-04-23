import { EnvConfig } from './env';
import { requestJson } from './request';
import {
  ExtractEntitiesResponse,
  GenerateScenarioResponse,
  ImageServiceRequestPayload,
  JobResponse,
  SceneCreateResponse,
  SceneFetchResponse,
} from './types';

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}${path}`;
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function resolveServiceBase(base: string, service: 'ai' | 'image'): string {
  if (import.meta.env.DEV && isAbsoluteHttpUrl(base)) {
    return service === 'ai' ? '/__proxy_ai' : '/__proxy_image';
  }

  return base;
}

function withOptionalToken(token?: string): Record<string, string> {
  return token ? { token } : {};
}

export async function generateScenario(env: EnvConfig, prompt: string): Promise<GenerateScenarioResponse> {
  const url = joinUrl(resolveServiceBase(env.aiServiceBaseUrl, 'ai'), '/api/v1/ai/generate');
  return requestJson<GenerateScenarioResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withOptionalToken(env.aiServiceToken),
    },
    body: { prompt },
  });
}

export async function extractEntities(
  env: EnvConfig,
  modelResponse: string
): Promise<ExtractEntitiesResponse> {
  const url = joinUrl(resolveServiceBase(env.aiServiceBaseUrl, 'ai'), '/api/v1/ai/entities');
  return requestJson<ExtractEntitiesResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withOptionalToken(env.aiServiceToken),
    },
    body: { model_response: modelResponse },
  });
}

export async function createSceneAssets(
  env: EnvConfig,
  payload: ImageServiceRequestPayload
): Promise<SceneCreateResponse> {
  const url = joinUrl(resolveServiceBase(env.imageServiceBaseUrl, 'image'), '/api/v1/scenes/assets?mode=async');
  return requestJson<SceneCreateResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...withOptionalToken(env.imageServiceToken),
    },
    body: payload,
  });
}

export async function getJobStatus(env: EnvConfig, jobId: string): Promise<JobResponse> {
  const url = joinUrl(resolveServiceBase(env.imageServiceBaseUrl, 'image'), `/api/v1/jobs/${encodeURIComponent(jobId)}`);
  return requestJson<JobResponse>(url, {
    headers: withOptionalToken(env.imageServiceToken),
  });
}

export async function getSceneById(env: EnvConfig, sceneId: string): Promise<SceneFetchResponse> {
  const url = joinUrl(resolveServiceBase(env.imageServiceBaseUrl, 'image'), `/api/v1/scenes/${encodeURIComponent(sceneId)}`);
  return requestJson<SceneFetchResponse>(url, {
    headers: withOptionalToken(env.imageServiceToken),
  });
}
