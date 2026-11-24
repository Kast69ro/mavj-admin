import React, { useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { FILE_ACCEPT, MAX_COMMENT_LENGTH, validateDocumentFile } from '../../features/documents/documentsApi';
import { formatFileSize } from '../../utils/utils';
import { ErrorBox, Field, inputClass } from '../ContentModal';
import PeriodSelect from './PeriodSelect';

const toForm = (doc) => ({
  type: doc?.type ?? '',
  title: doc?.title ?? '',
  period: doc?.period ?? '',
  doc_date: doc?.doc_date ?? '',
  comment: doc?.comment ?? '',
});

const baseName = (name) => name.replace(/\.[^.]+$/, '');

const Required = () => <span className="text-red-500"> *</span>;

// Одна форма на загрузку (doc не передан) и изменение (файл не меняется).
// onSubmit(values, onProgress): при изменении values содержит только изменённые поля,
// очищенное поле уходит пустой строкой
const DocumentForm = ({ doc, types, typesError, onSubmit, onCancel }) => {
  const isEdit = Boolean(doc);
  const initial = toForm(doc);
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [titleTouched, setTitleTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const problem = validateDocumentFile(selected);
    setFileError(problem);
    setFile(problem ? null : selected);
    if (problem) {
      e.target.value = ''; // чтобы можно было выбрать тот же файл ещё раз
      return;
    }
    if (!titleTouched || !form.title.trim()) set('title')(baseName(selected.name));
  };

  const values = { ...form, title: form.title.trim(), comment: form.comment.trim() };
  const changes = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== initial[k]));
  const canSave = values.type && values.title && (isEdit ? Object.keys(changes).length > 0 : file);

  // Тип, которого больше нет в справочнике, не теряем при изменении
  const typeOptions =
    isEdit && doc.type && !types.some((t) => t.code === doc.type)
      ? [{ code: doc.type, name: doc.type_name || doc.type }, ...types]
      : types;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setProgress(0);
    setError(null);
    try {
      await onSubmit(isEdit ? changes : { ...values, file }, setProgress);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">Файл<Required /></span>
          <input
            ref={inputRef}
            type="file"
            accept={FILE_ACCEPT}
            onChange={handleFile}
            disabled={saving}
            className="sr-only"
            id="document-file"
          />
          <label
            htmlFor="document-file"
            className={`flex items-center gap-2 px-3 py-2.5 border border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50 ${
              fileError ? 'border-red-400' : 'border-gray-300'
            } ${saving ? 'pointer-events-none opacity-60' : ''}`}
          >
            <Paperclip size={16} className="text-gray-400 shrink-0" />
            {file ? (
              <span className="min-w-0 truncate text-gray-800">
                {file.name} <span className="text-gray-400">· {formatFileSize(file.size)}</span>
              </span>
            ) : (
              <span className="text-gray-500">Выбрать файл</span>
            )}
          </label>
          <p className={`text-xs mt-1 ${fileError ? 'text-red-600' : 'text-gray-400'}`} role={fileError ? 'alert' : undefined}>
            {fileError || 'PDF, DOC/DOCX, XLS/XLSX, CSV, TXT, JPG/PNG, ZIP; до 20 МБ'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Тип документа<Required /></>}>
          <select value={form.type} onChange={(e) => set('type')(e.target.value)} disabled={saving} className={inputClass}>
            <option value="">Выберите тип</option>
            {typeOptions.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>
        </Field>
        <Field label={<>Название<Required /></>}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => { setTitleTouched(true); set('title')(e.target.value); }}
            disabled={saving}
            className={inputClass}
            placeholder="По умолчанию — имя файла"
          />
        </Field>
        <Field label="Период" hint="Для актов, детализаций, счетов">
          <PeriodSelect value={form.period} onChange={set('period')} className={inputClass} />
        </Field>
        <Field label="Дата документа" hint="Дата подписания / дата на документе">
          <input
            type="date"
            value={form.doc_date}
            onChange={(e) => set('doc_date')(e.target.value)}
            disabled={saving}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Комментарий" hint={`${form.comment.length} / ${MAX_COMMENT_LENGTH}`}>
        <textarea
          rows={2}
          maxLength={MAX_COMMENT_LENGTH}
          value={form.comment}
          onChange={(e) => set('comment')(e.target.value)}
          disabled={saving}
          className={inputClass}
        />
      </Field>

      {saving && !isEdit && (
        <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{progress < 100 ? 'Загрузка файла…' : 'Сохранение на сервере…'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <ErrorBox>{error || typesError}</ErrorBox>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !canSave}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {saving ? (isEdit ? 'Сохранение…' : 'Загрузка…') : isEdit ? 'Сохранить' : 'Загрузить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;
