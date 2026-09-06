import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, Package, Wallet } from "lucide-react";
import { getPresetRange, nf, STAT_COLORS } from "../utils/utils";
import { fetchBilling } from "../features/biling/biling";
import { fetchOperators } from "../features/operators/operators";

const money = (n) =>
  `${(n ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TJS`;

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

const inputClass =
  "px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

const BillingPage = () => {
  const dispatch = useDispatch();
  const todayRange = getPresetRange("today");

  const [dateFrom, setDateFrom] = useState(todayRange.from);
  const [dateTo, setDateTo] = useState(todayRange.to);
  const [operator, setOperator] = useState("");

  const { data, loading, error } = useSelector((state) => state.billing);
  const { info } = useSelector((state) => state.operators);

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

  const periodSelected = Boolean(dateFrom && dateTo);
  const operatorOptions = [
  { value: '', label: 'Все операторы' },
  ...(info || []).map((o) => ({
    value: o.value ?? o.code ?? o.id,
    label: o.label ?? o.name ?? o.title,
  })),
];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Биллинг</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Дата от
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Дата до
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Оператор
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className={inputClass}
            >
              {operatorOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {!periodSelected && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-lg p-4 text-center">
          Выберите период, чтобы загрузить данные
        </div>
      )}

      {periodSelected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Основные подписки"
              value={money(data?.totals?.subscription_amount)}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Доп-пакеты"
              value={money(data?.totals?.extra_amount)}
              icon={Package}
              color="amber"
            />
            <StatCard
              label="Всего заработано"
              value={money(data?.totals?.total_amount)}
              icon={Wallet}
              color="indigo"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 sticky top-0">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Дата
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Основных списаний
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Сумма, TJS
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Доп-пакетов
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Сумма, TJS
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Итого, TJS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!data || data.days.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        {loading
                          ? "Загрузка…"
                          : "Нет данных за выбранный период"}
                      </td>
                    </tr>
                  )}
                  {data?.days?.map((d, i) => (
                    <tr
                      key={d.date}
                      className={`transition-colors hover:bg-blue-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {d.date}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {nf(d.subscription_count)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {d.subscription_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {nf(d.extra_count)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {d.extra_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {d.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {data?.days?.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold border-t-2 border-gray-200">
                      <td className="px-4 py-3 text-gray-900">
                        Итого за период
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {nf(data.totals.subscription_count)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {data.totals.subscription_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {nf(data.totals.extra_count)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {data.totals.extra_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {data.totals.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingPage;
