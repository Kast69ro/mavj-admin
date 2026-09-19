import React, { useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { axiosRequest } from '../utils/axiosInstance';

const OPERATOR_LABELS = { babilon: 'Babilon Mobile', megafon: 'MegaFon', unknown: 'Не определён' };

const exportReportsToCSV = (reports, dateFrom, dateTo) => {
  const header = ['Компания', 'Тарификации (всего)', 'Входящие SMS', 'Исходящие SMS', 'Подписки 1.6 TJS', 'Доп.вопросы 0.9 TJS', 'Сумма TJS'];
  const rows = reports.map((r) => [
    OPERATOR_LABELS[r.operator] || r.operator,
    r.total_charges, r.incoming_sms, r.outgoing_sms_estimate,
    r.subscription_charges, r.extra_charges, r.total_amount.toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report_${dateFrom || 'all'}_${dateTo || 'all'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const [selectedOperator, setSelectedOperator] = useState('');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    axiosRequest
      .get('/billing/reports', {
        params: {
          operator: selectedOperator || undefined,
          date_from: reportDateFrom || undefined,
          date_to: reportDateTo || undefined,
        },
      })
      .then(({ data }) => setReports(data.reports || []))
      .catch(() => setError('Не удалось загрузить отчёт'))
      .finally(() => setLoading(false));
  }, [selectedOperator, reportDateFrom, reportDateTo]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = reports.reduce(
    (acc, r) => ({
      total_charges: acc.total_charges + r.total_charges,
      incoming_sms: acc.incoming_sms + r.incoming_sms,
      outgoing_sms_estimate: acc.outgoing_sms_estimate + r.outgoing_sms_estimate,
      subscription_charges: acc.subscription_charges + r.subscription_charges,
      extra_charges: acc.extra_charges + r.extra_charges,
      total_amount: acc.total_amount + r.total_amount,
    }),
    { total_charges: 0, incoming_sms: 0, outgoing_sms_estimate: 0, subscription_charges: 0, extra_charges: 0, total_amount: 0 }
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Отчёты</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Фильтры отчёта</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Компания</label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Все компании (сводно)</option>
              <option value="babilon">Babilon Mobile</option>
              <option value="megafon">MegaFon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата от</label>
            <input
              type="date"
              value={reportDateFrom}
              onChange={(e) => setReportDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата до</label>
            <input
              type="date"
              value={reportDateTo}
              onChange={(e) => setReportDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {selectedOperator ? `Отчёт: ${OPERATOR_LABELS[selectedOperator] || selectedOperator}` : 'Сводный отчёт по всем компаниям'}
          </h3>
          <button
            onClick={() => exportReportsToCSV(reports, reportDateFrom, reportDateTo)}
            disabled={!reports.length}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <Download size={16} />Экспорт в CSV
          </button>
        </div>

        {loading && <p className="text-sm text-gray-400 py-6 text-center">Загрузка…</p>}
        {!loading && error && <p className="text-sm text-red-600 py-6 text-center">{error}</p>}
        {!loading && !error && reports.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">Нет данных за выбранный период</p>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Компания</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Тарификации (всего)</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Входящие SMS</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Исходящие SMS</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Подписки 1.6 TJS</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Доп.вопросы 0.9 TJS</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Сумма, TJS</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.operator} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                        {OPERATOR_LABELS[r.operator] || r.operator}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{r.total_charges}</td>
                    <td className="px-4 py-3 text-right">{r.incoming_sms}</td>
                    <td className="px-4 py-3 text-right">{r.outgoing_sms_estimate}</td>
                    <td className="px-4 py-3 text-right">{r.subscription_charges}</td>
                    <td className="px-4 py-3 text-right">{r.extra_charges}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
                {reports.length > 1 && (
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3">Итого</td>
                    <td className="px-4 py-3 text-right">{totals.total_charges}</td>
                    <td className="px-4 py-3 text-right">{totals.incoming_sms}</td>
                    <td className="px-4 py-3 text-right">{totals.outgoing_sms_estimate}</td>
                    <td className="px-4 py-3 text-right">{totals.subscription_charges}</td>
                    <td className="px-4 py-3 text-right">{totals.extra_charges}</td>
                    <td className="px-4 py-3 text-right">{totals.total_amount.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          «Исходящие SMS» — приблизительная оценка (точный подсчёт требует отдельного логирования, которого пока нет в базе).
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
