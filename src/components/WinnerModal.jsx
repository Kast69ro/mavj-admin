import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';
import ImagePicker from './ImagePicker';
import { normalizeMsisdn } from '../utils/utils';

const WinnerModal = ({ winner, prizes, onSave, onClose }) => {
  const isEdit = Boolean(winner);
  const [form, setForm] = useState({
    msisdn: winner?.msisdn ?? '',
    name: winner?.name ?? '',
    place: winner?.place ?? '',
    prize_id: winner?.prize_id ?? '',
  });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const msisdn = normalizeMsisdn(form.msisdn);
  const msisdnInvalid = form.msisdn.trim() !== '' && !msisdn;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        msisdn,
        name: form.name.trim() || null,
        place: form.place === '' ? null : Number(form.place),
        prize_id: form.prize_id === '' ? null : Number(form.prize_id),
        photo,
      });
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить победителя');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? 'Редактировать победителя' : 'Новый победитель'} onClose={onClose}>
      <div className="space-y-4">
        <ImagePicker label="Фото" currentUrl={winner?.photo_url} file={photo} onChange={setPhoto} rounded="rounded-full" />
        <Field label="Номер абонента" hint="992XXXXXXXXX или 9 цифр без кода">
          <input
            type="tel"
            value={form.msisdn}
            onChange={(e) => setForm({ ...form, msisdn: e.target.value })}
            className={inputClass}
            placeholder="992901234567"
          />
        </Field>
        {msisdnInvalid && <p className="text-xs text-red-600">Неверный формат номера</p>}
        <Field label="Имя">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Место">
            <input
              type="number"
              min={1}
              value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Приз">
            <select
              value={form.prize_id}
              onChange={(e) => setForm({ ...form, prize_id: e.target.value })}
              className={inputClass}
            >
              <option value="">— без приза —</option>
              {prizes.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>
        </div>
        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || !msisdn}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default WinnerModal;
