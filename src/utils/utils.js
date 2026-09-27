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

// "Сейчас" в Душанбе, независимо от таймзоны, выставленной на компьютере
// администратора. Используется во всех пресетах диапазонов дат ниже —
// раньше они брали new Date() (локальное время браузера) и/или
// .toISOString() (которое снова переводит в UTC), из-за чего пресет
// "Сегодня" мог указывать не на ту календарную дату, если у пользователя
// стоит другой часовой пояс или если сейчас раннее утро по Душанбе.
const getDushanbeNow = () => new Date(Date.now() + DUSHANBE_OFFSET_MS);

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

// Форматирует дату (уже вычисленную в Душанбе-времени, как объект Date
// со сдвинутыми UTC-полями) в "YYYY-MM-DD", читая именно getUTC*(),
// а не toISOString() — иначе сдвиг +5 будет вычтен обратно.
const toISODushanbe = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

export const toISO = toISODushanbe;

export const daysBetween = (from, to) =>
  Math.round((new Date(to) - new Date(from)) / 86400000) + 1;

export const getPresetRange = (presetId) => {
  const today = getDushanbeNow();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();

  switch (presetId) {
    case "today":
      return { from: toISODushanbe(today), to: toISODushanbe(today) };
    case "yesterday": {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - 1);
      return { from: toISODushanbe(d), to: toISODushanbe(d) };
    }
    case "7d": {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - 6);
      return { from: toISODushanbe(d), to: toISODushanbe(today) };
    }
    case "30d": {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - 29);
      return { from: toISODushanbe(d), to: toISODushanbe(today) };
    }
    case "month":
      return {
        from: toISODushanbe(new Date(Date.UTC(y, m, 1))),
        to: toISODushanbe(today),
      };
    case "prevMonth":
      return {
        from: toISODushanbe(new Date(Date.UTC(y, m - 1, 1))),
        to: toISODushanbe(new Date(Date.UTC(y, m, 0))),
      };
    default:
      return { from: toISODushanbe(today), to: toISODushanbe(today) };
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



export const money = (n) =>
  `${(n ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TJS`;

export const today = () => toISODushanbe(getDushanbeNow());

export const ALL_TIME_FROM = "2020-01-01";

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

export const getMonthRange = () => {
  const now = getDushanbeNow();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)); // последний день текущего месяца
  return { from: toISODushanbe(from), to: toISODushanbe(to) };
};

export const getLastMonthRange = () => {
  const now = getDushanbeNow();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)); // последний день прошлого месяца
  return { from: toISODushanbe(from), to: toISODushanbe(to) };
};