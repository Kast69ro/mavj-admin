import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { changeMyPassword } from '../features/auth/authApi';
import { ErrorBox, Field, inputClass } from './ContentModal';

const PasswordInput = ({ value, onChange, autoComplete, autoFocus }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

// Форма «старый / новый / повтор». Требования к паролю проверяет сервер, его текст показываем как есть
const ChangePasswordForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ old_password: '', new_password: '', repeat: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const mismatch = Boolean(form.repeat) && form.repeat !== form.new_password;
  const canSave = form.old_password && form.new_password && form.repeat && !mismatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        changeMyPassword({ old_password: form.old_password, new_password: form.new_password })
      ).unwrap();
      onSuccess?.();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Не удалось сменить пароль');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Старый пароль">
        <PasswordInput value={form.old_password} onChange={set('old_password')} autoComplete="current-password" autoFocus />
      </Field>
      <Field label="Новый пароль" hint="Не короче 8 символов">
        <PasswordInput value={form.new_password} onChange={set('new_password')} autoComplete="new-password" />
      </Field>
      <Field label="Повторите новый пароль">
        <PasswordInput value={form.repeat} onChange={set('repeat')} autoComplete="new-password" />
      </Field>
      {mismatch && <p className="text-xs text-red-600">Пароли не совпадают</p>}
      <ErrorBox>{error}</ErrorBox>
      <button
        type="submit"
        disabled={saving || !canSave}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
      >
        {saving ? 'Сохранение…' : 'Сменить пароль'}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
