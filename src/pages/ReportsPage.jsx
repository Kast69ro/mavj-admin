import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { companies } from '../data/mockData';
import { exportToCSV } from '../utils/helpers';

const ReportsPage = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Вывод отчета</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Фильтры отчета</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Компания</label>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Все компании</option>
              {companies.map(comp => (
                <option key={comp.name} value={comp.name}>{comp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата от</label>
            <input
              type="date"
              value={reportDateFrom}
              onChange={e => setReportDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата до</label>
            <input
              type="date"
              value={reportDateTo}
              onChange={e => setReportDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          ОК - Применить фильтр
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Статистика по компаниям</h3>
          <button
            onClick={() => exportToCSV(companies, reportDateFrom, reportDateTo)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium"
          >
            <Download size={16} />Экспорт в CSV
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Компания</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Количество</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Период</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((comp, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{comp.name}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                    {comp.count}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {reportDateFrom || '01.01.2026'} - {reportDateTo || '16.01.2026'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;