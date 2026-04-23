import { EditableEntity, ImageServiceRequestPayload, NormalizedAppError, SceneResult } from './types';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function mapEntityStringsToEditable(entities: string[]): EditableEntity[] {
  return entities
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({
      id: generateRequestId(),
      name,
      position: [0, 0, 0] as [number, number, number],
      scale: 1,
    }));
}

export function buildScenePayload(
  prompt: string,
  scenarioText: string,
  entities: EditableEntity[]
): ImageServiceRequestPayload {
  return {
    request_id: generateRequestId(),
    scene_title: prompt.trim().slice(0, 80) || undefined,
    scenario_text: scenarioText,
    entities: entities.map((entity) => ({
      name: entity.name.trim(),
      position: [0, 0, 0],
      scale: entity.scale,
    })),
    render_options: {
      style: 'cinematic 3d render',
      format: 'png',
      width: 1024,
      height: 1024,
      negative_prompt: 'blur, watermark, text',
      include_preview_assets: false,
    },
  };
}

export function isSceneResult(value: unknown): value is SceneResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const result = value as Record<string, unknown>;
  const assets = result.assets as Record<string, unknown> | undefined;
  const scene = assets?.scene as Record<string, unknown> | undefined;
  const glbModel = scene?.glb_model as Record<string, unknown> | undefined;

  return (
    typeof result.scene_id === 'string' &&
    result.status === 'completed' &&
    typeof result.scenario_text === 'string' &&
    !!assets &&
    !!scene &&
    !!glbModel &&
    typeof glbModel.url === 'string'
  );
}

export function formatError(error: NormalizedAppError | null): string {
  if (!error) {
    return '';
  }

  return error.message || 'An error occurred.';
}
