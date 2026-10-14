import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';

const isValidRulesUrl = (v) => v === '' || /^(https?:\/\/|\/)/i.test(v);

const OperatorRulesModal = ({ operator, onSave, onClose }) => {
  const [value, setValue] = useState(operator.rules_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const trimmed = value.trim();
  const invalid = !isValidRulesUrl(trimmed);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить ссылку');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={`Регламент: ${operator.name}`} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Ссылка на регламент" hint="http://, https:// или путь, начинающийся с /. Пустое поле — убрать ссылку.">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
            placeholder="https://…"
            autoFocus
          />
        </Field>
        {invalid && <p className="text-xs text-red-600">Ссылка должна начинаться с http://, https:// или /</p>}
        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || invalid}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default OperatorRulesModal;
