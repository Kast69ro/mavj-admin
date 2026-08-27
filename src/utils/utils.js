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