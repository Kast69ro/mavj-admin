import React from 'react';
import { loginHistory } from '../data/mockData';

const LoginHistoryPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">История входов в систему</h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <p className="text-sm text-gray-600">Всего входов</p>
        <p className="text-3xl font-bold text-blue-600">{loginHistory.length}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <p className="text-sm text-gray-600">Успешных</p>
        <p className="text-3xl font-bold text-emerald-600">{loginHistory.filter(l => l.status === 'success').length}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <p className="text-sm text-gray-600">Неудачных</p>
        <p className="text-3xl font-bold text-red-500">{loginHistory.filter(l => l.status === 'failed').length}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <p className="text-sm text-gray-600">Активных сессий</p>
        <p className="text-3xl font-bold text-purple-600">1</p>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время входа</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Устройство</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Статус</th>
          </tr>
        </thead>
        <tbody>
          {loginHistory.map(log => (
            <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-semibold text-sm">{log.fullName}</p>
                <p className="text-xs text-gray-500">@{log.username}</p>
              </td>
              <td className="px-4 py-3 text-sm">{log.loginTime}</td>
              <td className="px-4 py-3 text-sm font-mono">{log.ip}</td>
              <td className="px-4 py-3 text-sm">{log.device}</td>
              <td className="px-4 py-3 text-center">
                {log.status === 'success'
                  ? <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Успешно</span>
                  : <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Отклонено</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LoginHistoryPage;