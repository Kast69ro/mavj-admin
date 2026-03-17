import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SubscribersPage = () => {
  const [searchNumber, setSearchNumber] = useState('');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Просмотр абонентов</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Введите номер телефона"
            value={searchNumber}
            onChange={e => setSearchNumber(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Search size={18} />Поиск
          </button>
        </div>

        {searchNumber && (
          <div className="border-t pt-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">Номер: {searchNumber}</h3>
              <p className="text-sm text-gray-600">SMS переписка с контентом</p>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Вопрос: Столица Таджикистана?</p>
                <p className="text-xs text-gray-500 mt-1">15.01.2026 14:23</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg ml-8">
                <p className="text-sm font-medium">Ответ: Душанбе ✔</p>
                <p className="text-xs text-gray-500 mt-1">Баллы: +10</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Количество вопросов</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Зачисленные баллы</p>
                <p className="text-2xl font-bold text-emerald-600">150</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersPage;