import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { axiosRequest } from '../../utils/axiosInstance';
import { getErrorMessage } from '../../features/operatorContent/operatorContentApi';
import { operatorName } from '../../utils/operatorColors';
import { today } from '../../utils/utils';
import ContentModal, { ErrorBox, Field, inputClass } from '../ContentModal';
import { DEFAULT_PASSWORD, isSuperRole, permissionLabel, roleName } from './roleUtils';

// Доступы выбранной роли — только для чтения (меняются на вкладке «Роли»)
const RoleAccess = ({ role, permissions }) => {
  const operators = useSelector((state) => state.operators.all);
  if (!role) return null;
  if (isSuperRole(role)) {
    return <p className="text-xs text-gray-500">Полный доступ ко всем разделам, включая управление пользователями.</p>;
  }
  const codes = role.permissions || [];
  const limited = role.operators || [];
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2">
      <div className="flex flex-wrap gap-1">
        {codes.length === 0 && <span className="text-xs text-gray-400">Нет доступа ни к одному разделу</span>}
        {codes.map((c) => (
          <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
            {permissionLabel(permissions, c)}
          </span>
        ))}
      </div>
      {codes.length > 0 && (
        <p className="text-xs text-gray-500">
          Операторы:{' '}
          {limited.length
            ? limited.map((c) => operators.find((o) => o.code === c)?.name ?? operatorName(c)).join(', ')
            : 'все'}
        </p>
      )}
    </div>
  );
};

const UserModal = ({ user, roles, permissions, onSaved, onClose }) => {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    username: user?.username ?? '',
    password: '',
    full_name: user?.full_name ?? '',
    phone: user?.phone ?? '',
    birth_date: user?.birth_date ?? '',
    role: user?.role ?? (isEdit ? '' : 'none'),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const role = roles.find((r) => r.code === form.role);
  const canSave = (isEdit || form.username.trim()) && form.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await axiosRequest.put(`/users/${user.id}`, {
          full_name: form.full_name.trim() || null,
          // пустая строка очищает поле
          phone: form.phone.trim(),
          birth_date: form.birth_date,
          role: form.role,
        });
      } else {
        await axiosRequest.post('/users', {
          username: form.username.trim(),
          password: form.password || null,
          full_name: form.full_name.trim() || null,
          phone: form.phone.trim() || null,
          birth_date: form.birth_date || null,
          role: form.role,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, isEdit ? 'Не удалось обновить пользователя' : 'Не удалось создать пользователя'));
      setSaving(false);
    }
  };

  return (
    <ContentModal title={isEdit ? `Редактировать: ${user.username}` : 'Новый пользователь'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Логин">
          <input
            type="text"
            value={form.username}
            onChange={set('username')}
            disabled={isEdit}
            autoFocus={!isEdit}
            autoComplete="off"
            className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-500`}
          />
        </Field>
        {!isEdit && (
          <Field
            label="Пароль"
            hint={`Необязательно. Пусто — ${DEFAULT_PASSWORD}, при первом входе пользователь обязан его сменить`}
          >
            <input type="text" value={form.password} onChange={set('password')} autoComplete="off" className={inputClass} />
          </Field>
        )}
        <Field label="ФИО">
          <input
            type="text"
            value={form.full_name}
            onChange={set('full_name')}
            className={inputClass}
            placeholder="Иванов Иван Иванович"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Телефон">
            <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+992…" />
          </Field>
          <Field label="Дата рождения">
            <input type="date" value={form.birth_date} max={today()} onChange={set('birth_date')} className={inputClass} />
          </Field>
        </div>
        <Field label="Роль">
          <select value={form.role} onChange={set('role')} className={inputClass}>
            {!role && <option value={form.role}>{form.role || 'Выберите роль'}</option>}
            {roles.map((r) => (
              <option key={r.code} value={r.code}>{roleName(r)}</option>
            ))}
          </select>
        </Field>
        <RoleAccess role={role} permissions={permissions} />

        <ErrorBox>{error}</ErrorBox>
        <button
          type="submit"
          disabled={saving || !canSave}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </form>
    </ContentModal>
  );
};

export default UserModal;
