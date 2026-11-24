import React from 'react';
import { MONTHS_RU, today } from '../../utils/utils';

const FIRST_YEAR = 2020;

const getYears = (selected) => {
  const last = Number(today().slice(0, 4)) + 1;
  const years = [];
  for (let y = last; y >= FIRST_YEAR; y -= 1) years.push(String(y));
  if (selected && !years.includes(selected)) years.push(selected);
  return years;
};

// Период «месяц + год» → "YYYY-MM". Отдельные списки вместо <input type="month">,
// потому что в Firefox и Safari его нет.
// yearOnly — разрешить выбрать только год ("YYYY"), нужно для фильтра
const PeriodSelect = ({ value, onChange, yearOnly = false, className = '' }) => {
  const [year = '', month = ''] = (value || '').split('-');

  const handleYear = (y) => {
    if (!y) return onChange('');
    if (month) return onChange(`${y}-${month}`);
    // В форме период — это всегда месяц и год, поэтому месяц подставляем сразу
    onChange(yearOnly ? y : `${y}-${today().slice(5, 7)}`);
  };

  const handleMonth = (m) => {
    if (!m) return onChange(yearOnly ? year : '');
    onChange(`${year || today().slice(0, 4)}-${m}`);
  };

  return (
    <div className="flex gap-2">
      <select aria-label="Месяц" value={month} onChange={(e) => handleMonth(e.target.value)} className={className}>
        <option value="">{yearOnly && year ? 'Весь год' : 'Месяц'}</option>
        {MONTHS_RU.map((label, i) => (
          <option key={label} value={String(i + 1).padStart(2, '0')}>{label}</option>
        ))}
      </select>
      <select aria-label="Год" value={year} onChange={(e) => handleYear(e.target.value)} className={className}>
        <option value="">Год</option>
        {getYears(year).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelect;
