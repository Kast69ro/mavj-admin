import React, { Fragment, useEffect, useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { fetchSubscriberDay, fetchSubscriberDays } from '../features/subscribers/subscribers';
import { dateInputClass, formatDate, formatDay } from '../utils/utils';
import { ErrorBox } from './ContentModal';

const DAY_STATUSES = {
  charged: { label: 'Списано', className: 'bg-emerald-100 text-emerald-800' },
  not_charged: { label: 'Не списано', className: 'bg-orange-100 text-orange-800' },
  refunded: { label: 'Возврат', className: 'bg-red-100 text-red-700' },
  no_attempt: { label: 'Нет попыток', className: 'bg-gray-100 text-gray-600' },
};

const CHARGE_TYPES = {
  subscription: 'Подписка',
  subscribe: 'Подписка',
  rebill: 'Ежедневное списание',
  extra: 'Доп. пакет',
  refund: 'Возврат',
};

const CHARGE_STATUSES = {
  success: { label: 'Успешно', className: 'text-emerald-700' },
  charged: { label: 'Списано', className: 'text-emerald-700' },
  failed: { label: 'Не списано', className: 'text-orange-700' },
  fail: { label: 'Не списано', className: 'text-orange-700' },
  not_charged: { label: 'Не списано', className: 'text-orange-700' },
  pending: { label: 'В обработке', className: 'text-gray-500' },
  refunded: { label: 'Возврат', className: 'text-red-700' },
  refund: { label: 'Возврат', className: 'text-red-700' },
};

const OK = { label: 'Верно', className: 'bg-emerald-100 text-emerald-800' };
const WRONG = { label: 'Неверно', className: 'bg-red-100 text-red-700' };
const TIMEOUT = { label: 'Таймаут', className: 'bg-gray-100 text-gray-600' };

const Badge = ({ className, children }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${className}`}>{children}</span>
);

const Th = ({ children, right }) => (
  <th className={`px-3 py-2 text-xs font-medium text-gray-500 uppercase whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
);

// Время в ответе — UTC, показываем по Душанбе. Если сервер прислал только часы — оставляем как есть
const formatTime = (value) => {
  if (!value) return '';
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return formatDate(value).split(', ')[1] ?? '';
};

const ratio = (part) => `${part?.answered ?? 0}/${part?.available ?? 0}`;
const amount = (v) => Number(v ?? 0).toFixed(2);

// Варианты ответа: массив/словарь options либо отдельные поля option_1…option_4
const getOptions = (q) => {
  const raw = q.options ?? q.variants;
  if (Array.isArray(raw)) {
    return raw.map((o, i) => ({ key: String(o?.key ?? o?.code ?? i + 1), text: o?.text ?? o?.value ?? o }));
  }
  if (raw && typeof raw === 'object') return Object.entries(raw).map(([key, text]) => ({ key, text }));
  return [1, 2, 3, 4]
    .filter((n) => q[`option_${n}`])
    .map((n) => ({ key: String(n), text: q[`option_${n}`] }));
};

const sameAnswer = (option, answer) =>
  answer != null &&
  [option.key, option.text].some((v) => String(v).trim().toLowerCase() === String(answer).trim().toLowerCase());

const getResult = (q) => {
  if (q.is_timeout || q.timeout === true || q.result === 'timeout') return TIMEOUT;
  return q.is_correct ?? q.correct ?? q.result === 'correct' ? OK : WRONG;
};

const QuestionsTable = ({ questions }) => (
  <div className="overflow-x-auto border border-gray-100 rounded-lg bg-white">
    <table className="w-full min-w-[720px] text-sm">
      <thead>
        <tr className="bg-gray-50">
          <Th>Время</Th>
          <Th>Тип</Th>
          <Th>Вопрос и варианты</Th>
          <Th>Ответ</Th>
          <Th>Результат</Th>
          <Th right>Баллы</Th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q, i) => {
          const type = q.batch_type ?? q.type;
          const text = q.question ?? q.text ?? q.question_text;
          const answer = q.answer_given ?? q.answer;
          const result = getResult(q);
          return (
            <tr key={q.id ?? i} className="border-t border-gray-100 align-top">
              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatTime(q.answered_at ?? q.time ?? q.created_at ?? q.sent_at)}</td>
              <td className="px-3 py-2">
                {type && (
                  <Badge className={type === 'extra' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}>{type}</Badge>
                )}
              </td>
              <td className="px-3 py-2 max-w-[360px]">
                {text ? (
                  <p className="text-gray-800">{text}</p>
                ) : (
                  <p className="inline-flex items-center gap-1 text-gray-400 italic"><HelpCircle size={14} /> Вопрос недоступен</p>
                )}
                <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                  {getOptions(q).map((o) => {
                    const chosen = sameAnswer(o, answer);
                    const correct = sameAnswer(o, q.correct_answer) || (chosen && result === OK);
                    return (
                      <li key={o.key} className={correct ? 'text-emerald-700 font-medium' : chosen ? 'text-red-600' : ''}>
                        {o.key}. {String(o.text)}{chosen ? ' ←' : ''}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td className="px-3 py-2 text-gray-700">{answer ?? ''}</td>
              <td className="px-3 py-2"><Badge className={result.className}>{result.label}</Badge></td>
              <td className="px-3 py-2 text-right font-medium text-gray-800">{q.points ?? 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const BillingTable = ({ billing }) => (
  <div className="overflow-x-auto border border-gray-100 rounded-lg bg-white">
    <table className="w-full min-w-[420px] text-sm">
      <thead>
        <tr className="bg-gray-50">
          <Th>Время</Th>
          <Th>Тип</Th>
          <Th right>Сумма, TJS</Th>
          <Th>Статус</Th>
        </tr>
      </thead>
      <tbody>
        {billing.map((b, i) => {
          const type = b.charge_type ?? b.type;
          const status = CHARGE_STATUSES[String(b.status).toLowerCase()];
          return (
            <tr key={b.id ?? i} className="border-t border-gray-100">
              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatTime(b.created_at ?? b.time ?? b.charged_at ?? b.billed_at)}</td>
              <td className="px-3 py-2 text-gray-700">{b.type_name ?? CHARGE_TYPES[type] ?? type}</td>
              <td className="px-3 py-2 text-right text-gray-800">{amount(b.amount)}</td>
              <td className={`px-3 py-2 ${status?.className ?? 'text-gray-600'}`}>{b.status_name ?? status?.label ?? b.status}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const DayDetails = ({ msisdn, day }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSubscriberDay(msisdn, day)
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [msisdn, day]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <p className="text-sm text-gray-400">Загрузка…</p>;

  const questions = data.questions || [];
  const billing = data.billing || [];
  return (
    <div className="space-y-4">
      <div>
        <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Вопросы · {questions.length}</h5>
        {questions.length ? <QuestionsTable questions={questions} /> : <p className="text-sm text-gray-400">Вопросов за день нет</p>}
      </div>
      <div>
        <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Списания и попытки · {billing.length}</h5>
        {billing.length ? <BillingTable billing={billing} /> : <p className="text-sm text-gray-400">Списаний и попыток за день нет</p>}
      </div>
    </div>
  );
};

// Таблица «по дням» в карточке абонента, новые сверху. Клик по строке раскрывает подробности дня
const SubscriberDays = ({ msisdn }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [days, setDays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDay, setOpenDay] = useState(null);

  const rangeInvalid = dateFrom && dateTo && dateFrom > dateTo;

  useEffect(() => {
    if (rangeInvalid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOpenDay(null);
    fetchSubscriberDays(msisdn, { date_from: dateFrom, date_to: dateTo })
      .then((res) => !cancelled && setDays([...(res?.days || [])].sort((a, b) => b.date.localeCompare(a.date))))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [msisdn, dateFrom, dateTo, rangeInvalid]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-gray-900">По дням</h4>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" aria-label="С даты" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={dateInputClass} />
          <span className="text-gray-400">—</span>
          <input type="date" aria-label="По дату" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={dateInputClass} />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {rangeInvalid && <ErrorBox>Дата начала позже даты окончания</ErrorBox>}
      <ErrorBox>{error}</ErrorBox>

      <div className={`overflow-x-auto border border-gray-200 rounded-lg ${loading && days ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-gray-50">
              <Th>Дата</Th>
              <Th>Статус</Th>
              <Th right>Основные</Th>
              <Th right>Доп. вопросы</Th>
              <Th right>Баллы</Th>
              <Th right>Таймауты</Th>
              <Th right>Списано, TJS</Th>
            </tr>
          </thead>
          <tbody>
            {!days?.length && !error && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  {loading ? 'Загрузка…' : 'Данных по дням нет'}
                </td>
              </tr>
            )}
            {days?.map((d) => {
              const status = DAY_STATUSES[d.status];
              const open = openDay === d.date;
              const toggle = () => setOpenDay(open ? null : d.date);
              return (
                <Fragment key={d.date}>
                  <tr
                    onClick={toggle}
                    className={`border-t border-gray-100 cursor-pointer ${
                      d.anomaly ? 'bg-yellow-100 hover:bg-yellow-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={(e) => { e.stopPropagation(); toggle(); }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <ChevronRight size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
                        {formatDay(d.date)}
                        {d.anomaly && (
                          <span
                            title="Больше, чем оплачено"
                            aria-label="Больше, чем оплачено"
                            className="w-4 h-4 rounded-full bg-yellow-500 text-white text-xs font-bold leading-4 text-center"
                          >
                            !
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={status?.className ?? 'bg-gray-100 text-gray-600'}>{status?.label ?? d.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">{ratio(d.basic)}</td>
                    <td
                      className="px-3 py-2 text-right text-gray-700"
                      title={d.extra?.packs ? `Пакетов: ${d.extra.packs}` : undefined}
                    >
                      {ratio(d.extra)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">{d.points ?? 0}/{d.max_points ?? 0}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{d.timeouts > 0 ? d.timeouts : ''}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{amount(d.spent)}</td>
                  </tr>
                  {open && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-4"><DayDetails msisdn={msisdn} day={d.date} /></td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriberDays;
