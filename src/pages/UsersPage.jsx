import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, KeyRound, Trash2, X } from 'lucide-react';
import { axiosRequest } from '../utils/axiosInstance';

const emptyForm = { username: '', password: '', full_name: '', is_superadmin: false, permissions: [] };

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, permsRes] = await Promise.all([
        axiosRequest.get('/users'),
        axiosRequest.get('/users/permissions'),
      ]);
      setUsers(usersRes.data.users || []);
      setPermissions(permsRes.data.permissions || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось загрузить пользователей (нужны права суперадмина)');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePerm = (code) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(code)
        ? f.permissions.filter((p) => p !== code)
        : [...f.permissions, code],
    }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setShowCreate(true);
  };

  const openEdit = (u) => {
    setForm({
      username: u.username,
      password: '',
      full_name: u.full_name || '',
      is_superadmin: u.is_superadmin,
      permissions: u.permissions || [],
    });
    setEditUser(u);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosRequest.post('/users', {
        username: form.username,
        password: form.password,
        full_name: form.full_name || null,
        is_superadmin: form.is_superadmin,
        permissions: form.permissions,
      });
      setShowCreate(false);
      load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось создать пользователя');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosRequest.put(`/users/${editUser.id}`, {
        full_name: form.full_name || null,
        is_superadmin: form.is_superadmin,
        permissions: form.permissions,
      });
      setEditUser(null);
      load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось обновить пользователя');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosRequest.put(`/users/${passwordUser.id}/password`, { password: newPassword });
      setPasswordUser(null);
      setNewPassword('');
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось сменить пароль');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Удалить пользователя ${u.username}?`)) return;
    setError(null);
    try {
      await axiosRequest.delete(`/users/${u.id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось удалить пользователя');
    }
  };

  const permLabel = (code) => permissions.find((p) => p.code === code)?.label_ru || code;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Пользователи админки</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Логин</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Разрешения</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">Загрузка…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">Нет пользователей</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium">{u.username}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.full_name || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  {u.is_superadmin ? (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Суперадмин</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Обычный</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {u.is_superadmin ? (
                    <span className="text-gray-400 text-xs">всё</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(u.permissions || []).length === 0 && <span className="text-gray-400 text-xs">нет доступа</span>}
                      {(u.permissions || []).map((p) => (
                        <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {permLabel(p)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(u)} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setPasswordUser(u)} title="Сменить пароль" className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded">
                      <KeyRound size={16} />
                    </button>
                    <button onClick={() => handleDelete(u)} title="Удалить" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showCreate || editUser) && (
        <Modal
          title={editUser ? `Редактировать: ${editUser.username}` : 'Новый пользователь'}
          onClose={() => { setShowCreate(false); setEditUser(null); }}
        >
          <div className="space-y-4">
            {!editUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_superadmin}
                onChange={(e) => setForm({ ...form, is_superadmin: e.target.checked })}
              />
              Суперадмин (полный доступ ко всему, включая управление пользователями)
            </label>

            {!form.is_superadmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Разрешённые разделы</label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto border border-gray-100 rounded-lg p-3">
                  {permissions.map((p) => (
                    <label key={p.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(p.code)}
                        onChange={() => togglePerm(p.code)}
                      />
                      {p.label_ru}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={editUser ? handleUpdate : handleCreate}
              disabled={saving || (!editUser && (!form.username || !form.password))}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Сохранение…' : editUser ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </Modal>
      )}

      {passwordUser && (
        <Modal title={`Смена пароля: ${passwordUser.username}`} onClose={() => { setPasswordUser(null); setNewPassword(''); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={saving || !newPassword}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Сохранение…' : 'Сменить пароль'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;
