import React from 'react';

const BillingPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Биллинг и финансы</h2>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Выручка (месяц)', value: '412,250 ₴', sub: '↑ +15.8%', from: 'emerald' },
        { label: 'Расходы SMS', value: '125,000 ₴', from: 'blue' },
        { label: 'Призы', value: '45,000 ₴', from: 'amber' },
        { label: 'Чистая прибыль', value: '242,250 ₴', sub: 'Рентабельность: 58.8%', from: 'purple' },
      ].map(({ label, value, sub, from }) => (
        <div key={label} className={`bg-gradient-to-br from-${from}-500 to-${from}-600 rounded-xl shadow-lg p-5 text-white`}>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {sub && <p className="text-xs mt-1 opacity-75">{sub}</p>}
        </div>
      ))}
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Стоимость SMS по операторам</h3>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Оператор</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Отправлено</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Тариф</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Стоимость</th>
          </tr>
        </thead>
        <tbody>
          {[
            { op: 'Tcell', sent: '45,230', rate: '0.10 ₴', cost: '4,523 ₴' },
            { op: 'Мегафон', sent: '38,150', rate: '0.09 ₴', cost: '3,434 ₴' },
            { op: 'Babilon', sent: '28,920', rate: '0.11 ₴', cost: '3,181 ₴' },
            { op: 'Zet-Mobile', sent: '12,500', rate: '0.10 ₴', cost: '1,250 ₴' },
          ].map(({ op, sent, rate, cost }) => (
            <tr key={op} className="border-b border-gray-100">
              <td className="px-4 py-3 text-sm font-medium">{op}</td>
              <td className="px-4 py-3 text-center text-sm">{sent}</td>
              <td className="px-4 py-3 text-center text-sm">{rate}</td>
              <td className="px-4 py-3 text-right font-semibold text-sm">{cost}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-bold">
            <td className="px-4 py-3 text-sm">Итого</td>
            <td className="px-4 py-3 text-center text-sm">124,800</td>
            <td />
            <td className="px-4 py-3 text-right text-sm">12,388 ₴</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default BillingPage;