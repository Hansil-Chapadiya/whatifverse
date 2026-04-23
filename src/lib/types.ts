export type FlowState =
  | 'idle'
  | 'generatingScenario'
  | 'extractingEntities'
  | 'reviewingEntities'
  | 'requestingSceneGeneration'
  | 'pollingSceneGeneration'
  | 'completed'
  | 'failed';

export interface GenerateScenarioRequest {
  prompt: string;
}

export interface GenerateScenarioResponse {
  generated_text: string;
}

export interface ExtractEntitiesRequest {
  model_response: string;
}

export interface ExtractEntitiesResponse {
  entities: string[];
}

export interface EditableEntity {
  id: string;
  name: string;
  position: [number, number, number];
  scale: number;
}

export interface ImageEntityPayload {
  name: string;
  position: [number, number, number];
  scale: number;
}

export interface ImageServiceRequestPayload {
  request_id: string;
  scene_title?: string;
  scenario_text: string;
  entities: ImageEntityPayload[];
  render_options: {
    style: string;
    format: 'png';
    width: number;
    height: number;
    negative_prompt: string;
    include_preview_assets: false;
  };
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface SceneCreateResponse {
  job_id: string;
  status: JobStatus;
  scene_id: string;
}

export interface AssetFileInfo {
  url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

export interface SceneAssetBundle {
  preview_image: string | null;
  glb_model: AssetFileInfo;
}

export interface EntityAssetBundle {
  name: string;
  position: [number, number, number];
  scale: number;
  preview_image: string | null;
  glb_model: AssetFileInfo;
}

export interface SceneResult {
  scene_id: string;
  status: 'completed';
  scene_title: string;
  scenario_text: string;
  assets: {
    scene: SceneAssetBundle;
    entities: EntityAssetBundle[];
  };
  idempotent_replay: boolean;
}

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  scene_id: string;
  result: SceneResult | null;
  error: unknown;
}

export interface SceneFetchResponse {
  scene_id: string;
  status: string;
  scene_title: string;
  scenario_text: string;
  assets: {
    scene: SceneAssetBundle;
    entities: EntityAssetBundle[];
  };
  idempotent_replay?: boolean;
}

export interface NormalizedAppError {
  code:
    | 'SETUP_ERROR'
    | 'NETWORK_ERROR'
    | 'HTTP_ERROR'
    | 'INVALID_RESPONSE'
    | 'POLL_TIMEOUT'
    | 'JOB_FAILED'
    | 'UNKNOWN_ERROR';
  message: string;
  status?: number;
  details?: unknown;
}
