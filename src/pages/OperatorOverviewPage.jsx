import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Phone, Repeat } from 'lucide-react';
import { OVERVIEW_STATUSES, fetchOperatorOverview } from '../features/operatorsOverview/operatorsOverviewApi';
import { getOperatorColors, operatorName } from '../utils/operatorColors';
import { formatDay, mediaUrl, money, today } from '../utils/utils';
import { getPeriodPhase } from '../utils/helpers';
import { ErrorBox } from '../components/ContentModal';
import FinanceSummary from '../components/FinanceSummary';
import NoAccess from '../components/NoAccess';
import DocumentsTable from '../components/documents/DocumentsTable';

const EXPENSE_CATEGORIES = {
  ads: 'Реклама',
  sms: 'SMS',
  operator_fee: 'Комиссия оператора',
  salary: 'Зарплата',
  prizes: 'Призы',
  other: 'Прочее',
};

const fmtPct = (v) => `${Number(Number(v).toFixed(2)).toLocaleString('ru-RU')}%`;
const asMoney = (v) => (Number.isFinite(Number(v)) ? money(Number(v)) : v);
const asText = (v) => (Array.isArray(v) ? v.join(', ') : String(v));
const asList = (v) => (Array.isArray(v) ? v : []);
const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
const byDateDesc = (key) => (a, b) => String(b[key] ?? '').localeCompare(String(a[key] ?? ''));
const asUrl = (value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

// Первое заполненное поле из списка имён
const pick = (sources, keys) => {
  for (const source of sources) {
    for (const key of keys) if (!isEmpty(source?.[key])) return source[key];
  }
  return undefined;
};

const ExternalA = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-blue-600 hover:underline break-all"
  >
    {children} <ExternalLink size={13} className="shrink-0" />
  </a>
);

// Блок 1 «Основное»
const MAIN_FIELDS = [
  { label: 'Название', keys: ['name'] },
  { label: 'Юр. лицо', keys: ['legal_name', 'legal_entity'] },
  { label: 'Статус', keys: ['status'], render: (v) => OVERVIEW_STATUSES[v]?.label ?? v },
  { label: 'Дата запуска', keys: ['launch_date', 'launched_at'], render: formatDay },
  { label: 'Короткий номер', keys: ['short_number', 'short_code', 'shortcode'] },
  { label: 'USSD-коды', keys: ['ussd_codes', 'ussd_code', 'ussd'] },
  { label: 'Сайт', keys: ['site_url', 'website', 'site'], render: (v) => <ExternalA href={asUrl(v)}>{v}</ExternalA> },
  {
    label: 'Регламент',
    keys: ['rules_url'],
    render: (v) => <ExternalA href={String(v).startsWith('/') ? mediaUrl(v) : asUrl(v)}>Открыть</ExternalA>,
  },
];

// Блок 2 «Договор и тарифы»
const TARIFF_FIELDS = [
  { label: 'Номер договора', keys: ['contract_number', 'contract_no'] },
  { label: 'Дата договора', keys: ['contract_date'], render: formatDay },
  { label: 'Стоимость подписки', keys: ['subscription_price', 'subscription_cost'], render: asMoney },
  { label: 'Стоимость доп. пакета', keys: ['extra_price', 'extra_pack_price', 'extra_cost'], render: asMoney },
  { label: 'Коэффициент без НДС', keys: ['vat_coefficient', 'vat_coef'] },
  { label: 'Коэффициент без НДС (подписка)', keys: ['subscription_vat_coef', 'subscription_coef'] },
  { label: 'Коэффициент без НДС (доп. пакет)', keys: ['extra_vat_coef', 'extra_coef'] },
  { label: 'Доля оператора', keys: ['operator_share_pct'], render: fmtPct },
  { label: 'Наша доля', keys: ['our_share_pct'], render: fmtPct },
];

// Остальное из вкладки «Настройки»
const SETTINGS_FIELDS = [
  { label: 'Основное списание', keys: ['rebill_time'] },
  { label: 'Дополнительные попытки', keys: ['rebill_retry_times'] },
  { label: 'Первый вопрос', keys: ['first_question_time'] },
  { label: 'Время на ответ', keys: ['question_timeout_min'], render: (v) => `${v} мин` },
  { label: 'Длительность периода', keys: ['period_days'], render: (v) => `${v} дн.` },
  { label: 'Коды биллинга', keys: ['billing_shortcodes'] },
];

const Section = ({ title, children, flush }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <h3 className="px-6 pt-5 pb-3 font-semibold text-gray-800">{title}</h3>
    <div className={flush ? '' : 'px-6 pb-6'}>{children}</div>
  </section>
);

