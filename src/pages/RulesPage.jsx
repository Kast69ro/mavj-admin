import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, ExternalLink, Calendar, HardDrive } from 'lucide-react';
import { axiosRequest, defaultAxios } from '../utils/axiosInstance';

const OPERATOR_LABEL = { babilon: 'Babilon Mobile', megafon: 'MegaFon' };
const OPERATORS = ['babilon', 'megafon'];

const formatSize = (bytes) => {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} КБ`;
  return `${(kb / 1024).toFixed(1)} МБ`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
};

const RulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);
  const fileInputRefs = useRef({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Публичный эндпоинт — используем defaultAxios (без токена), чтобы
      // список отображался даже если сессия админа истечёт по какой-то причине.
      const { data } = await defaultAxios.get('/rules');
      setRules(data.rules || []);
    } catch (e) {
      setError('Не удалось загрузить список регламентов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ruleFor = (operator) => rules.find((r) => r.operator === operator);

  const handleFileSelect = async (operator, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Файл должен быть в формате PDF');
      return;
    }
    setUploadingFor(operator);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('operator', operator);
      formData.append('file', file);
      await axiosRequest.post('/rules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось загрузить файл');
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Правила (PDF)</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {loading && <p className="text-sm text-gray-400">Загрузка…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPERATORS.map((op) => {
          const rule = ruleFor(op);
          return (
            <div key={op} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">{OPERATOR_LABEL[op]}</h3>
              </div>

              {rule ? (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HardDrive size={14} /> {formatSize(rule.size)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} /> Обновлено: {formatDate(rule.updated_at)}
                  </div>
                  <a
                    href={rule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ExternalLink size={14} /> Открыть текущий файл
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">Файл ещё не загружен</p>
              )}

              <input
                ref={(el) => (fileInputRefs.current[op] = el)}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(op, e.target.files?.[0])}
              />
              <button
                onClick={() => fileInputRefs.current[op]?.click()}
                disabled={uploadingFor === op}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                <Upload size={16} />
                {uploadingFor === op ? 'Загрузка…' : rule ? 'Заменить файл' : 'Загрузить PDF'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RulesPage;
