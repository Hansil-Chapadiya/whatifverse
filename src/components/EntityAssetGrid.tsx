import { EntityAssetBundle } from '../lib/types';

interface EntityAssetGridProps {
  assets: EntityAssetBundle[];
}

export function EntityAssetGrid({ assets }: EntityAssetGridProps) {
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.alert('Could not copy URL from browser clipboard API.');
    }
  };

  return (
    <section className="card">
      <h2>Secondary Entity Assets (GLBs)</h2>
      {assets.length === 0 ? <p className="muted">No entity GLBs were returned.</p> : null}
      <div className="entity-grid">
        {assets.map((asset) => (
          <article className="entity-asset-card" key={`${asset.name}_${asset.glb_model.public_id}`}>
            <h3>{asset.name}</h3>
            <p className="muted">Scale: {asset.scale}</p>
            <p className="muted">Position: [{asset.position.join(', ')}]</p>
            <model-viewer
              src={asset.glb_model.url}
              alt={asset.name}
              camera-controls
              auto-rotate
              style={{ width: '100%', height: '220px', background: '#0f172a', borderRadius: '12px' }}
            />
            <button type="button" className="btn" onClick={() => copyUrl(asset.glb_model.url)}>
              Copy URL
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
