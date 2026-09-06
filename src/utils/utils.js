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

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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