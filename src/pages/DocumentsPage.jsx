import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { FolderOpen, Search, X } from 'lucide-react';
import { PAGE_SIZE, fetchDocumentTypes, fetchDocuments } from '../features/documents/documentsApi';
import { fetchOperators } from '../features/operators/operators';
import { useAccess } from '../utils/permissions';
import { operatorName } from '../utils/operatorColors';
import { ErrorBox } from '../components/ContentModal';
import NoAccess from '../components/NoAccess';
import Pager from '../components/Pager';
import DocumentsTable from '../components/documents/DocumentsTable';
import PeriodSelect from '../components/documents/PeriodSelect';

const COMPANY = 'company'; // значение фильтра «Наши документы» в адресе

const selectClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const FilterLabel = ({ children }) => (
  <span className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">{children}</span>
);

// Раздел «Документы»: все документы всех операторов. Только просмотр и скачивание
const DocumentsPage = () => {
  const dispatch = useDispatch();
  const { can, isOperatorAllowed, allowedOperators } = useAccess();
  const canCompany = can('company_documents_view');
  const canUpload = can('documents_upload') && can('operators');
  const operators = useSelector((state) => state.operators.all);

  // Фильтры живут в адресе страницы, чтобы ссылкой можно было поделиться
  const [params, setParams] = useSearchParams();
  const operator = params.get('operator') || '';
  const type = params.get('type') || '';
  const period = params.get('period') || '';
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const isCompany = operator === COMPANY;
  const hasFilters = Boolean(operator || type || period || q);

  const [types, setTypes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(q);

  // Меняет фильтры в адресе; смена любого фильтра возвращает на первую страницу
  const update = (changes, options) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!('page' in changes)) next.delete('page');
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      return next;
    }, options);
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });

  useEffect(() => {
    dispatch(fetchOperators({ all: true }));
  }, [dispatch]);

  // Типы: выбран владелец — только его типы; все документы — общий список
  const ownerOf = (value) => {
    if (value === COMPANY) return 'company';
    return value || !canCompany ? 'operator' : undefined;
  };
  const typesOwner = ownerOf(operator);

  useEffect(() => {
    let cancelled = false;
    fetchDocumentTypes(typesOwner)
      .then((list) => !cancelled && setTypes(list))
      .catch(() => !cancelled && setTypes([]));
    return () => {
      cancelled = true;
    };
  }, [typesOwner]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDocuments({
      owner: isCompany ? 'company' : undefined,
      operator: isCompany ? undefined : operator,
      type,
      period,
      q,
      page,
    })
      .then((res) => !cancelled && setData(res))
      .catch((e) => {
        if (cancelled) return;
        setData(null);
        setError(e);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isCompany, operator, type, period, q, page]);

  // Поиск с задержкой. lastQ — что мы сами записали в адрес: если q поменялся не нами
  // (сброс фильтров, «назад»), подставляем его в поле, а набираемый текст не трогаем
  const lastQ = useRef(q);
  useEffect(() => {
    if (q === lastQ.current) return;
    lastQ.current = q;
    setSearch(q);
  }, [q]);
  useEffect(() => {
    const value = search.trim();
    if (value === q) return;
    const timer = setTimeout(() => {
      lastQ.current = value;
      updateRef.current({ q: value }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, q]);

  const items = useMemo(() => data?.items || [], [data]);

  // Справочник операторов может быть недоступен роли — дополняем его тем, что пришло в документах
  const operatorOptions = useMemo(() => {
    const map = new Map();
    const add = (code, name) => code && !map.has(code) && map.set(code, name);
    operators.forEach((o) => add(o.code, o.name));
    allowedOperators.forEach((code) => add(code, operatorName(code)));
    items.forEach((d) => add(d.operator, d.operator_name || d.operator));
    if (operator !== COMPANY) add(operator, operatorName(operator));
    return [...map].map(([code, name]) => ({ code, name }));
  }, [operators, allowedOperators, items, operator]);

  // Наборы типов у операторов и компании разные: при смене владельца фильтр по типу сбрасываем
  const handleOperator = (value) =>
    update(ownerOf(value) === typesOwner ? { operator: value } : { operator: value, type: '' });

  if (error?.status === 403) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Документы</h2>
        <NoAccess />
        {hasFilters && (
          <p className="text-center">
            <button type="button" onClick={() => setParams({})} className="text-sm text-blue-600 hover:underline">
              Сбросить фильтры
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Документы</h2>
        {data && (
          <p className="text-sm text-gray-500 mt-0.5">
            Всего найдено: <span className="font-medium text-gray-700">{data.total}</span>
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <label>
            <FilterLabel>Оператор</FilterLabel>
            <select value={operator} onChange={(e) => handleOperator(e.target.value)} className={selectClass}>
              <option value="">Все</option>
              {canCompany && <option value={COMPANY}>Наши документы</option>}
              {operatorOptions
                .filter((o) => isOperatorAllowed(o.code) || o.code === operator)
                .map((o) => (
                  <option key={o.code} value={o.code}>{o.name}</option>
                ))}
            </select>
          </label>
          <label>
            <FilterLabel>Тип</FilterLabel>
            <select value={type} onChange={(e) => update({ type: e.target.value })} className={selectClass}>
              <option value="">Все типы</option>
              {type && !types.some((t) => t.code === type) && <option value={type}>{type}</option>}
              {types.map((t) => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
          </label>
          <div>
            <FilterLabel>Период</FilterLabel>
            <PeriodSelect value={period} onChange={(v) => update({ period: v })} yearOnly className={selectClass} />
          </div>
          <div>
            <FilterLabel>Поиск</FilterLabel>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название или комментарий"
                aria-label="Поиск по названию и комментарию"
                className={`${selectClass} pl-9 pr-9`}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Очистить поиск"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => setParams({})}
            className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <X size={14} /> Сбросить фильтры
          </button>
        )}
      </div>

      {error && <ErrorBox>{error.message}</ErrorBox>}

      {!error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {items.length > 0 && (
            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <DocumentsTable documents={items} showOwner />
            </div>
          )}
          {items.length === 0 && loading && (
            <p className="px-4 py-12 text-center text-sm text-gray-400">Загрузка…</p>
          )}
          {items.length === 0 && !loading && (
            <div className="px-4 py-12 text-center text-sm text-gray-500">
              <FolderOpen size={32} className="mx-auto mb-3 text-gray-300" />
              {hasFilters ? (
                'По выбранным фильтрам документов нет'
              ) : (
                <>
                  Документов пока нет. Загрузить их можно в разделе{' '}
                  {canUpload ? (
                    <Link to="/settings" className="text-blue-600 hover:underline">«Настройки»</Link>
                  ) : (
                    '«Настройки»'
                  )}
                </>
              )}
            </div>
          )}
          {data && data.total > PAGE_SIZE && (
            <div className="px-5 py-4 border-t border-gray-100">
              <Pager
                page={page}
                total={data.total}
                limit={PAGE_SIZE}
                onChange={(p) => update({ page: p > 1 ? String(p) : '' })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
