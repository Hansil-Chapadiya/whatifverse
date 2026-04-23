interface DebugPanelProps {
  prompt: string;
  generatedScenarioText: string;
  extractedEntitiesJson: unknown;
  imageRequestPayload: unknown;
  jobId: string;
  sceneId: string;
  finalResponseJson: unknown;
}

function JsonBlock({ value }: { value: unknown }) {
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}

export function DebugPanel({
  prompt,
  generatedScenarioText,
  extractedEntitiesJson,
  imageRequestPayload,
  jobId,
  sceneId,
  finalResponseJson,
}: DebugPanelProps) {
  return (
    <details className="card debug-panel">
      <summary>Debug / Prototype Panel</summary>
      <div className="debug-grid">
        <div>
          <h4>Prompt</h4>
          <pre>{prompt || '(empty)'}</pre>
        </div>
        <div>
          <h4>Generated Scenario Text</h4>
          <pre>{generatedScenarioText || '(empty)'}</pre>
        </div>
        <div>
          <h4>Extracted Entities JSON</h4>
          <JsonBlock value={extractedEntitiesJson} />
        </div>
        <div>
          <h4>Image-Service Request Payload</h4>
          <JsonBlock value={imageRequestPayload} />
        </div>
        <div>
          <h4>Job ID</h4>
          <pre>{jobId || '(none)'}</pre>
        </div>
        <div>
          <h4>Scene ID</h4>
          <pre>{sceneId || '(none)'}</pre>
        </div>
        <div>
          <h4>Final Response JSON</h4>
          <JsonBlock value={finalResponseJson} />
        </div>
      </div>
    </details>
  );
}
