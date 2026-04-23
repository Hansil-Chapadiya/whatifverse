interface ScenarioCardProps {
  text: string;
}

export function ScenarioCard({ text }: ScenarioCardProps) {
  if (!text) {
    return null;
  }

  return (
    <section className="card">
      <h2>Generated Scenario</h2>
      <p className="scenario-text">{text}</p>
    </section>
  );
}
