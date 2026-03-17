import React, { useState } from 'react';
import { initialSystemSettings } from '../data/mockData';

const SettingsPage = () => {
  const [settings, setSettings] = useState(initialSystemSettings);

  const toggleOperator = (operator) => {
    const newOps = { ...settings.operators };
    newOps[operator] = { ...newOps[operator], active: !newOps[operator].active };
    setSettings({ ...settings, operators: newOps });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Настройки системы</h2>

      {/* Quiz params */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Параметры викторины</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус викторины</label>
            <button
              onClick={() => setSettings({ ...settings, quiz_active: !settings.quiz_active })}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${settings.quiz_active ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
            >
              {settings.quiz_active ? 'Активна' : 'Остановлена'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Баллы за вопрос</label>
            <input
              type="number"
              value={settings.points_per_question}
              onChange={e => setSettings({ ...settings, points_per_question: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Макс. вопросов в день</label>
            <input
              type="number"
              value={settings.max_questions_per_day}
              onChange={e => setSettings({ ...settings, max_questions_per_day: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Стоимость подписки</label>
            <input
              type="number"
              step="0.01"
              value={settings.subscription_cost}
              onChange={e => setSettings({ ...settings, subscription_cost: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Prizes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Призы за места (викторина)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[['prize_first', '🥇 1 место'], ['prize_second', '🥈 2 место'], ['prize_third', '🥉 3 место']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="number"
                value={settings[key]}
                onChange={e => setSettings({ ...settings, [key]: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SMS templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Шаблоны SMS сообщений</h3>
        <div className="space-y-4">
          {[
            ['sms_question_template', 'Шаблон вопроса', 3],
            ['sms_correct_template', 'Шаблон правильного ответа', 2],
            ['sms_wrong_template', 'Шаблон неправильного ответа', 2],
          ].map(([key, label, rows]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <textarea
                value={settings[key]}
                onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                rows={rows}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Operators */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Управление операторами</h3>
        <div className="space-y-3">
          {Object.entries(settings.operators).map(([operator, config]) => (
            <div key={operator} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${config.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-semibold text-sm">{operator}</p>
                  <p className="text-xs text-gray-500">Код: {config.shortcode}</p>
                </div>
              </div>
              <button
                onClick={() => toggleOperator(operator)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  config.active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {config.active ? 'Отключить' : 'Включить'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
          Отмена
        </button>
        <button
          onClick={() => alert('Настройки сохранены!')}
          className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;