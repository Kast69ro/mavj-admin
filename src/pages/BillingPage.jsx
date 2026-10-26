import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, Package, Wallet, ChevronRight, ChevronDown } from "lucide-react";
import {
  getPresetRange,
  nf,
  money,
  STAT_COLORS,
  PERIOD_PRESETS,
  ALL_TIME_FROM,
  pillBase,
  pillActive,
  pillInactive,
  dateInputClass,
  buildOperatorOptions,
  getOperatorPillStyle,
  today,
  getMonthRange,
  getLastMonthRange,
} from "../utils/utils";
import { fetchBilling } from "../features/biling/biling";
import { fetchOperators } from "../features/operators/operators";
import { axiosRequest } from "../utils/axiosInstance";

import { fetchAllFinance } from "../features/operatorContent/operatorContentApi";
import FinanceSummary from "../components/FinanceSummary";
import { OPERATOR_COLORS } from "../utils/operatorColors";

// Чистая прибыль по всем включённым операторам за те же даты, что и биллинг
const NetProfitSection = ({ dateFrom, dateTo }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    let cancelled = false;
    setError(null);
    dispatch(fetchAllFinance({ date_from: dateFrom, date_to: dateTo }))
      .unwrap()
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [dispatch, dateFrom, dateTo]);

  if (!data && !error) return null;

  const operators = data?.operators || [];
  const m = (v) => money(Number(v) || 0);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Чистая прибыль</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {operators.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-gray-50">
                {["Оператор", "Выручка", "Доля оператора", "Наша валовая", "Расходы", "Чистая прибыль"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {operators.map((o) => {
                const opCode = o.operator ?? o.code;
                const net = Number(o.net_profit) || 0;
                return (
                  <tr key={opCode}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: (OPERATOR_COLORS[opCode] ?? OPERATOR_COLORS.default).bg }}
                        />
                        {o.name ?? opCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{m(o.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{m(o.operator_share)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{m(o.our_gross)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{m(o.expenses)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${net < 0 ? "text-red-600" : "text-gray-900"}`}>{m(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.total && <FinanceSummary data={data.total} />}
    </section>
  );
};

const StatCard = ({ label, value, icon: Icon, color = "blue" }) => (
  <div
    className={`relative overflow-hidden rounded-xl shadow-lg p-5 text-white bg-gradient-to-br ${STAT_COLORS[color]}`}
  >
    <Icon
      className="absolute -right-4 -bottom-4 w-24 h-24 text-white/15"
      strokeWidth={1.5}
    />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <p className="text-sm font-medium text-white/90">{label}</p>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const TrendArrow = ({ diff }) => {
  if (diff === null || diff === undefined) return <span className="text-gray-300 text-xs">—</span>;
  if (diff > 0.001) return <span className="text-green-600 font-bold" title={`+${diff.toFixed(2)} TJS`}>▲</span>;
  if (diff < -0.001) return <span className="text-red-600 font-bold" title={`${diff.toFixed(2)} TJS`}>▼</span>;
  return <span className="text-gray-400 font-bold" title="Без изменений">=</span>;
};

const withDiffs = (list) =>
  list.map((item, i) => ({
    ...item,
    diff: i + 1 < list.length ? item.total_amount - list[i + 1].total_amount : null,
  }));

const buildYearGroups = (monthsWithDiff) => {
  const map = new Map();
  const order = [];
  monthsWithDiff.forEach((m) => {
    if (!map.has(m.year)) {
      map.set(m.year, { year: m.year, months: [], total_amount: 0 });
      order.push(m.year);
    }
    const g = map.get(m.year);
    g.months.push(m);
    g.total_amount += m.total_amount;
  });
  const groups = order.map((y) => map.get(y)).sort((a, b) => b.year - a.year);
  groups.forEach((g, i) => {
    g.diff = i + 1 < groups.length ? g.total_amount - groups[i + 1].total_amount : null;
  });
  return groups;
};

const DailyRows = ({ days, loading }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-gray-50 sticky top-0">
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Дата</th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Основных списаний</th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Сумма, TJS</th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Доп-пакетов</th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Сумма, TJS</th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Итого, TJS</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {(!days || days.length === 0) && (
        <tr>
          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
            {loading ? "Загрузка…" : "Нет данных за выбранный период"}
          </td>
        </tr>
      )}
      {days?.map((d, i) => (
        <tr key={d.date} className={`transition-colors hover:bg-blue-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
          <td className="px-4 py-3 font-medium text-gray-900">
            <span className="inline-flex items-center gap-2">
              {d.date}
              <TrendArrow diff={d.diff} />
            </span>
          </td>
          <td className="px-4 py-3 text-right text-gray-700">{nf(d.subscription_count)}</td>
          <td className="px-4 py-3 text-right text-gray-700">{d.subscription_amount.toFixed(2)}</td>
          <td className="px-4 py-3 text-right text-gray-700">{nf(d.extra_count)}</td>
          <td className="px-4 py-3 text-right text-gray-700">{d.extra_amount.toFixed(2)}</td>
          <td className="px-4 py-3 text-right font-semibold text-gray-900">{d.total_amount.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BillingPage = () => {
  const dispatch = useDispatch();
  const todayRange = getPresetRange("today");

  const [activePreset, setActivePreset] = useState("today");
  const [dateFrom, setDateFrom] = useState(todayRange.from);
  const [dateTo, setDateTo] = useState(todayRange.to);
  const [operator, setOperator] = useState("");

  const { data, loading, error } = useSelector((state) => state.billing);
  const { info } = useSelector((state) => state.operators);

  // ===== "Всё время": годы/месяцы =====
  const [monthlyRaw, setMonthlyRaw] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [expandedYears, setExpandedYears] = useState(() => new Set());
  const [expandedMonths, setExpandedMonths] = useState(() => new Set());
  const [monthDays, setMonthDays] = useState({}); // key "YYYY-MM" -> days[]
  const [loadingMonthDays, setLoadingMonthDays] = useState({});

  useEffect(() => {
    dispatch(fetchOperators());
  }, [dispatch]);

  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    dispatch(
      fetchBilling({
        date_from: dateFrom,
        date_to: dateTo,
        operator: operator || undefined,
      }),
    );
  }, [dateFrom, dateTo, operator, dispatch]);

  useEffect(() => {
    if (activePreset !== "all") return;
    setLoadingMonthly(true);
    axiosRequest
      .get("/billing/monthly", { params: { date_from: dateFrom, date_to: dateTo, operator: operator || undefined } })
      .then(({ data }) => setMonthlyRaw(data.months || []))
      .catch(() => setMonthlyRaw([]))
      .finally(() => setLoadingMonthly(false));
  }, [activePreset, operator]);

  const monthsWithDiff = useMemo(() => withDiffs(monthlyRaw), [monthlyRaw]);
  const yearGroups = useMemo(() => buildYearGroups(monthsWithDiff), [monthsWithDiff]);
  const dailyWithDiff = useMemo(() => withDiffs(data?.days || []), [data]);

  const periodSelected = Boolean(dateFrom && dateTo);
  const operatorOptions = useMemo(() => buildOperatorOptions(info), [info]);

  const toggleYear = (year) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

  const toggleMonth = (m) => {
    const key = m.label;
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        if (!monthDays[key]) {
          setLoadingMonthDays((p) => ({ ...p, [key]: true }));
          axiosRequest
            .get("/billing/daily", {
              params: { date_from: m.date_from, date_to: m.date_to, operator: operator || undefined },
            })
            .then(({ data }) => setMonthDays((p) => ({ ...p, [key]: data.days || [] })))
            .catch(() => setMonthDays((p) => ({ ...p, [key]: [] })))
            .finally(() => setLoadingMonthDays((p) => ({ ...p, [key]: false })));
        }
      }
      return next;
    });
  };

  const handlePresetClick = (key) => {
    setActivePreset(key);
    if (key === "all") {
      setDateFrom(ALL_TIME_FROM);
      setDateTo(today());
      return;
    }
    if (key === "month") {
      const range = getMonthRange();
      setDateFrom(range.from);
      setDateTo(range.to);
      return;
    }
    if (key === "lastMonth") {
      const range = getLastMonthRange();
      setDateFrom(range.from);
      setDateTo(range.to);
      return;
    }
    const range = getPresetRange(key);
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const handleManualDateChange = (setter) => (e) => {
    setActivePreset(null);
    setter(e.target.value);
  };

  const MONTH_NAMES = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Биллинг</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Период</p>
            <div className="flex flex-wrap gap-2">
              {PERIOD_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePresetClick(p.key)}
                  className={`${pillBase} ${activePreset === p.key ? pillActive : pillInactive}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Свои даты</p>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={handleManualDateChange(setDateFrom)} className={dateInputClass} />
              <span className="text-gray-400">—</span>
              <input type="date" value={dateTo} onChange={handleManualDateChange(setDateTo)} className={dateInputClass} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-1 border-t border-gray-100">
          <div className="space-y-2 pt-4">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Компания</p>
            <div className="flex flex-wrap gap-2">
              {operatorOptions.map((o) => {
                const selected = operator === o.value;
                const style = getOperatorPillStyle(o, selected);

                if (!style) {
                  const greyed = !o.isAll;
                  return (
                    <button
                      key={o.value || "all"}
                      type="button"
                      onClick={() => setOperator(o.value)}
                      className={`${pillBase} ${
                        greyed
                          ? selected ? "bg-gray-400 border-gray-400 text-white" : "bg-gray-50 border-gray-200 text-gray-400"
                          : selected ? pillActive : pillInactive
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                }

                return (
                  <button key={o.value} type="button" onClick={() => setOperator(o.value)} style={style} className={`${pillBase} border`}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-gray-500 pt-4">
            Срез: <span className="font-bold text-gray-800">{today()}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {!periodSelected && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-lg p-4 text-center">
          Выберите период, чтобы загрузить данные
        </div>
      )}

      {periodSelected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Основные подписки" value={money(data?.totals?.subscription_amount)} icon={TrendingUp} color="emerald" />
            <StatCard label="Доп-пакеты" value={money(data?.totals?.extra_amount)} icon={Package} color="amber" />
            <StatCard label="Всего заработано" value={money(data?.totals?.total_amount)} icon={Wallet} color="indigo" />
          </div>

          {activePreset === "all" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loadingMonthly && (
                <div className="px-4 py-8 text-center text-gray-400">Загрузка…</div>
              )}
              {!loadingMonthly && yearGroups.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">Нет данных</div>
              )}
              {!loadingMonthly &&
                yearGroups.map((g) => {
                  const isYearOpen = expandedYears.has(g.year);
                  return (
                    <div key={g.year} className="border-b border-gray-100 last:border-0">
                      <button
                        onClick={() => toggleYear(g.year)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex items-center gap-2 font-semibold text-gray-900">
                          {isYearOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {g.year}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <TrendArrow diff={g.diff} />
                          <span className="font-semibold text-gray-900">{g.total_amount.toFixed(2)} TJS</span>
                        </span>
                      </button>

                      {isYearOpen && (
                        <div className="pl-8 pb-2">
                          {g.months.map((m) => {
                            const isMonthOpen = expandedMonths.has(m.label);
                            return (
                              <div key={m.label} className="border-t border-gray-50 first:border-0">
                                <button
                                  onClick={() => toggleMonth(m)}
                                  className="w-full flex items-center justify-between px-2 py-2.5 hover:bg-gray-50 transition-colors text-sm"
                                >
                                  <span className="flex items-center gap-2 text-gray-700">
                                    {isMonthOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {MONTH_NAMES[m.month - 1]} {m.year}
                                    <span className="text-gray-400">· {nf(m.total_count)} операций</span>
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <TrendArrow diff={m.diff} />
                                    <span className="font-medium text-gray-900">{m.total_amount.toFixed(2)} TJS</span>
                                  </span>
                                </button>
                                {isMonthOpen && (
                                  <div className="overflow-x-auto bg-gray-50/40">
                                    <DailyRows days={monthDays[m.label]} loading={loadingMonthDays[m.label]} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <DailyRows days={dailyWithDiff} loading={loading} />
                {data?.days?.length > 0 && (
                  <table className="w-full text-sm">
                    <tfoot>
                      <tr className="bg-gray-100 font-semibold border-t-2 border-gray-200">
                        <td className="px-4 py-3 text-gray-900">Итого за период</td>
                        <td className="px-4 py-3 text-right text-gray-900">{nf(data.totals.subscription_count)}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{data.totals.subscription_amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{nf(data.totals.extra_count)}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{data.totals.extra_amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{data.totals.total_amount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          )}

          <NetProfitSection dateFrom={dateFrom} dateTo={dateTo} />
        </>
      )}
    </div>
  );
};

export default BillingPage;
