export interface EnvConfig {
  appName: string;
  aiServiceBaseUrl: string;
  aiServiceToken?: string;
  imageServiceBaseUrl: string;
  imageServiceToken?: string;
}

export interface EnvValidationResult {
  ok: boolean;
  env: EnvConfig;
  missing: string[];
}

const trim = (value: string | undefined): string => (value ?? '').trim();

export function readEnv(): EnvConfig {
  const appName = trim(import.meta.env.VITE_APP_NAME);
  const aiServiceBaseUrl = trim(import.meta.env.VITE_AI_SERVICE_BASE_URL);
  const aiServiceToken = trim(import.meta.env.VITE_AI_SERVICE_TOKEN);
  const imageServiceBaseUrl = trim(import.meta.env.VITE_IMAGE_SERVICE_BASE_URL);
  const imageServiceToken = trim(import.meta.env.VITE_IMAGE_SERVICE_TOKEN);

  return {
    appName,
    aiServiceBaseUrl,
    aiServiceToken: aiServiceToken || undefined,
    imageServiceBaseUrl,
    imageServiceToken: imageServiceToken || undefined,
  };
}

export function validateEnv(): EnvValidationResult {
  const env = readEnv();
  const missing: string[] = [];

  if (!env.appName) {
    missing.push('VITE_APP_NAME');
  }

  if (!env.aiServiceBaseUrl) {
    missing.push('VITE_AI_SERVICE_BASE_URL');
  }

  if (!env.imageServiceBaseUrl) {
    missing.push('VITE_IMAGE_SERVICE_BASE_URL');
  }

  return {
    ok: missing.length === 0,
    env,
    missing,
  };
}
