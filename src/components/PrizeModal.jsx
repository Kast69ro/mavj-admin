import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';
import ImagePicker from './ImagePicker';

const PrizeModal = ({ prize, nextSortOrder = 0, onSave, onClose }) => {
  const isEdit = Boolean(prize);
  const [form, setForm] = useState({
    title: prize?.title ?? '',
    description: prize?.description ?? '',
    sort_order: prize?.sort_order ?? nextSortOrder,
    cost: prize?.cost ?? '',
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const costInvalid = form.cost !== '' && !(Number(form.cost) >= 0);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        cost: form.cost === '' ? null : Number(form.cost),
        image,
      });
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить приз');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? 'Редактировать приз' : 'Новый приз'} onClose={onClose}>
      <div className="space-y-4">
        <ImagePicker label="Фото приза" currentUrl={prize?.image_url} file={image} onChange={setImage} />
        <Field label="Название">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="iPhone 17"
          />
        </Field>
        <Field label="Описание">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Стоимость, TJS" hint="Попадёт в расходы оператора (категория «Призы») в месяце окончания периода">
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
            className={`${inputClass} ${costInvalid ? 'border-red-400' : ''}`}
          />
        </Field>
        <Field label="Порядок показа" hint="Меньше — выше в списке">
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            className={inputClass}
          />
        </Field>
        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || !form.title.trim() || costInvalid}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default PrizeModal;
