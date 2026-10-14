import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';

const OperatorPeriodModal = ({ period, onSave, onClose }) => {
  const isEdit = Boolean(period);
  const [form, setForm] = useState({
    name: period?.name ?? '',
    start_date: period?.start_date ?? '',
    end_date: period?.end_date ?? '',
    is_published: period?.is_published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const datesInvalid = form.start_date && form.end_date && form.start_date > form.end_date;
  const canSave = form.name.trim() && form.start_date && form.end_date && !datesInvalid;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, name: form.name.trim() });
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить период');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? 'Редактировать период' : 'Новый период'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Название">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="Октябрь 2026"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата начала">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Дата окончания">
            <input
              type="date"
              value={form.end_date}
              min={form.start_date || undefined}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        {datesInvalid && <p className="text-xs text-red-600">Дата окончания раньше даты начала</p>}

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          <span>
            Опубликован
            <span className="block text-xs text-gray-400">Если снять — период станет черновиком и пропадёт с сайта оператора</span>
          </span>
        </label>

        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </ContentModal>
  );
};

export default OperatorPeriodModal;
