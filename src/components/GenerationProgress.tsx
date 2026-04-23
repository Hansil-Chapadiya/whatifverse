import { FlowState, JobStatus } from '../lib/types';

interface GenerationProgressProps {
  phase: FlowState;
  jobStatus?: JobStatus;
}

interface Step {
  key: string;
  label: string;
  active: boolean;
  done: boolean;
}

export function GenerationProgress({ phase, jobStatus }: GenerationProgressProps) {
  const steps: Step[] = [
    {
      key: 'scenario',
      label: 'Scenario ready',
      active: phase === 'generatingScenario',
      done: ['extractingEntities', 'reviewingEntities', 'requestingSceneGeneration', 'pollingSceneGeneration', 'completed'].includes(phase),
    },
    {
      key: 'entities',
      label: 'Entities ready',
      active: phase === 'extractingEntities',
      done: ['reviewingEntities', 'requestingSceneGeneration', 'pollingSceneGeneration', 'completed'].includes(phase),
    },
    {
      key: 'requested',
      label: 'Scene generation requested',
      active: phase === 'requestingSceneGeneration',
      done: ['pollingSceneGeneration', 'completed'].includes(phase),
    },
    {
      key: 'waiting',
      label: 'Waiting for asset generation',
      active: phase === 'pollingSceneGeneration',
      done: phase === 'completed',
    },
    {
      key: 'ready',
      label: 'Scene ready',
      active: phase === 'completed',
      done: phase === 'completed',
    },
  ];

  return (
    <section className="card">
      <h2>Generation Progress</h2>
      <ul className="progress-list">
        {steps.map((step) => (
          <li key={step.key} className={`progress-item ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
      {phase === 'pollingSceneGeneration' ? (
        <p className="muted">Job status: {jobStatus ?? 'queued'}</p>
      ) : null}
    </section>
  );
}
