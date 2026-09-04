import React, { useEffect, useState, useCallback } from 'react';
import { axiosRequest } from '../utils/axiosInstance';

const OPERATORS = [
  { value: '', label: 'Все операторы' },
  { value: 'babilon', label: 'Babilon' },
  { value: 'megafon', label: 'MegaFon' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const nf = (n) => (n ?? 0).toLocaleString('ru-RU');
const money = (n) => `${(n ?? 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TJS`;

const StatCard = ({ label, value, from = 'blue' }) => (
  <div className={`bg-gradient-to-br from-${from}-500 to-${from}-600 rounded-xl shadow-lg p-5 text-white`}>
    <p className="text-sm opacity-90">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const BillingPage = () => {
  const [dateFrom, setDateFrom] = useState(monthStartISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [operator, setOperator] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosRequest.get('/billing/daily', {
        params: { date_from: dateFrom, date_to: dateTo, operator: operator || undefined },
      });
      setData(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось загрузить биллинг');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, operator]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Биллинг</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Дата от</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Дата до</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Оператор</label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              {OPERATORS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={load}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Обновить
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Основные подписки" value={money(data?.totals?.subscription_amount)} from="emerald" />
        <StatCard label="Доп-пакеты" value={money(data?.totals?.extra_amount)} from="amber" />
        <StatCard label="Всего заработано" value={money(data?.totals?.total_amount)} from="indigo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Основных списаний</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма, TJS</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Доп-пакетов</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма, TJS</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Итого, TJS</th>
            </tr>
          </thead>
          <tbody>
            {(!data || data.days.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">
                  {loading ? 'Загрузка…' : 'Нет данных за выбранный период'}
                </td>
              </tr>
            )}
            {data?.days?.map((d) => (
              <tr key={d.date} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium">{d.date}</td>
                <td className="px-4 py-3 text-sm text-right">{nf(d.subscription_count)}</td>
                <td className="px-4 py-3 text-sm text-right">{d.subscription_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">{nf(d.extra_count)}</td>
                <td className="px-4 py-3 text-sm text-right">{d.extra_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">{d.total_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {data?.days?.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-sm">Итого за период</td>
                <td className="px-4 py-3 text-sm text-right">{nf(data.totals.subscription_count)}</td>
                <td className="px-4 py-3 text-sm text-right">{data.totals.subscription_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">{nf(data.totals.extra_count)}</td>
                <td className="px-4 py-3 text-sm text-right">{data.totals.extra_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right">{data.totals.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default BillingPage;
