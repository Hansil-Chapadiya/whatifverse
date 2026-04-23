import { useEffect, useRef, useState } from 'react';

interface SceneViewerProps {
  url: string;
}

export function SceneViewer({ url }: SceneViewerProps) {
  const modelRef = useRef<HTMLModelViewerElement | null>(null);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    const node = modelRef.current;
    if (!node) {
      return;
    }

    const checkSupport = () => {
      setArSupported(Boolean(node.canActivateAR));
    };

    checkSupport();
    node.addEventListener('load', checkSupport);

    return () => {
      node.removeEventListener('load', checkSupport);
    };
  }, [url]);

  const handlePlaceInAR = async () => {
    if (!modelRef.current || !modelRef.current.canActivateAR) {
      return;
    }

    await modelRef.current.activateAR();
  };

  return (
    <section className="card result-card">
      <h2>Primary Scenario Asset (Animated GLB)</h2>
      <model-viewer
        ref={modelRef}
        src={url}
        alt="Generated scenario"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        interaction-prompt="auto"
        shadow-intensity="1"
        exposure="1"
        style={{ width: '100%', height: '420px', background: '#111827', borderRadius: '16px' }}
      />

      {arSupported ? (
        <button type="button" className="btn btn-primary btn-strong" onClick={handlePlaceInAR}>
          Place In AR
        </button>
      ) : (
        <p className="warning">AR is not supported on this device/browser. 3D preview is still available.</p>
      )}
    </section>
  );
}
