import React, { useState } from 'react';
import ContentModal, { ErrorBox, Field, inputClass } from './ContentModal';

const ContactModal = ({ contact, onSave, onClose }) => {
  const isEdit = Boolean(contact);
  const [form, setForm] = useState({
    full_name: contact?.full_name ?? '',
    position: contact?.position ?? '',
    phone: contact?.phone ?? '',
    email: contact?.email ?? '',
    notes: contact?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        full_name: form.full_name.trim(),
        position: form.position.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      });
      onClose();
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Не удалось сохранить контакт');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? 'Редактировать контакт' : 'Новый ответственный'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="ФИО">
          <input type="text" value={form.full_name} onChange={set('full_name')} className={inputClass} autoFocus />
        </Field>
        <Field label="Должность">
          <input type="text" value={form.position} onChange={set('position')} className={inputClass} placeholder="Менеджер VAS" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Телефон">
            <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+992…" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          </Field>
        </div>
        <Field label="Заметки">
          <textarea rows={3} value={form.notes} onChange={set('notes')} className={inputClass} />
        </Field>
        <ErrorBox>{error}</ErrorBox>
        <button
          onClick={handleSave}
          disabled={saving || !form.full_name.trim()}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </ContentModal>
  );
};

export default ContactModal;
