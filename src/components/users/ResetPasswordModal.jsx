import React, { useState } from 'react';
import { axiosRequest } from '../../utils/axiosInstance';
import { getErrorMessage } from '../../features/operatorContent/operatorContentApi';
import ContentModal, { ErrorBox, Field, inputClass } from '../ContentModal';
import { DEFAULT_PASSWORD } from './roleUtils';

// Сброс пароля суперадмином: пользователь обязан сменить его при следующем входе
const ResetPasswordModal = ({ user, onSaved, onClose }) => {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axiosRequest.put(`/users/${user.id}/password`, { password: password || DEFAULT_PASSWORD });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось сбросить пароль'));
      setSaving(false);
    }
  };

  return (
    <ContentModal title={`Сбросить пароль: ${user.username}`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Временный пароль" hint="Пользователь обязан сменить его при следующем входе">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={DEFAULT_PASSWORD}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <ErrorBox>{error}</ErrorBox>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : 'Сбросить пароль'}
        </button>
      </form>
    </ContentModal>
  );
};

export default ResetPasswordModal;
