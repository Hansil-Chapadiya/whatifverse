var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var _b, _c;
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    var aiTarget = (_b = env.VITE_AI_SERVICE_BASE_URL) === null || _b === void 0 ? void 0 : _b.trim();
    var imageTarget = (_c = env.VITE_IMAGE_SERVICE_BASE_URL) === null || _c === void 0 ? void 0 : _c.trim();
    return {
        plugins: [react()],
        server: {
            proxy: __assign(__assign({}, (aiTarget
                ? {
                    '/__proxy_ai': {
                        target: aiTarget,
                        changeOrigin: true,
                        secure: true,
                        rewrite: function (path) { return path.replace(/^\/__proxy_ai/, ''); },
                    },
                }
                : {})), (imageTarget
                ? {
                    '/__proxy_image': {
                        target: imageTarget,
                        changeOrigin: true,
                        secure: true,
                        rewrite: function (path) { return path.replace(/^\/__proxy_image/, ''); },
                    },
                }
                : {})),
        },
    };
});
