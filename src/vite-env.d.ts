interface ImportMetaEnv {
	readonly DEV: boolean;
	readonly VITE_APP_NAME?: string;
	readonly VITE_AI_SERVICE_BASE_URL?: string;
	readonly VITE_AI_SERVICE_TOKEN?: string;
	readonly VITE_IMAGE_SERVICE_BASE_URL?: string;
	readonly VITE_IMAGE_SERVICE_TOKEN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
