import { ChangeEvent, FormEvent } from 'react';

interface PromptFormProps {
  appName: string;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const EXAMPLES = [
  'What if Mars had oceans?',
  'What if Earth was closer to the Sun?',
  'What if humans were aliens?',
];

export function PromptForm({ appName, prompt, onPromptChange, onSubmit, isLoading }: PromptFormProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(event.target.value);
  };

  return (
    <section className="card">
      <h1>{appName}</h1>
      <p className="subtitle">Explore alternate realities in AR</p>
      <form onSubmit={handleSubmit} className="stack-sm">
        <label htmlFor="prompt">What if prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Type your alternate reality prompt"
          rows={5}
          required
        />
        <div className="examples">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              className="chip"
              onClick={() => onPromptChange(example)}
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Generating scenario...' : 'Generate Scenario'}
        </button>
      </form>
    </section>
  );
}
