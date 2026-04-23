import { ChangeEvent } from 'react';
import { EditableEntity } from '../lib/types';

interface EntityEditorProps {
  entities: EditableEntity[];
  onChange: (next: EditableEntity[]) => void;
  onGenerateScene: () => void;
  disabled: boolean;
}

export function EntityEditor({ entities, onChange, onGenerateScene, disabled }: EntityEditorProps) {
  const updateEntity = (id: string, patch: Partial<EditableEntity>) => {
    onChange(entities.map((entity) => (entity.id === id ? { ...entity, ...patch } : entity)));
  };

  const removeEntity = (id: string) => {
    onChange(entities.filter((entity) => entity.id !== id));
  };

  const addEntity = () => {
    onChange([
      ...entities,
      {
        id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: 'New Entity',
        position: [0, 0, 0],
        scale: 1,
      },
    ]);
  };

  const handleNameChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    updateEntity(id, { name: event.target.value });
  };

  const handleScaleChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    updateEntity(id, { scale: Number.isFinite(next) && next > 0 ? next : 1 });
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>Entity Review</h2>
        <button type="button" className="btn" onClick={addEntity} disabled={disabled}>
          Add Entity
        </button>
      </div>

      <div className="entity-list">
        {entities.length === 0 ? <p className="muted">No entities. Add at least one if needed.</p> : null}

        {entities.map((entity) => (
          <div key={entity.id} className="entity-card">
            <label>
              Name
              <input
                type="text"
                value={entity.name}
                onChange={(event) => handleNameChange(entity.id, event)}
                disabled={disabled}
              />
            </label>

            <label>
              Scale
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={entity.scale}
                onChange={(event) => handleScaleChange(entity.id, event)}
                disabled={disabled}
              />
            </label>

            <p className="muted">Position: [0, 0, 0]</p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeEntity(entity.id)}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary" onClick={onGenerateScene} disabled={disabled}>
        Generate AR Scene
      </button>
    </section>
  );
}
