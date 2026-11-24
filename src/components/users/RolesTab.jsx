import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Lock, Save } from 'lucide-react';
import { axiosRequest } from '../../utils/axiosInstance';
import { getErrorMessage } from '../../features/operatorContent/operatorContentApi';
import { getOperatorColors, operatorName } from '../../utils/operatorColors';
import { ErrorBox } from '../ContentModal';
import { isSuperRole, permissionLabel, roleName } from './roleUtils';

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const toggle = (list, value) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

const CheckRow = ({ checked, onChange, disabled, children }) => (
  <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="w-4 h-4" />
    {children}
  </label>
);

const RoleEditor = ({ role, permissions, onSaved }) => {
  const operators = useSelector((state) => state.operators.all);
  const initialPerms = role.permissions || [];
  const initialOps = role.operators || [];
  const [perms, setPerms] = useState(initialPerms);
  const [ops, setOps] = useState(initialOps);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const locked = isSuperRole(role);
  const dirty = !sameSet(perms, initialPerms) || !sameSet(ops, initialOps);

  // Права и операторов роли, которых нет в справочнике, тоже показываем — иначе их нельзя было бы снять
  const permCodes = [...new Set([...permissions.map((p) => p.code), ...initialPerms])];
  const opCodes = [...new Set([...operators.map((o) => o.code), ...initialOps])];

  const change = (setter, value) => {
    setSaved(false);
    setter((list) => toggle(list, value));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosRequest.put(`/users/roles/${role.code}`, { permissions: perms, operators: ops });
      setSaved(true);
      await onSaved();
    } catch (e) {
      setError(getErrorMessage(e, 'Не удалось сохранить роль'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{roleName(role)}</h3>
        <p className="text-xs font-mono text-gray-400">{role.code}</p>
      </div>

      {locked ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Lock size={16} className="text-gray-400" /> Роль суперадмина не редактируется: ей доступно всё.
        </p>
      ) : (
        <>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Доступы</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-gray-100 rounded-lg p-4">
              {permCodes.map((c) => (
                <CheckRow key={c} checked={perms.includes(c)} onChange={() => change(setPerms, c)} disabled={saving}>
                  {permissionLabel(permissions, c)}
                </CheckRow>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Доступные операторы</h4>
            <p className="text-xs text-gray-400 mb-2">Ничего не выбрано — видны все операторы</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-gray-100 rounded-lg p-4">
              {opCodes.map((c) => (
                <CheckRow key={c} checked={ops.includes(c)} onChange={() => change(setOps, c)} disabled={saving}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getOperatorColors(c).bg }} />
                  {operators.find((o) => o.code === c)?.name ?? operatorName(c)}
                </CheckRow>
              ))}
            </div>
          </div>

          <ErrorBox>{error}</ErrorBox>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
            {dirty && !saving && (
              <button
                type="button"
                onClick={() => { setPerms(initialPerms); setOps(initialOps); setError(null); }}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Отменить изменения
              </button>
            )}
            {saved && !dirty && <span className="text-sm text-emerald-600">Сохранено</span>}
          </div>
        </>
      )}
    </section>
  );
};

// Вкладка «Роли»: доступы и операторы роли
const RolesTab = ({ roles, permissions, loading, onSaved }) => {
  const [selected, setSelected] = useState(null);
  const role = roles.find((r) => r.code === selected);

  if (roles.length === 0) {
    return <p className="text-sm text-gray-400">{loading ? 'Загрузка…' : 'Ролей нет'}</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-start">
      <ul className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-0.5">
        {roles.map((r) => (
          <li key={r.code}>
            <button
              type="button"
              onClick={() => setSelected(r.code)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left ${
                selected === r.code ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {roleName(r)}
              {isSuperRole(r) && <Lock size={14} className="text-gray-400" />}
            </button>
          </li>
        ))}
      </ul>
      {role ? (
        <RoleEditor key={role.code} role={role} permissions={permissions} onSaved={onSaved} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-400">
          Выберите роль, чтобы изменить её доступы
        </div>
      )}
    </div>
  );
};

export default RolesTab;
