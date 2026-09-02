// src/pages/StatisticsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "../features/analytics/analytics";
import { fetchOperators } from "../features/operators/operators";

// ===== Статичные данные (нет отдельного эндпоинта — оставлены как заглушка) =====
const CHANNELS = ["ussd", "sms", "api", "push"];
const CHANNEL_TITLES = {
  ussd: { name: "USSD", code: "*3033#" },
  sms: { name: "SMS", code: "короткий номер" },
  api: { name: "API", code: "внешние вызовы" },
  push: { name: "PUSH", code: "*3033*999#" },
};

const OPERATORS = [
  { code: "babilon", title: "Билайн (Babilon)" },
  { code: "megafon", title: "Мегафон" },
];
const OPERATOR_TITLES = OPERATORS.reduce(
  (acc, o) => ({ ...acc, [o.code]: o.title }),
  {}
);

const STATIC_TIMELINE = {
  granularity: "day",
  points: [
    { bucket: "2026-08-27", total: 1200, success: 1080, failed: 120 },
    { bucket: "2026-08-28", total: 1340, success: 1210, failed: 130 },
    { bucket: "2026-08-29", total: 1150, success: 1010, failed: 140 },
    { bucket: "2026-08-30", total: 1420, success: 1300, failed: 120 },
    { bucket: "2026-08-31", total: 1500, success: 1390, failed: 110 },
    { bucket: "2026-09-01", total: 1600, success: 1470, failed: 130 },
    { bucket: "2026-09-02", total: 1380, success: 1260, failed: 120 },
  ],
};

const STATIC_CHANNELS = [
  { channel: "ussd", total: 5200, success: 4700, failed: 500, successRate: 90.4, share: 46 },
  { channel: "sms", total: 3100, success: 2850, failed: 250, successRate: 91.9, share: 27 },
  { channel: "api", total: 1800, success: 1720, failed: 80, successRate: 95.6, share: 16 },
  { channel: "push", total: 1300, success: 1180, failed: 120, successRate: 90.8, share: 11 },
];

const STATIC_OPERATORS = [
  {
    operator: "megafon",
    title: "Мегафон",
    channels: {
      ussd: { total: 1800, failed: 180 },
      sms: { total: 900, failed: 70 },
      api: { total: 400, failed: 15 },
      push: { total: 300, failed: 25 },
    },
    total: 3400,
    failed: 290,
    successRate: 91.5,
  },
  {
    operator: "babilon",
    title: "Билайн (Babilon)",
    channels: {
      ussd: { total: 3400, failed: 320 },
      sms: { total: 2200, failed: 180 },
      api: { total: 1400, failed: 65 },
      push: { total: 1000, failed: 95 },
    },
    total: 8000,
    failed: 660,
    successRate: 91.75,
  },
];

const STATIC_ERRORS = [
  { code: "insufficient_funds", channel: "ussd", count: 320, share: 45 },
  { code: "connection_error", channel: "sms", count: 210, share: 30 },
  { code: "stop_content", channel: "api", count: 175, share: 25 },
];

const ERROR_TITLES = {
  insufficient_funds: "Недостаточно средств",
  connection_error: "Обрыв связи с оператором",
  stop_content: "Стоп-контент",
};

const STATIC_SUMMARY = {
  requests: { total: 11400, success: 10450, failed: 950, successRate: 91.7, perDay: 1628.6 },
};

// ===== Даты =====
const toISO = (d) => d.toISOString().slice(0, 10);
const daysBetween = (from, to) =>
  Math.round((new Date(to) - new Date(from)) / 86400000) + 1;

const getPresetRange = (presetId) => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  switch (presetId) {
    case "today":
      return { from: toISO(today), to: toISO(today) };
    case "yesterday": {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return { from: toISO(d), to: toISO(d) };
    }
    case "7d": {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: toISO(d), to: toISO(today) };
    }
    case "30d": {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { from: toISO(d), to: toISO(today) };
    }
    case "month":
      return { from: toISO(new Date(y, m, 1)), to: toISO(today) };
    case "prevMonth":
      return {
        from: toISO(new Date(y, m - 1, 1)),
        to: toISO(new Date(y, m, 0)),
      };
    default:
      return { from: toISO(today), to: toISO(today) };
  }
};

