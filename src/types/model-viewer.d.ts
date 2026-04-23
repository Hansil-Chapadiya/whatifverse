import type { CSSProperties, DetailedHTMLProps, HTMLAttributes, Ref } from 'react';

declare global {
  interface HTMLModelViewerElement extends HTMLElement {
    canActivateAR: boolean;
    activateAR: () => Promise<void>;
  }

  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'interaction-prompt'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
        style?: CSSProperties;
        ref?: Ref<HTMLModelViewerElement>;
      };
    }
  }
}

export {};
