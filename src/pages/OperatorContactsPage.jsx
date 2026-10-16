import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import {
  fetchOperatorContacts,
  saveOperatorContact,
  deleteOperatorContact,
} from '../features/operatorContent/operatorContentApi';
import ContactModal from '../components/ContactModal';
import { ConfirmModal, ErrorBox } from '../components/ContentModal';

// Вкладка «Ответственные»: контактные лица со стороны оператора
const OperatorContactsPage = () => {
  const dispatch = useDispatch();
  const { operator } = useOutletContext();
  const { code } = operator;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { contact } | { contact: null }
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispatch(fetchOperatorContacts(code)).unwrap();
      setContacts(data?.contacts || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dispatch, code]);

  useEffect(() => {
    setContacts([]);
    load();
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteOperatorContact(confirm.id)).unwrap();
      setConfirm(null);
      load();
    } catch (e) {
      setDeleteError(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Ответственные люди</h3>
        <button
          onClick={() => setModal({ contact: null })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      <ErrorBox>{error}</ErrorBox>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Должность</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Контакты</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заметки</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading && contacts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">Загрузка…</td></tr>
            )}
            {!loading && !error && contacts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">Ответственные не добавлены</td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 align-top">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.position || '—'}</td>
                <td className="px-4 py-3 text-sm space-y-1">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 whitespace-nowrap">
                      <Phone size={13} className="text-gray-400" /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 break-all">
                      <Mail size={13} className="text-gray-400 shrink-0" /> {c.email}
                    </a>
                  )}
                  {!c.phone && !c.email && <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-pre-line max-w-xs">{c.notes || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal({ contact: c })} title="Редактировать" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => { setDeleteError(null); setConfirm(c); }}
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

      {modal && (
        <ContactModal
          contact={modal.contact}
          onSave={async (data) => {
            await dispatch(saveOperatorContact({ code, id: modal.contact?.id, ...data })).unwrap();
            load();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title="Удалить контакт?"
          message={`${confirm.full_name} будет удалён из списка ответственных.`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default OperatorContactsPage;