const PRESETS = [
  { id: "today", label: "Сегодня" },
  { id: "yesterday", label: "Вчера" },
  { id: "7d", label: "7 дней" },
  { id: "30d", label: "30 дней" },
  { id: "month", label: "Этот месяц" },
  { id: "prevMonth", label: "Прошлый месяц" },
];

// ===== Утилиты форматирования =====
const nf = (v) => (v == null ? "—" : Number(v).toLocaleString("ru-RU"));
const rf = (v) => (v == null ? "—" : String(v).replace(".", ",") + "%");
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");

// ===== UI-примитивы =====
const Card = ({ title, right, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
        {right}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, sub, tone }) => (
  <div className="flex-1 min-w-[210px] bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
    <p className={`text-2xl font-bold ${tone || "text-gray-900"}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const Th = ({ children, right }) => (
  <th
    className={`px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 border-b border-gray-200 ${
      right ? "text-right" : "text-left"
    }`}
  >
    {children}
  </th>
);
const Td = ({ children, right, className = "" }) => (
  <td className={`px-3.5 py-3.5 border-b border-gray-100 ${right ? "text-right" : ""} ${className}`}>{children}</td>
);
const Chip = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
    {children}
  </span>
);

// ===== Подготовка данных для графика (без useMemo — простая функция) =====
const buildBars = () => {
  const points = STATIC_TIMELINE.points;
  const hourly = STATIC_TIMELINE.granularity === "hour";
  const max = Math.max(1, ...points.map((p) => p.total));
  return points.map((p) => ({
    ...p,
    okH: ((p.success / max) * 100).toFixed(2),
    failH: ((p.failed / max) * 100).toFixed(2),
    tick: hourly ? p.bucket.slice(11, 13) : p.bucket.slice(8) + "." + p.bucket.slice(5, 7),
    label: hourly ? p.bucket.slice(0, 10) + " " + p.bucket.slice(11, 16) : p.bucket,
  }));
};

const StatisticsPage = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state) => state.analytics);
  const { info: operatorsInfo } = useSelector((state) => state.operators);

  const [activePreset, setActivePreset] = useState("today");
  const [dateFrom, setDateFrom] = useState(getPresetRange("today").from);
  const [dateTo, setDateTo] = useState(getPresetRange("today").to);
  const [operator, setOperator] = useState(""); // "" — все операторы

  const handlePreset = (id) => {
    const { from, to } = getPresetRange(id);
    setActivePreset(id);
    setDateFrom(from);
    setDateTo(to);
  };

  const handleDateFromChange = (val) => {
    setActivePreset(null);
    setDateFrom(val);
  };

  const handleDateToChange = (val) => {
    setActivePreset(null);
    setDateTo(val);
  };

  const handleOperator = (code) => {
    setOperator((prev) => (prev === code ? "" : code));
  };

  useEffect(() => {
    dispatch(
      fetchAnalytics({
        date_from: dateFrom,
        date_to: dateTo,
        operator: operator || undefined,
      })
    );
    dispatch(fetchOperators());
  }, [dispatch, dateFrom, dateTo, operator]);

  const bars = buildBars();
  const push = STATIC_CHANNELS.find((c) => c.channel === "push");

  const displayFrom = data?.period?.from || dateFrom;
  const displayTo = data?.period?.to || dateTo;
  const displayDays = daysBetween(displayFrom, displayTo);

  const btnCls = (active) =>
    `px-3 py-2 rounded-lg text-sm font-medium border transition ${
      active
        ? "bg-indigo-500 border-indigo-500 text-white"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Статистика</h2>
          <p className="text-sm text-gray-500 mt-1">
            USSD, SMS, API и PUSH <b className="text-gray-700">*3033*999#</b> · запросы операторам на подписку и
            доп. пакеты · SMS отправленные и полученные
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-wrap gap-6 items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Период</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={btnCls(activePreset === p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Свои даты</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="text-sm px-2.5 py-2 rounded-lg border border-gray-200"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="text-sm px-2.5 py-2 rounded-lg border border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Компания</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setOperator("")} className={btnCls(operator === "")}>
              Все
            </button>
            {operatorsInfo?.map((o) => (
              <button key={o.id} onClick={() => handleOperator(o.code)} className={btnCls(operator === o.code)}>
                {o.name}
              </button>
            ))}
          </div>
        </div>

        <p className="ml-auto text-sm text-gray-500 pb-2">
          Срез:{" "}
          <b className="text-gray-900">
            {displayFrom === displayTo
              ? displayFrom
              : `${displayFrom} — ${displayTo} (${displayDays} дн.)`}
          </b>
          {isLoading && <span className="text-indigo-500"> · обновляется…</span>}
        </p>
      </div>

      {/* ===== Блок с реальными данными из fetchAnalytics ===== */}
      {isLoading && !data ? (
        <Card title="Обзор">
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        </Card>
      ) : error ? (
        <Card title="Обзор">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <p className="font-semibold text-sm">Не удалось загрузить данные</p>
            <p className="text-xs mt-1">{error?.message || "Проверьте параметры запроса"}</p>
            <button
              onClick={() =>
                dispatch(
                  fetchAnalytics({
                    date_from: dateFrom,
                    date_to: dateTo,
                    operator: operator || undefined,
                  })
                )
              }
              className="mt-3 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              Повторить
            </button>
          </div>
        </Card>
      ) : !data ? (
        <Card title="Обзор">
          <p className="text-sm text-gray-400 py-6 text-center">Данные недоступны</p>
        </Card>
      ) : (
        <>
          {/* Общие итоги по абонентам */}
          <div className="flex flex-wrap gap-4">
            <StatCard label="Всего когда-либо" value={nf(data.totals?.total_ever)} />
            <StatCard label="Активные" value={nf(data.totals?.active)} tone="text-green-600" />
            <StatCard label="На паузе" value={nf(data.totals?.paused)} tone="text-amber-700" />
            <StatCard label="Неактивные" value={nf(data.totals?.inactive_total)} tone="text-red-600" />
            <StatCard label="Отвечали хотя бы раз" value={nf(data.answered_at_least_once_ever)} />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Rebill */}
            <Card className="flex-1 min-w-[320px]" title="Ребилл (списания подписки)">
              <div className="space-y-3">
                {(data.rebill || []).map((r) => {
                  const total = (r.paid || 0) + (r.failed || 0);
                  return (
                    <div key={r.operator}>
                      <div className="flex justify-between items-center mb-1.5">
                        <Chip>{OPERATOR_TITLES[r.operator] || r.operator}</Chip>
                        <span className="text-sm text-gray-500">
                          <b className="text-green-600">{nf(r.paid)}</b> оплачено ·{" "}
                          <b className="text-red-600">{nf(r.failed)}</b> ошибок
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${pct(r.paid, total)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Успешность: {pct(r.paid, total)}%</p>
                    </div>
                  );
                })}
                {!data.rebill?.length && (
                  <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>
                )}
              </div>
            </Card>

            {/* Отписки */}
            <Card className="flex-1 min-w-[260px]" title="Отписки">
              <div className="space-y-2">
                {(data.unsubscribes || []).map((u) => (
                  <div key={u.operator} className="flex justify-between items-center">
                    <Chip>{OPERATOR_TITLES[u.operator] || u.operator}</Chip>
                    <span className="text-lg font-bold text-red-600">{nf(u.count)}</span>
                  </div>
                ))}
                {!data.unsubscribes?.length && (
                  <p className="text-sm text-gray-400 text-center py-4">Отписок за период нет</p>
                )}
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Подписки по каналам */}
            <Card className="flex-1 min-w-[320px]" title="Подписки по каналам">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Компания</Th>
                      <Th>Канал</Th>
                      <Th right>Успешно</Th>
                      <Th right>Ошибки</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.subscriptions_by_channel || []).map((s, i) => (
                      <tr key={i}>
                        <Td><Chip>{OPERATOR_TITLES[s.operator] || s.operator}</Chip></Td>
                        <Td className="text-gray-700">{CHANNEL_TITLES[s.channel]?.name || s.channel}</Td>
                        <Td right className="font-semibold text-green-600">{nf(s.success)}</Td>
                        <Td right className="font-semibold text-red-600">{nf(s.failed)}</Td>
                      </tr>
                    ))}
                    {!data.subscriptions_by_channel?.length && (
                      <tr>
                        <Td colSpan={4} className="text-center text-gray-400 py-4">
                          Нет данных за период
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Доп. пакеты */}
            <Card className="flex-1 min-w-[260px]" title="Доп. пакеты">
              <div className="space-y-2">
                {(data.extra_packages || []).map((p) => (
                  <div key={p.operator} className="flex justify-between items-center">
                    <Chip>{OPERATOR_TITLES[p.operator] || p.operator}</Chip>
                    <span className="text-sm">
                      <b className="text-green-600">{nf(p.success)}</b>{" "}
                      <span className="text-gray-400">успешно</span> ·{" "}
                      <b className="text-red-600">{nf(p.failed)}</b>{" "}
                      <span className="text-gray-400">ошибок</span>
                    </span>
                  </div>
                ))}
                {!data.extra_packages?.length && (
                  <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>
                )}
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* SMS исходящие */}
            <Card className="flex-1 min-w-[260px]" title="SMS отправленные">
              <div className="space-y-2">
                {(data.sms_outgoing || []).map((s) => (
                  <div key={s.operator} className="flex justify-between items-center">
                    <Chip>{OPERATOR_TITLES[s.operator] || s.operator}</Chip>
                    <span className="text-sm">
                      <b className="text-green-600">{nf(s.delivered)}</b>{" "}
                      <span className="text-gray-400">доставлено</span> ·{" "}
                      <b className="text-red-600">{nf(s.failed)}</b>{" "}
                      <span className="text-gray-400">ошибок</span>
                    </span>
                  </div>
                ))}
                {!data.sms_outgoing?.length && (
                  <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>
                )}
              </div>
            </Card>

            {/* SMS входящие */}
            <Card className="flex-1 min-w-[260px]" title="SMS полученные">
              <div className="space-y-2">
                {(data.sms_incoming || []).map((s) => (
                  <div key={s.operator} className="flex justify-between items-center">
                    <Chip>{OPERATOR_TITLES[s.operator] || s.operator}</Chip>
                    <span className="text-lg font-bold text-gray-900">{nf(s.count)}</span>
                  </div>
                ))}
                {!data.sms_incoming?.length && (
                  <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ===== Ниже — статичные разделы (нет отдельного эндпоинта под них) ===== */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Всего запросов"
          value={nf(STATIC_SUMMARY.requests.total)}
          sub={`≈ ${nf(Math.round(STATIC_SUMMARY.requests.perDay))} в день`}
        />
        <StatCard
          label="Успешных"
          value={nf(STATIC_SUMMARY.requests.success)}
          sub={rf(STATIC_SUMMARY.requests.successRate)}
          tone="text-green-600"
        />
        <StatCard label="Неуспешных" value={nf(STATIC_SUMMARY.requests.failed)} tone="text-red-600" />
        <StatCard label="PUSH *3033*999#" value={nf(push?.total)} sub={`успешность ${rf(push?.successRate)}`} tone="text-amber-700" />
      </div>

      <div className="flex flex-wrap gap-4">
        <Card
          className="flex-[2] min-w-[480px]"
          title={`Запросы ${STATIC_TIMELINE.granularity === "hour" ? "по часам" : "по дням"}`}
          right={
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                Успешные
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-400" />
                Ошибки
              </span>
            </div>
          }
        >
          <div className="flex items-end gap-1 h-60 border-b border-gray-100">
            {bars.map((b) => (
              <div
                key={b.bucket}
                className="flex-1 flex flex-col justify-end h-full gap-0.5"
                title={`${b.label} — всего ${nf(b.total)}, ошибок ${nf(b.failed)}`}
              >
                <div className="bg-red-400 rounded-t" style={{ height: `${b.failH}%` }} />
                <div className="bg-indigo-500 rounded-t" style={{ height: `${b.okH}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {bars.map((b) => (
              <div key={b.bucket} className="flex-1 text-center text-[10px] text-gray-400 overflow-hidden">
                {b.tick}
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex-1 min-w-[300px]" title="Доля каналов">
          <div className="space-y-4">
            {STATIC_CHANNELS.map((c) => (
              <div key={c.channel}>
                <div className="flex justify-between items-center mb-1.5">
                  <Chip>{CHANNEL_TITLES[c.channel]?.name || c.channel}</Chip>
                  <span className="text-sm text-gray-500">
                    <b className="text-gray-900">{nf(c.total)}</b> · {rf(c.share)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${c.share || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Каналы: успешные и неуспешные запросы">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <Th>Канал</Th>
                <Th right>Всего</Th>
                <Th right>Успешно</Th>
                <Th right>Ошибки</Th>
                <Th right>Success rate</Th>
                <Th right>Доля</Th>
              </tr>
            </thead>
            <tbody>
              {STATIC_CHANNELS.map((c) => (
                <tr key={c.channel}>
                  <Td>
                    <div className="font-semibold text-gray-900">{CHANNEL_TITLES[c.channel]?.name || c.channel}</div>
                    <div className="text-xs text-gray-400">{CHANNEL_TITLES[c.channel]?.code}</div>
                  </Td>
                  <Td right className="font-bold text-gray-900">{nf(c.total)}</Td>
                  <Td right className="font-semibold text-green-600">{nf(c.success)}</Td>
                  <Td right className="font-semibold text-red-600">{nf(c.failed)}</Td>
                  <Td right className="font-bold text-gray-900">{rf(c.successRate)}</Td>
                  <Td right className="text-gray-500">{rf(c.share)}</Td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <Td>Итого</Td>
                <Td right>{nf(STATIC_SUMMARY.requests.total)}</Td>
                <Td right className="text-green-600">{nf(STATIC_SUMMARY.requests.success)}</Td>
                <Td right className="text-red-600">{nf(STATIC_SUMMARY.requests.failed)}</Td>
                <Td right>{rf(STATIC_SUMMARY.requests.successRate)}</Td>
                <Td right className="text-gray-400">100%</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Компании × каналы — всего / ошибки">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-gray-50">
              <tr>
                <Th>Компания</Th>
                <Th right>USSD</Th>
                <Th right>SMS</Th>
                <Th right>API</Th>
                <Th right>PUSH</Th>
                <Th right>Всего</Th>
                <Th right>Ошибки</Th>
                <Th right>Success rate</Th>
              </tr>
            </thead>
            <tbody>
              {STATIC_OPERATORS.map((o) => (
                <tr key={o.operator}>
                  <Td><Chip>{o.title}</Chip></Td>
                  {CHANNELS.map((ch) => (
                    <Td key={ch} right className="text-gray-900">
                      {nf(o.channels?.[ch]?.total)} <span className="text-xs text-red-600">/ {nf(o.channels?.[ch]?.failed)}</span>
                    </Td>
                  ))}
                  <Td right className="font-bold text-gray-900">{nf(o.total)}</Td>
                  <Td right className="font-semibold text-red-600">{nf(o.failed)}</Td>
                  <Td right className="font-bold text-green-600">{rf(o.successRate)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Причины отказа">
        <div className="space-y-3.5">
          {STATIC_ERRORS.map((e) => (
            <div key={e.code + e.channel} className="flex items-center gap-3.5">
              <div className="w-52 shrink-0">
                <p className="text-sm font-semibold text-gray-900">{ERROR_TITLES[e.code] || e.code}</p>
                <p className="text-xs text-gray-400">
                  {CHANNEL_TITLES[e.channel]?.name || e.channel} · <span className="font-mono">{e.code}</span>
                </p>
              </div>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-2 rounded-full bg-sky-500" style={{ width: `${e.share || 0}%` }} />
              </div>
              <div className="w-24 text-right text-sm">
                <b className="text-gray-900">{nf(e.count)}</b> <span className="text-gray-400">{rf(e.share)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPage;