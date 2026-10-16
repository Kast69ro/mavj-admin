import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';

// available — сколько % ещё можно отдать этому партнёру (с учётом его текущей доли)
const PartnerModal = ({ partner, available, onSave, onClose }) => {
  const isEdit = Boolean(partner);
  const [form, setForm] = useState({
    name: partner?.name ?? '',
    share_pct: partner?.share_pct ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const share = Number(form.share_pct);
  const shareInvalid = form.share_pct === '' || !Number.isFinite(share) || share <= 0 || share > 100;
  const overLimit = !shareInvalid && share > available + 1e-9;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: form.name.trim(), share_pct: share });
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить партнёра');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? 'Редактировать партнёра' : 'Новый партнёр'} onClose={onClose} size="sm">
      <div className="space-y-4">
        <Field label="Название / имя">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            autoFocus
          />
        </Field>
        <Field label="Доля, %" hint={`Свободно: ${Number(available.toFixed(2))}%`}>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={form.share_pct}
            onChange={(e) => setForm({ ...form, share_pct: e.target.value })}
            className={inputClass}
          />
        </Field>
        {overLimit && <p className="text-xs text-red-600">Больше, чем осталось нераспределённым</p>}
        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim() || shareInvalid || overLimit}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default PartnerModal;
