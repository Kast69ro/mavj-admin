import React from 'react';
import { money, nf } from '../utils/utils';

const m = (v) => money(Number(v) || 0);

const Row = ({ label, value, sub, strong, negative, border }) => (
  <div className={`flex justify-between items-baseline gap-4 py-2.5 ${border ? 'border-t border-gray-200 mt-1' : ''}`}>
    <span className={`text-sm ${strong ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
      {label}
      {sub && <span className="block text-xs text-gray-400 font-normal">{sub}</span>}
    </span>
    <span
      className={`text-sm whitespace-nowrap ${strong ? 'font-bold text-gray-900 text-base' : 'font-medium text-gray-800'} ${
        negative ? 'text-red-600' : ''
      }`}
    >
      {value}
    </span>
  </div>
);

// Разбивка «выручка → доля оператора → валовая → расходы → чистая прибыль → партнёры»
// для ответа /finance (одного оператора или поля total общего отчёта)
const FinanceSummary = ({ data }) => {
  const net = Number(data?.net_profit) || 0;
  const categories = data?.expenses_by_category || [];
  const partners = data?.partners || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-2">Расчёт прибыли</h3>
        <Row label="Выручка" sub={data?.charges != null ? `Успешных списаний: ${nf(data.charges)}` : null} value={m(data?.revenue)} />
        <Row
          label="Доля оператора"
          sub={data?.operator_share_pct != null ? `${data.operator_share_pct}% от выручки` : null}
          value={`− ${m(data?.operator_share)}`}
        />
        <Row label="Наша валовая" value={m(data?.our_gross)} border />
        <Row label="Расходы" value={`− ${m(data?.expenses)}`} />
        <div className={`mt-2 -mx-2 px-2 rounded-lg ${net < 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <Row label="Чистая прибыль" value={m(net)} strong negative={net < 0} />
        </div>
      </section>

      <div className="space-y-4">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Расходы по категориям</h3>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Расходов за период нет</p>
          ) : (
            categories.map((c) => <Row key={c.category} label={c.label ?? c.category} value={m(c.amount)} />)
          )}
        </section>

        {partners.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Доли партнёров</h3>
            {partners.map((p) => (
              <Row key={p.name} label={p.name} sub={`${p.share_pct}%`} value={m(p.amount)} negative={Number(p.amount) < 0} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default FinanceSummary;
