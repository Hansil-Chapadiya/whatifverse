import { NormalizedAppError } from './types';

export class RequestError extends Error {
  public readonly normalized: NormalizedAppError;

  constructor(normalized: NormalizedAppError) {
    super(normalized.message);
    this.name = 'RequestError';
    this.normalized = normalized;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

function safeParseJson(input: string): unknown {
  if (!input) {
    return null;
  }

  try {
    return JSON.parse(input);
  } catch {
    throw new RequestError({
      code: 'INVALID_RESPONSE',
      message: 'Backend returned invalid JSON.',
    });
  }
}

function extractBackendError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const maybeError = (payload as Record<string, unknown>).error;
  if (typeof maybeError === 'string' && maybeError.trim()) {
    return maybeError;
  }

  if (maybeError && typeof maybeError === 'object') {
    const message = (maybeError as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  const message = (payload as Record<string, unknown>).message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return undefined;
}

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Network request failed.';
    const isLikelyCors = /failed to fetch|load failed|networkerror/i.test(rawMessage);

    throw new RequestError({
      code: 'NETWORK_ERROR',
      message: isLikelyCors
        ? 'Network request failed. This is often caused by CORS/preflight policy on the API server. In local development, run through the Vite dev server proxy.'
        : rawMessage,
      details: error,
    });
  }

  const text = await response.text();
  const payload = safeParseJson(text);

  if (!response.ok) {
    throw new RequestError({
      code: 'HTTP_ERROR',
      message: extractBackendError(payload) ?? `Request failed with status ${response.status}.`,
      status: response.status,
      details: payload,
    });
  }

  return payload as T;
}

export function toAppError(error: unknown): NormalizedAppError {
  if (error instanceof RequestError) {
    return error.normalized;
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: error,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
    details: error,
  };
}
