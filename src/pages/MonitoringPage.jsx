import React from 'react';
import { operators } from '../data/mockData';

const MonitoringPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Мониторинг системы</h2>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow p-5 text-white">
        <p className="text-sm opacity-90">Статус системы</p>
        <p className="text-2xl font-bold">Работает</p>
      </div>
      {[
        { label: 'CPU', value: 24, color: 'blue' },
        { label: 'Память', value: 68, color: 'purple' },
        { label: 'Диск', value: 42, color: 'orange' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className={`bg-${color}-600 h-2 rounded-full`} style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">SMS статистика за сегодня</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Отправлено SMS</p>
          <p className="text-3xl font-bold text-blue-600">1,247</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Доставлено</p>
          <p className="text-3xl font-bold text-emerald-600">1,189</p>
          <p className="text-xs text-gray-500 mt-1">95.3%</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <p className="text-sm text-gray-600">Ошибки</p>
          <p className="text-3xl font-bold text-red-500">58</p>
          <p className="text-xs text-gray-500 mt-1">4.7%</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Статус операторов</h3>
      <div className="space-y-3">
        {operators.map(operator => (
          <div key={operator} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-sm">{operator}</p>
                <p className="text-xs text-gray-500">Онлайн • Средний ответ: 1.2с</p>
              </div>
            </div>
            <p className="text-sm font-medium text-emerald-600">99.8% Uptime</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MonitoringPage;