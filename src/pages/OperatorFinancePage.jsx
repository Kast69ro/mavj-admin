import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { fetchOperatorFinance } from '../features/operatorContent/operatorContentApi';
import {
  getMonthRange,
  getLastMonthRange,
  today,
  pillBase,
  pillActive,
  pillInactive,
  dateInputClass,
} from '../utils/utils';
import FinanceSummary from '../components/FinanceSummary';
import { ErrorBox } from '../components/ContentModal';

const PRESETS = [
  { key: 'month', label: 'Этот месяц', range: () => ({ from: getMonthRange().from, to: today() }) },
  { key: 'lastMonth', label: 'Прошлый месяц', range: getLastMonthRange },
  {
    key: 'year',
    label: 'Этот год',
    range: () => ({ from: `${today().slice(0, 4)}-01-01`, to: today() }),
  },
];

// Вкладка «Финансы»: чистая прибыль оператора за выбранные даты
const OperatorFinancePage = () => {
  const dispatch = useDispatch();
  const { operator } = useOutletContext();
  const { code } = operator;

  const initial = PRESETS[0].range();
  const [preset, setPreset] = useState('month');
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rangeInvalid = dateFrom && dateTo && dateFrom > dateTo;

  useEffect(() => {
    if (!dateFrom || !dateTo || rangeInvalid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    dispatch(fetchOperatorFinance({ code, date_from: dateFrom, date_to: dateTo }))
      .unwrap()
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dispatch, code, dateFrom, dateTo, rangeInvalid]);

  const applyPreset = (p) => {
    const r = p.range();
    setPreset(p.key);
    setDateFrom(r.from);
    setDateTo(r.to);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p)}
              className={`${pillBase} ${preset === p.key ? pillActive : pillInactive}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setPreset(null); setDateFrom(e.target.value); }}
            className={dateInputClass}
          />
          <span className="text-gray-400">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setPreset(null); setDateTo(e.target.value); }}
            className={dateInputClass}
          />
        </div>
      </div>

      {rangeInvalid && <ErrorBox>Дата начала позже даты окончания</ErrorBox>}
      <ErrorBox>{error}</ErrorBox>

      {loading && !data && <p className="text-sm text-gray-400">Загрузка…</p>}
      {data && (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <FinanceSummary data={data} />
        </div>
      )}
    </div>
  );
};

export default OperatorFinancePage;
