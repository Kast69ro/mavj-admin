export const STATUS_CONFIG = {
  active: { label: 'Подписан', bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
  inactive: { label: 'Отписан', bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  paused: { label: 'Нет баланса', bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
};

export const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'active', label: 'Подписан' },
  { value: 'inactive', label: 'Отписан' },
  { value: 'paused', label: 'Нет баланса' },
];