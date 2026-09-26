export const token = localStorage.getItem("token") || null;

export const setToken = (newToken) => {
  localStorage.setItem("token", newToken);
};

export const LANGUAGE_LABELS = {
  RU: 'Русский',
  TJ: 'Тоҷикӣ',
};

export const LANGUAGE_OPTIONS = [
  { value: '', label: 'Все языки' },
  { value: 'ru', label: 'Русский' },
  { value: 'tj', label: 'Тоҷикӣ' },
];

// Бэкенд отдаёт "наивные" UTC-строки без суффикса Z. Браузер по умолчанию
// разобрал бы такую строку как СВОЁ локальное время — результат зависел бы
// от настроек компьютера конкретного администратора. Разбираем явно как UTC
// и сами прибавляем +5 часов (Asia/Dushanbe, без перехода на летнее время),
// не полагаясь на локальный часовой пояс браузера вообще.
const DUSHANBE_OFFSET_MS = 5 * 60 * 60 * 1000;

export const toDushanbeDate = (value) => {
  if (!value) return null;
  let iso = String(value).trim();
  if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(iso)) {
    iso = iso.replace(' ', 'T') + 'Z';
  }
  const utcDate = new Date(iso);
  if (isNaN(utcDate.getTime())) return null;
  return new Date(utcDate.getTime() + DUSHANBE_OFFSET_MS);
};

export const formatDate = (value) => {
  const d = toDushanbeDate(value);
  if (!d) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getUTCDate());
  const month = pad(d.getUTCMonth() + 1);
  const year = d.getUTCFullYear();
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

export const formatDateOnly = (value) => {
  const d = toDushanbeDate(value);
  if (!d) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
};

export const LANGUAGES = [
  { value: "ru", label: "Русский" },
  { value: "tj", label: "Тоҷикӣ" },
];

export const toISO = (d) => d.toISOString().slice(0, 10);

export const daysBetween = (from, to) =>
  Math.round((new Date(to) - new Date(from)) / 86400000) + 1;

export const getPresetRange = (presetId) => {
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

export const nf = (v) => (v == null ? "—" : Number(v).toLocaleString("ru-RU"));
export const rf = (v) => (v == null ? "—" : String(v).replace(".", ",") + "%");
export const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");


export const STAT_COLORS = {
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-400 to-orange-500',
  indigo: 'from-indigo-500 to-violet-600',
  blue: 'from-blue-500 to-blue-600',
  rose: 'from-rose-500 to-pink-600',
};


// --- Добавить в utils/utils.js ---------------------------------------------

export const money = (n) =>
  `${(n ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TJS`;

export const today = () => new Date().toISOString().slice(0, 10);

// Условная дата "начала времён" — замени на реальную дату старта платформы,
// если она у тебя есть.
export const ALL_TIME_FROM = "2020-01-01";

// NOTE: ключи должны совпадать с тем, что понимает твой getPresetRange
// ("today" | "yesterday" | "month" | "lastMonth" уже поддерживаются судя по коду).
export const PERIOD_PRESETS = [
  { key: "today", label: "Сегодня" },
  { key: "yesterday", label: "Вчера" },
  { key: "month", label: "Этот месяц" },
  { key: "lastMonth", label: "Прошлый месяц" },
  { key: "all", label: "За всё время" },
];

export const pillBase =
  "px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap";
export const pillActive = "bg-indigo-600 border-indigo-600 text-white shadow-sm";
export const pillInactive = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";

export const dateInputClass =
  "px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

export const buildOperatorOptions = (info) => {
  const sorted = [...(info || [])].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );
  return [
    { value: "", label: "Все", status: "active", isAll: true },
    ...sorted.map((o) => ({
      value: o.code ?? o.id,
      label: o.name,
      status: o.status,
      colorActive: o.color_active,
      colorBg: o.color_bg,
    })),
  ];
};

export const getOperatorPillStyle = (operator, selected) => {
  if (operator.isAll || operator.status !== "active") return null;
  return selected
    ? { backgroundColor: operator.colorActive, borderColor: operator.colorActive, color: "#fff" }
    : { backgroundColor: `${operator.colorBg}1a`, borderColor: operator.colorBg, color: operator.colorActive };
};


const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getMonthRange = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0); // последний день текущего месяца
  return { from: toISODate(from), to: toISODate(to) };
};

export const getLastMonthRange = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0); // последний день прошлого месяца
  return { from: toISODate(from), to: toISODate(to) };
};