// Поле, которого нет в данных, не показываем
const FieldsSection = ({ title, fields, sources }) => {
  const rows = fields
    .map((f) => ({ ...f, value: pick(sources, f.keys) }))
    .filter((f) => f.value !== undefined);
  if (rows.length === 0) return null;
  return (
    <Section title={title}>
      <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
        {rows.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="text-xs text-gray-400">{f.label}</dt>
            <dd className="text-sm font-medium text-gray-800 break-words">
              {f.render ? f.render(f.value) : asText(f.value)}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
};

// columns: { title, right, value(row), render(row), className }.
// Колонку, в которой нет ни одного значения, не показываем
const SimpleTable = ({ rows, columns }) => {
  const visible = columns.filter((c) => rows.some((r) => !isEmpty(c.value(r))));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="bg-gray-50">
            {visible.map((c) => (
              <th
                key={c.title}
                className={`px-6 py-2.5 text-xs font-medium text-gray-500 uppercase ${c.right ? 'text-right' : 'text-left'}`}
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className="border-b border-gray-100 last:border-0 align-top">
              {visible.map((c) => (
                <td
                  key={c.title}
                  className={`px-6 py-3 text-sm ${c.right ? 'text-right' : ''} ${c.className ?? 'text-gray-600'}`}
                >
                  {isEmpty(c.value(r)) ? null : c.render ? c.render(r) : asText(c.value(r))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CONTACT_COLUMNS = [
  { title: 'ФИО', value: (c) => c.full_name, className: 'font-medium text-gray-800' },
  { title: 'Должность', value: (c) => c.position },
  {
    title: 'Телефон',
    value: (c) => c.phone,
    render: (c) => (
      <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-blue-600 whitespace-nowrap">
        <Phone size={13} className="text-gray-400" /> {c.phone}
      </a>
    ),
  },
  { title: 'Дата рождения', value: (c) => c.birth_date, render: (c) => formatDay(c.birth_date) },
  { title: 'Заметки', value: (c) => c.notes, className: 'text-gray-500 whitespace-pre-line' },
];

const PARTNER_COLUMNS = [
  { title: 'Партнёр', value: (p) => p.name, className: 'font-medium text-gray-800' },
  {
    title: 'Доля',
    right: true,
    value: (p) => p.share_pct,
    render: (p) => fmtPct(p.share_pct),
    className: 'font-semibold text-gray-900',
  },
];

const EXPENSE_COLUMNS = [
  {
    title: 'Дата',
    value: (e) => e.expense_date,
    render: (e) => formatDay(e.expense_date),
    className: 'text-gray-600 whitespace-nowrap',
  },
  {
    title: 'Категория',
    value: (e) => e.category,
    render: (e) => e.category_label ?? e.category_name ?? EXPENSE_CATEGORIES[e.category] ?? e.category,
  },
  { title: 'Комментарий', value: (e) => e.comment },
  {
    title: 'Повтор',
    value: (e) => (e.is_monthly ? 'ежемесячно' : ''),
    render: (e) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Repeat size={13} className="text-gray-400" /> ежемесячно{e.end_date ? ` до ${formatDay(e.end_date)}` : ''}
      </span>
    ),
  },
  {
    title: 'Сумма, TJS',
    right: true,
    value: (e) => e.amount,
    render: (e) => Number(e.amount).toFixed(2),
    className: 'font-semibold text-gray-900 whitespace-nowrap',
  },
];

const PRIZE_COLUMNS = [
  { title: 'Приз', value: (p) => p.title, className: 'font-medium text-gray-800' },
  { title: 'Описание', value: (p) => p.description },
  {
    title: 'Стоимость',
    right: true,
    value: (p) => p.cost,
    render: (p) => asMoney(p.cost),
    className: 'text-gray-600 whitespace-nowrap',
  },
];

const PeriodsSection = ({ periods, prizes }) => {
  const ids = new Set(periods.map((p) => p.id));
  const orphanPrizes = prizes.filter((p) => !ids.has(p.period_id));
  return (
    <Section title="Периоды и призы">
      <div className="space-y-4">
        {[...periods].sort(byDateDesc('start_date')).map((p) => {
          const phase = getPeriodPhase(p, today());
          const own = prizes.filter((x) => x.period_id === p.id);
          return (
            <div key={p.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="px-6 py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                {p.start_date && p.end_date && (
                  <span className="text-xs text-gray-500">{formatDay(p.start_date)} — {formatDay(p.end_date)}</span>
                )}
                {p.is_published != null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${phase.bg} ${phase.color}`}>{phase.text}</span>
                )}
              </div>
              {own.length > 0 && <SimpleTable rows={own} columns={PRIZE_COLUMNS} />}
            </div>
          );
        })}
        {orphanPrizes.length > 0 && <SimpleTable rows={orphanPrizes} columns={PRIZE_COLUMNS} />}
      </div>
    </Section>
  );
};

// Документы по типам, внутри группы новые сверху
const DocumentsSection = ({ documents }) => {
  const groups = useMemo(() => {
    const map = new Map();
    [...documents].sort(byDateDesc('uploaded_at')).forEach((d) => {
      const key = d.type ?? d.type_name ?? '';
      if (!map.has(key)) map.set(key, { key, name: d.type_name || d.type || 'Без типа', items: [] });
      map.get(key).items.push(d);
    });
    return [...map.values()];
  }, [documents]);

  return (
    <Section title="Документы оператора" flush>
      {groups.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-gray-400">Документов пока нет</p>
      ) : (
        groups.map((g) => (
          <div key={g.key} className="border-t border-gray-100">
            <h4 className="px-6 py-3 text-sm font-semibold text-gray-700">
              {g.name} <span className="font-normal text-gray-400">· {g.items.length}</span>
            </h4>
            <DocumentsTable documents={g.items} showType={false} />
          </div>
        ))
      )}
    </Section>
  );
};

// Карточка оператора: все сведения одним запросом, только чтение
const OperatorOverviewPage = () => {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetchOperatorOverview(code)
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [code]);

  const back = (
    <Link to="/operators" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
      <ChevronLeft size={16} /> Операторы
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {back}
        {error.status === 403 ? (
          <NoAccess />
        ) : (
          <ErrorBox>{error.status === 404 ? `Оператор «${code}» не найден` : error.message}</ErrorBox>
        )}
      </div>
    );
  }
  if (!data) return <p className="text-sm text-gray-400">Загрузка…</p>;

  const operator = data.operator ?? {};
  const settings = (Array.isArray(data.settings) ? data.settings[0] : data.settings) ?? {};
  const contacts = asList(data.contacts);
  const partners = asList(data.partners);
  const expenses = [...asList(data.expenses)].sort(byDateDesc('expense_date'));
  const periods = asList(data.periods);
  const prizes = asList(data.prizes);
  const finance = data.finance && !Array.isArray(data.finance) ? data.finance : null;

  const colors = getOperatorColors(code);
  const name = operator.name || operatorName(code);
  const status = OVERVIEW_STATUSES[operator.status];

  // «Наша доля» отдельно не хранится: это остаток от доли оператора
  const share = pick([settings, operator], ['operator_share_pct']);
  const derived =
    share !== undefined && Number.isFinite(Number(share)) ? { our_share_pct: 100 - Number(share) } : {};

  return (
    <div className="space-y-6">
      {back}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: colors.bg }} />
        <div className="px-6 py-5 flex items-center gap-4">
          <div
            className="w-14 h-14 shrink-0 rounded-xl border bg-white flex items-center justify-center overflow-hidden"
            style={{ borderColor: colors.bg }}
          >
            {operator.logo_url ? (
              <img src={mediaUrl(operator.logo_url)} alt="" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="font-bold text-xl" style={{ color: colors.active }}>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            {operator.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.className ?? 'bg-gray-100 text-gray-500'}`}>
                {status?.label ?? operator.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <FieldsSection title="Основное" fields={MAIN_FIELDS} sources={[operator, settings]} />
      <FieldsSection title="Договор и тарифы" fields={TARIFF_FIELDS} sources={[settings, operator, derived]} />
      <FieldsSection title="Списания и викторина" fields={SETTINGS_FIELDS} sources={[settings]} />

      {contacts.length > 0 && (
        <Section title="Ответственные и контакты" flush>
          <SimpleTable rows={contacts} columns={CONTACT_COLUMNS} />
        </Section>
      )}
      {partners.length > 0 && (
        <Section title="Партнёры" flush>
          <SimpleTable rows={partners} columns={PARTNER_COLUMNS} />
        </Section>
      )}
      {expenses.length > 0 && (
        <Section title="Расходы" flush>
          <SimpleTable rows={expenses} columns={EXPENSE_COLUMNS} />
        </Section>
      )}
      {finance && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Финансы</h3>
          <FinanceSummary data={finance} />
        </div>
      )}
      {(periods.length > 0 || prizes.length > 0) && <PeriodsSection periods={periods} prizes={prizes} />}
      {Array.isArray(data.documents) && <DocumentsSection documents={data.documents} />}
    </div>
  );
};

export default OperatorOverviewPage;
