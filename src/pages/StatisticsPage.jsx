// src/pages/StatisticsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "../features/analytics/analytics";
import { fetchOperators } from "../features/operators/operators";

const CHANNEL_TITLES = {
  ussd: { name: "USSD", code: "*3033#" },
  sms: { name: "SMS", code: "короткий номер" },
  api: { name: "API", code: "внешние вызовы" },
  push: { name: "PUSH", code: "*3033*999#" },
  unknown: { name: "Не определён", code: "" },
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
const Chip = ({ children, style }) => (
  <span
    className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold"
    style={style}
  >
    {children}
  </span>
);

const StatisticsPage = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state) => state.analytics);
  const { info: operatorsInfo } = useSelector((state) => state.operators);

  const [activePreset, setActivePreset] = useState("today");
  const [dateFrom, setDateFrom] = useState(getPresetRange("today").from);
  const [dateTo, setDateTo] = useState(getPresetRange("today").to);
  const [operator, setOperator] = useState(""); // "" — все операторы

  const opInfo = (code) => operatorsInfo?.find((o) => o.code === code);
  const opTitle = (code) => opInfo(code)?.name || code;
  const opChipStyle = (code) => {
    const o = opInfo(code);
    return o?.color_bg ? { backgroundColor: o.color_bg, color: "#fff" } : undefined;
  };

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
            USSD, SMS, API и PUSH <b className="text-gray-700">*3033*999#</b> · подписки и отписки по каналам ·
            ребилл · доп. пакеты · SMS отправленные и полученные
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-wrap gap-6 items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Период</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => handlePreset(p.id)} className={btnCls(activePreset === p.id)}>
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
            {displayFrom === displayTo ? displayFrom : `${displayFrom} — ${displayTo} (${displayDays} дн.)`}
          </b>
          {isLoading && <span className="text-indigo-500"> · обновляется…</span>}
        </p>
      </div>

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
          <div className="flex flex-wrap gap-4">
            <StatCard label="Всего когда-либо" value={nf(data.totals?.total_ever)} />
            <StatCard label="Активные" value={nf(data.totals?.active)} tone="text-green-600" />
            <StatCard label="На паузе" value={nf(data.totals?.paused)} tone="text-amber-700" />
            <StatCard label="Неактивные" value={nf(data.totals?.inactive_total)} tone="text-red-600" />
            <StatCard label="Отвечали хотя бы раз" value={nf(data.answered_at_least_once_ever)} />
          </div>

          <div className="flex flex-wrap gap-4">
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
                        <Td>
                          <Chip style={opChipStyle(s.operator)}>{opTitle(s.operator)}</Chip>
                        </Td>
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

            <Card className="flex-1 min-w-[320px]" title="Отписки по каналам">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Компания</Th>
                      <Th>Канал</Th>
                      <Th right>Кол-во</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.unsubscribes || []).map((u, i) => (
                      <tr key={i}>
                        <Td>
                          <Chip style={opChipStyle(u.operator)}>{opTitle(u.operator)}</Chip>
                        </Td>
                        <Td className="text-gray-700">{CHANNEL_TITLES[u.channel]?.name || u.channel || "—"}</Td>
                        <Td right className="font-semibold text-red-600">{nf(u.count)}</Td>
                      </tr>
                    ))}
                    {!data.unsubscribes?.length && (
                      <tr>
                        <Td colSpan={3} className="text-center text-gray-400 py-4">
                          Отписок за период нет
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            <Card className="flex-1 min-w-[320px]" title="Ребилл (списания подписки)">
              <div className="space-y-3">
                {(data.rebill || []).map((r) => {
                  const total = (r.paid || 0) + (r.failed || 0);
                  return (
                    <div key={r.operator}>
                      <div className="flex justify-between items-center mb-1.5">
                        <Chip style={opChipStyle(r.operator)}>{opTitle(r.operator)}</Chip>
                        <span className="text-sm text-gray-500">
                          <b className="text-green-600">{nf(r.paid)}</b> оплачено ·{" "}
                          <b className="text-red-600">{nf(r.failed)}</b> ошибок
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct(r.paid, total)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Успешность: {pct(r.paid, total)}%</p>
                    </div>
                  );
                })}
                {!data.rebill?.length && <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>}
              </div>
            </Card>

            <Card className="flex-1 min-w-[260px]" title="Доп. пакеты">
              <div className="space-y-2">
                {(data.extra_packages || []).map((p) => (
                  <div key={p.operator} className="flex justify-between items-center">
                    <Chip style={opChipStyle(p.operator)}>{opTitle(p.operator)}</Chip>
                    <span className="text-sm">
                      <b className="text-green-600">{nf(p.success)}</b> <span className="text-gray-400">успешно</span> ·{" "}
                      <b className="text-red-600">{nf(p.failed)}</b> <span className="text-gray-400">ошибок</span>
                    </span>
                  </div>
                ))}
                {!data.extra_packages?.length && <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>}
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            <Card className="flex-1 min-w-[260px]" title="SMS отправленные">
              <div className="space-y-2">
                {(data.sms_outgoing || []).map((s) => (
                  <div key={s.operator} className="flex justify-between items-center">
                    <Chip style={opChipStyle(s.operator)}>{opTitle(s.operator)}</Chip>
                    <span className="text-sm">
                      <b className="text-green-600">{nf(s.delivered)}</b> <span className="text-gray-400">доставлено</span> ·{" "}
                      <b className="text-red-600">{nf(s.failed)}</b> <span className="text-gray-400">ошибок</span>
                    </span>
                  </div>
                ))}
                {!data.sms_outgoing?.length && <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>}
              </div>
            </Card>

            <Card className="flex-1 min-w-[260px]" title="SMS полученные">
              <div className="space-y-2">
                {(data.sms_incoming || []).map((s) => (
                  <div key={s.operator} className="flex justify-between items-center">
                    <Chip style={opChipStyle(s.operator)}>{opTitle(s.operator)}</Chip>
                    <span className="text-lg font-bold text-gray-900">{nf(s.count)}</span>
                  </div>
                ))}
                {!data.sms_incoming?.length && <p className="text-sm text-gray-400 text-center py-4">Нет данных за период</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
