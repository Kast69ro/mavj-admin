import React, { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, Users, Check } from 'lucide-react';
import { fetchSubscribers } from "../features/subscribers/subscribers";
import { fetchOperators } from "../features/operators/operators";
import { OPERATOR_COLORS } from "../utils/operatorColors"; // поправь путь под свой проект
import { useDispatch, useSelector } from 'react-redux';
import { STATUS_CONFIG, STATUS_OPTIONS } from '../utils/statusColor';

// --- статические справочники ---



// --- утилиты ---

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMsisdn = (msisdn) => {
  if (!msisdn || msisdn.length < 12) return msisdn;
  // 992 71 002 0008
  return `+${msisdn.slice(0, 3)} ${msisdn.slice(3, 5)} ${msisdn.slice(5, 8)} ${msisdn.slice(8)}`;
};

// --- маленькие компоненты ---

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const OperatorBadge = ({ code, operatorsByCode }) => {
  const colors = OPERATOR_COLORS[code] ?? OPERATOR_COLORS.default;
  const label = operatorsByCode[code]?.name ?? code;
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: colors.bg }}
    >
      {label}
    </span>
  );
};

/**
 * Заголовок колонки с выпадающим списком-фильтром.
 * options: [{ value, label, color? }]
 * value: текущее выбранное значение
 * onChange: (value) => void
 */
const FilterableHeader = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = options.find((o) => o.value === value);
  const isFiltered = Boolean(value);

  return (
    <th className="px-4 py-3 relative select-none" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 ${isFiltered ? 'text-blue-600' : ''}`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
      </button>

      {open && (
        <div className="absolute z-10 top-full left-4 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 normal-case font-normal text-gray-700">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                {opt.color && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                )}
                {opt.label}
              </span>
              {value === opt.value && <Check size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </th>
  );
};

// --- основной компонент ---

const SubscribersPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const dispatch = useDispatch();

  const { subscribers, total, isLoading, error } = useSelector((state) => state.subscribers);
  const { info: operatorsInfo } = useSelector((state) => state.operators);

  // code -> { name, ... } для быстрого поиска названия оператора
  const operatorsByCode = (operatorsInfo?.operators ?? []).reduce((acc, op) => {
    acc[op.code] = op;
    return acc;
  }, {});

  const operatorOptions = [
    { value: '', label: 'Все операторы' },
    ...(operatorsInfo?.operators ?? []).map((op) => ({
      value: op.code,
      label: op.name,
      color: (OPERATOR_COLORS[op.code] ?? OPERATOR_COLORS.default).bg,
    })),
  ];

  useEffect(() => {
    if (!operatorsInfo) {
      dispatch(fetchOperators());
    }
  }, [dispatch, operatorsInfo]);

  useEffect(() => {
    dispatch(
      fetchSubscribers({
        search,
        operator: operatorFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit,
      })
    );
  }, [dispatch, search, operatorFilter, statusFilter, page, limit]);

  // debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // сброс на первую страницу при смене фильтров
  useEffect(() => {
    setPage(1);
  }, [operatorFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Абоненты</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Всего найдено: <span className="font-medium text-gray-700">{total}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Поиск */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по номеру телефона"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto ">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Номер</th>
                <FilterableHeader
                  label="Оператор"
                  options={operatorOptions}
                  value={operatorFilter}
                  onChange={setOperatorFilter}
                />
                <th className="px-4 py-3">Сервис</th>
                <FilterableHeader
                  label="Статус"
                  options={STATUS_OPTIONS.map((o) => ({
                    ...o,
                    color: STATUS_CONFIG[o.value]?.dot,
                  }))}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                <th className="px-4 py-3">Язык</th>
                <th className="px-4 py-3">Подключён</th>
                <th className="px-4 py-3">Последнее списание</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Загрузка...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && subscribers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Users size={28} className="mx-auto mb-2 opacity-40" />
                    Абоненты не найдены
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{formatMsisdn(sub.msisdn)}</td>
                    <td className="px-4 py-3">
                      <OperatorBadge code={sub.operator} operatorsByCode={operatorsByCode} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{sub.service_id}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{sub.language}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(sub.created_at)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(sub.last_billed_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Страница {page} из {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersPage;