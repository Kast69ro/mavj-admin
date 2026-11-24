import React, { useState } from 'react';
import { Download, Eye, Loader2, Pencil, Trash2 } from 'lucide-react';
import { canPreview, downloadDocument, previewDocument } from '../../features/documents/documentsApi';
import { formatDate, formatDay, formatFileSize, formatPeriod } from '../../utils/utils';
import { ErrorBox } from '../ContentModal';
import { FormatIcon, OwnerBadge } from './DocumentParts';

const Th = ({ children, right }) => (
  <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
);

const IconButton = ({ title, onClick, hover, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`p-1.5 text-gray-500 rounded ${hover}`}
  >
    {children}
  </button>
);

// Список документов: на десктопе таблица, на телефоне карточки.
// Кнопки «Изменить» и «Удалить» появляются, только если передан обработчик
const DocumentsTable = ({ documents, showOwner = false, showType = true, onEdit, onDelete }) => {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const run = async (action, doc) => {
    if (busyId) return;
    setBusyId(doc.id);
    setError(null);
    try {
      await action(doc);
    } catch (e) {
      setError(`«${doc.title}»: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const renderTitle = (doc) => (
    <div className="flex items-start gap-2 min-w-0">
      <FormatIcon fileName={doc.file_name} />
      <div className="min-w-0">
        {canPreview(doc) ? (
          <button
            type="button"
            onClick={() => run(previewDocument, doc)}
            title="Открыть в новой вкладке"
            className="text-left font-medium text-gray-800 hover:text-blue-600 hover:underline break-words"
          >
            {doc.title}
          </button>
        ) : (
          <span className="font-medium text-gray-800 break-words">{doc.title}</span>
        )}
        {doc.comment && <p className="text-xs text-gray-400 mt-0.5 whitespace-pre-line break-words">{doc.comment}</p>}
      </div>
    </div>
  );

  const renderActions = (doc) => (
    <div className="flex items-center justify-end gap-1">
      {canPreview(doc) && (
        <IconButton title="Посмотреть" onClick={() => run(previewDocument, doc)} hover="hover:text-blue-600 hover:bg-blue-50">
          <Eye size={16} />
        </IconButton>
      )}
      {onEdit && (
        <IconButton title="Изменить" onClick={() => onEdit(doc)} hover="hover:text-blue-600 hover:bg-blue-50">
          <Pencil size={16} />
        </IconButton>
      )}
      {onDelete && (
        <IconButton title="Удалить" onClick={() => onDelete(doc)} hover="hover:text-red-600 hover:bg-red-50">
          <Trash2 size={16} />
        </IconButton>
      )}
      <button
        type="button"
        onClick={() => run(downloadDocument, doc)}
        disabled={busyId === doc.id}
        className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium whitespace-nowrap disabled:opacity-60"
      >
        {busyId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Скачать
      </button>
    </div>
  );

  return (
    <div>
      {error && <div className="p-4"><ErrorBox>{error}</ErrorBox></div>}

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-gray-50">
              {showOwner && <Th>Оператор</Th>}
              {showType && <Th>Тип</Th>}
              <Th>Название</Th>
              <Th>Период</Th>
              <Th>Дата документа</Th>
              <Th>Загружен</Th>
              <Th right>Размер</Th>
              <th className="px-4 py-3"><span className="sr-only">Действия</span></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-100 last:border-0 align-top hover:bg-gray-50/60">
                {showOwner && <td className="px-4 py-3"><OwnerBadge doc={doc} /></td>}
                {showType && <td className="px-4 py-3 text-gray-600">{doc.type_name || doc.type}</td>}
                <td className="px-4 py-3 max-w-[320px]">{renderTitle(doc)}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatPeriod(doc.period)}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDay(doc.doc_date)}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {doc.uploaded_at && formatDate(doc.uploaded_at)}
                  {doc.uploaded_by && <span className="block text-xs text-gray-400">{doc.uploaded_by}</span>}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{formatFileSize(doc.size)}</td>
                <td className="px-4 py-3">{renderActions(doc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden divide-y divide-gray-100">
        {documents.map((doc) => (
          <li key={doc.id} className="p-4 space-y-2 text-sm">
            {showOwner && <OwnerBadge doc={doc} />}
            {renderTitle(doc)}
            <p className="text-xs text-gray-500">
              {[
                showType && (doc.type_name || doc.type),
                formatPeriod(doc.period),
                doc.doc_date && `от ${formatDay(doc.doc_date)}`,
                formatFileSize(doc.size),
              ].filter(Boolean).join(' · ')}
            </p>
            {doc.uploaded_at && (
              <p className="text-xs text-gray-400">
                Загружен {formatDate(doc.uploaded_at)}{doc.uploaded_by && ` · ${doc.uploaded_by}`}
              </p>
            )}
            {renderActions(doc)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentsTable;
