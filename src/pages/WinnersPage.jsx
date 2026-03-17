import React from 'react';
import { weeklyWinners } from '../data/mockData';

const WinnersPage = ({ onNavigate, autoTicketForTop3 = true }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Еженедельные победители</h2>
        <button
          onClick={() => onNavigate('main')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          ← Назад
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-1">🏆 Конкурс викторины</h3>
        <p className="text-sm opacity-90">Период: 2026-01-13 - 2026-01-19</p>
        {autoTicketForTop3 && (
          <p className="text-xs mt-2 bg-white bg-opacity-20 inline-block px-3 py-1 rounded-full">
            🎟️ Топ-3 получают лотерейный билет автоматически
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-4 text-center text-sm">Место</th>
              <th className="px-4 py-4 text-left text-sm">Номер</th>
              <th className="px-4 py-4 text-center text-sm">Ответов</th>
              <th className="px-4 py-4 text-center text-sm">Баллы</th>
              <th className="px-4 py-4 text-center text-sm">Приз</th>
              <th className="px-4 py-4 text-center text-sm">🎟️ Билет</th>
            </tr>
          </thead>
          <tbody>
            {weeklyWinners.map(winner => (
              <tr key={winner.rank} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 text-center text-xl">
                  {winner.rank === 1 && '🥇'}
                  {winner.rank === 2 && '🥈'}
                  {winner.rank === 3 && '🥉'}
                  {winner.rank > 3 && winner.rank}
                </td>
                <td className="px-4 py-4 font-mono text-sm">{winner.number}</td>
                <td className="px-4 py-4 text-center">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                    {winner.answersCount}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold">
                    {winner.points}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-bold text-emerald-700 text-sm">{winner.prize}</td>
                <td className="px-4 py-4 text-center">
                  {winner.rank <= 3
                    ? <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">🎟️ Выдан</span>
                    : <span className="text-gray-400 text-xs">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinnersPage;