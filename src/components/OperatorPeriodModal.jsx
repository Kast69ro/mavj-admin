import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';

// prizesCount — сколько призов у периода: включить период без призов нельзя
const OperatorPeriodModal = ({ period, prizesCount = period?.prizes_count ?? 0, onSave, onClose }) => {
  const isEdit = Boolean(period);
  const [form, setForm] = useState({
    name: period?.name ?? '',
    start_date: period?.start_date ?? '',
    end_date: period?.end_date ?? '',
    min_points: period?.min_points ?? 0,
    is_published: period?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canPublish = isEdit && prizesCount > 0;
  const datesInvalid = form.start_date && form.end_date && form.start_date > form.end_date;
  const minPoints = Number(form.min_points);
  const minPointsInvalid = form.min_points === '' || !Number.isInteger(minPoints) || minPoints < 0;
  // При редактировании дата окончания уже есть; при создании её можно не указывать —
  // тогда бэкенд посчитает её из длительности периода в настройках оператора
  const canSave =
    form.name.trim() && form.start_date && (form.end_date || !isEdit) && !datesInvalid && !minPointsInvalid;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        start_date: form.start_date,
        min_points: minPoints,
      };
      if (form.end_date) payload.end_date = form.end_date;
      if (isEdit) payload.is_published = form.is_published;
      await onSave(payload);
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
          <Field label="Дата окончания" hint={isEdit ? null : 'Пусто — по длительности из настроек'}>
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

        <Field label="Баллов для участия в розыгрыше" hint="0 — участвуют все">
          <input
            type="number"
            min={0}
            step={1}
            value={form.min_points}
            onChange={(e) => setForm({ ...form, min_points: e.target.value })}
            className={`${inputClass} max-w-[160px] ${minPointsInvalid ? 'border-red-400' : ''}`}
          />
        </Field>

        {isEdit ? (
          <label className={`flex items-start gap-2 text-sm ${canPublish || form.is_published ? '' : 'text-gray-400'}`}>
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.is_published}
              disabled={!canPublish && !form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            <span>
              Период включён
              <span className="block text-xs text-gray-400">
                {canPublish || form.is_published
                  ? 'Включённый период с призами показывается на сайте оператора'
                  : 'Чтобы включить период, добавьте хотя бы один приз'}
              </span>
            </span>
          </label>
        ) : (
          <p className="text-xs text-gray-400">
            Период создаётся выключенным. Добавьте призы и включите его на странице периода.
          </p>
        )}

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
