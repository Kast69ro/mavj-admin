import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  PAGE_SIZE,
  deleteDocument,
  fetchDocumentTypes,
  fetchDocuments,
  updateDocument,
  uploadDocument,
} from '../../features/documents/documentsApi';
import { useAccess } from '../../utils/permissions';
import ContentModal, { ConfirmModal, ErrorBox } from '../ContentModal';
import Pager from '../Pager';
import DocumentForm from './DocumentForm';
import DocumentsTable from './DocumentsTable';

// Вкладка «Документы» в «Настройках»: загрузка, изменение и удаление.
// owner="operator" + operator — документы оператора, owner="company" — наши
const DocumentsManager = ({ owner, operator }) => {
  const { can } = useAccess();
  const canUpload = can('documents_upload');
  const canDelete = can('documents_delete');

  const [types, setTypes] = useState([]);
  const [typesError, setTypesError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setTypesError(null);
    fetchDocumentTypes(owner)
      .then((list) => !cancelled && setTypes(list))
      .catch((e) => !cancelled && setTypesError(e.message));
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const load = useCallback(
    async (targetPage) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDocuments({ owner, operator, page: targetPage });
        if (id !== requestId.current) return;
        setDocuments(data.items);
        setTotal(data.total);
        // Удалили последний документ на странице — возвращаемся на предыдущую
        if (data.items.length === 0 && targetPage > 1) setPage(targetPage - 1);
      } catch (e) {
        if (id !== requestId.current) return;
        setDocuments([]);
        setTotal(0);
        setError(e.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [owner, operator]
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  // Новый документ — сверху первой страницы
  const reloadFirst = () => (page === 1 ? load(1) : setPage(1));

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDocument(confirm.id);
      setConfirm(null);
      load(page);
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Документы</h3>
        {canUpload && !uploadOpen && (
          <button
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> Загрузить документ
          </button>
        )}
      </div>

      {canUpload && uploadOpen && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-800 mb-4">Загрузка документа</h4>
          <DocumentForm
            types={types}
            typesError={typesError}
            onSubmit={async (values, onProgress) => {
              await uploadDocument({ owner, operator, ...values }, onProgress);
              setUploadOpen(false);
              reloadFirst();
            }}
            onCancel={() => setUploadOpen(false)}
          />
        </section>
      )}

      <ErrorBox>{error}</ErrorBox>

      {!error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {documents.length > 0 ? (
            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <DocumentsTable
                documents={documents}
                onEdit={canUpload ? setEditDoc : undefined}
                onDelete={canDelete ? (doc) => { setDeleteError(null); setConfirm(doc); } : undefined}
              />
            </div>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-gray-400">
              {loading ? 'Загрузка…' : 'Документов пока нет'}
            </p>
          )}
          {total > PAGE_SIZE && (
            <div className="px-5 py-4 border-t border-gray-100">
              <Pager page={page} total={total} limit={PAGE_SIZE} onChange={setPage} />
            </div>
          )}
        </div>
      )}

      {editDoc && (
        <ContentModal title="Изменить документ" onClose={() => setEditDoc(null)} size="lg">
          <p className="text-xs text-gray-400 mb-4 break-all">Файл: {editDoc.file_name}</p>
          <DocumentForm
            doc={editDoc}
            types={types}
            typesError={typesError}
            onSubmit={async (changes) => {
              await updateDocument(editDoc.id, changes);
              setEditDoc(null);
              load(page);
            }}
            onCancel={() => setEditDoc(null)}
          />
        </ContentModal>
      )}

      {confirm && (
        <ConfirmModal
          title="Удаление документа"
          message={`Удалить документ «${confirm.title}»?`}
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default DocumentsManager;
