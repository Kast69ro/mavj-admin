import  { useState } from 'react';
import { operators, subscribers } from '../data/mockData';

const MainPage = ({ onNavigate }) => {
  const [selectedOperator, setSelectedOperator] = useState('Tcell');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Главная</h2>

      {/* Operator selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Выбор оператора</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {operators.map(op => (
            <button
              key={op}
              onClick={() => setSelectedOperator(op)}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                selectedOperator === op
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Подключено</p>
            <p className="text-3xl font-bold text-emerald-600">1,234</p>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <p className="text-sm text-gray-600">Отписано</p>
            <p className="text-3xl font-bold text-red-500">156</p>
          </div>
        </div>
      </div>

      {/* Billing table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Тарификация</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Дата</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Номер</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Баллы</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{sub.date}</td>
                  <td className="px-4 py-3 text-sm font-mono">{sub.number}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {sub.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={() => onNavigate('winners')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Лидеры →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;