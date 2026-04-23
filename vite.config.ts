import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const aiTarget = env.VITE_AI_SERVICE_BASE_URL?.trim();
  const imageTarget = env.VITE_IMAGE_SERVICE_BASE_URL?.trim();

  return {
    plugins: [react()],
    server: {
      proxy: {
        ...(aiTarget
          ? {
              '/__proxy_ai': {
                target: aiTarget,
                changeOrigin: true,
                secure: true,
                rewrite: (path: string) => path.replace(/^\/__proxy_ai/, ''),
              },
            }
          : {}),
        ...(imageTarget
          ? {
              '/__proxy_image': {
                target: imageTarget,
                changeOrigin: true,
                secure: true,
                rewrite: (path: string) => path.replace(/^\/__proxy_image/, ''),
              },
            }
          : {}),
      },
    },
  };
});
