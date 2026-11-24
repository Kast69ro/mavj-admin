import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Pencil, KeyRound, Trash2 } from 'lucide-react';
import { axiosRequest } from '../utils/axiosInstance';
import { fetchOperators } from '../features/operators/operators';
import { getErrorMessage } from '../features/operatorContent/operatorContentApi';
import { formatDay } from '../utils/utils';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';
import UserModal from '../components/users/UserModal';
import ResetPasswordModal from '../components/users/ResetPasswordModal';
import RolesTab from '../components/users/RolesTab';

const TABS = [
  { key: 'users', label: 'Пользователи' },
  { key: 'roles', label: 'Роли' },
];

const Th = ({ children, right }) => (
  <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase ${right ? 'text-right' : 'text-left'}`}>{children}</th>
);

// Раздел «Пользователи» (только it): пользователи и роли. Доступы задаются ролью
const UsersPage = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // { user } | { user: null }
  const [passwordUser, setPasswordUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        axiosRequest.get('/users'),
        axiosRequest.get('/users/roles'),
        axiosRequest.get('/users/permissions'),
      ]);
      setUsers(usersRes.data.users || []);
      setRoles(rolesRes.data.roles ?? (Array.isArray(rolesRes.data) ? rolesRes.data : []));
      setPermissions(permsRes.data.permissions || []);
    } catch (e) {
      setError(getErrorMessage(e, 'Не удалось загрузить пользователей (нужны права суперадмина)'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    dispatch(fetchOperators({ all: true })); // названия операторов для ролей
  }, [load, dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await axiosRequest.delete(`/users/${confirm.id}`);
      setConfirm(null);
      load();
    } catch (e) {
      setDeleteError(getErrorMessage(e, 'Не удалось удалить пользователя'));
    } finally {
      setDeleting(false);
    }
  };

  const roleLabel = (u) =>
    u.role_name || roles.find((r) => r.code === u.role)?.name_ru || u.role || (u.is_superadmin ? 'Суперадмин' : '—');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Пользователи админки</h2>
        {tab === 'users' && (
          <button
            onClick={() => setModal({ user: null })}
            disabled={roles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Добавить
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ErrorBox>{error}</ErrorBox>

      {tab === 'roles' && <RolesTab roles={roles} permissions={permissions} loading={loading} onSaved={load} />}

      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="bg-gray-50">
                <Th>Логин</Th>
                <Th>ФИО</Th>
                <Th>Телефон</Th>
                <Th>Дата рождения</Th>
                <Th>Роль</Th>
                <Th right>Действия</Th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">Загрузка…</td></tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">Нет пользователей</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">
                    {u.username}
                    {u.must_change_password && (
                      <span className="block w-fit mt-1 px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-xs font-medium whitespace-nowrap">
                        должен сменить пароль
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.full_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDay(u.birth_date) || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        u.is_superadmin || u.role === 'it' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {roleLabel(u)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModal({ user: u })} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setPasswordUser(u)} title="Сбросить пароль" className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded">
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => { setDeleteError(null); setConfirm(u); }}
                        title="Удалить"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <UserModal
          user={modal.user}
          roles={roles}
          permissions={permissions}
          onSaved={load}
          onClose={() => setModal(null)}
        />
      )}

      {passwordUser && (
        <ResetPasswordModal user={passwordUser} onSaved={load} onClose={() => setPasswordUser(null)} />
      )}

      {confirm && (
        <ConfirmModal
          title="Удалить пользователя?"
          message={`Пользователь ${confirm.username} больше не сможет войти в админку.`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
