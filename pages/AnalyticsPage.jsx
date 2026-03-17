import React from 'react';
import { questionStats, conversionData, financialData } from '../data/mockData';

const AnalyticsPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Расширенная аналитика</h2>

    {/* Conversion */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Конверсия абонентов</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Всего посетителей</p>
          <p className="text-3xl font-bold text-blue-600">{conversionData.totalVisitors.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Подписались</p>
          <p className="text-3xl font-bold text-emerald-600">{conversionData.subscribed.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Конверсия: {conversionData.conversionRate}%</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Удержание</p>
          <p className="text-3xl font-bold text-purple-600">{conversionData.retentionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Активных: {conversionData.active.toLocaleString()}</p>
        </div>
      </div>
    </div>

    {/* Financial */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Финансовая аналитика</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Общая выручка</p>
          <p className="text-3xl font-bold text-emerald-700">{financialData.totalRevenue.toLocaleString()} ₴</p>
          <p className="text-xs text-emerald-600 mt-1">↑ +{financialData.monthlyGrowth}%</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Выдано призов</p>
          <p className="text-3xl font-bold text-amber-700">{financialData.prizesIssued.toLocaleString()} ₴</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Чистая прибыль</p>
          <p className="text-3xl font-bold text-purple-700">{financialData.netProfit.toLocaleString()} ₴</p>
        </div>
      </div>
    </div>

    {/* Question stats */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Популярность и анализ вопросов</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вопрос</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Задавался</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">% правильных</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ср. время</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Статус</th>
            </tr>
          </thead>
          <tbody>
            {questionStats.map(q => (
              <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm max-w-xs truncate">{q.question}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{q.timesAsked}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    q.correctRate >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    q.correctRate >= 60 ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {q.correctRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm">{q.avgResponseTime}с</td>
                <td className="px-4 py-3 text-center">
                  {q.daysAgo >= 7
                    ? <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Доступен</span>
                    : <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Блок {7 - q.daysAgo} дн</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AnalyticsPage;