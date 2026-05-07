// ===== SHARED HELPERS =====

export const getTypeLabel = (type) => {
  switch (type) {
    case 'lottery': return { text: 'Лотерея', bg: 'bg-amber-100', color: 'text-amber-800' };
    case 'quiz':    return { text: 'Викторина', bg: 'bg-indigo-100', color: 'text-indigo-800' };
    case 'both':    return { text: 'Оба', bg: 'bg-emerald-100', color: 'text-emerald-800' };
    default:        return { text: type, bg: 'bg-gray-100', color: 'text-gray-800' };
  }
};

export const getSourceLabel = (source) => {
  switch (source) {
    case 'quiz_top3': return { text: 'Топ-3 викторины', bg: 'bg-violet-100', color: 'text-violet-800', icon: '🏆' };
    case 'direct':    return { text: 'Прямая регистрация', bg: 'bg-sky-100', color: 'text-sky-800', icon: '📱' };
    default:          return { text: source, bg: 'bg-gray-100', color: 'text-gray-800', icon: '📋' };
  }
};

export const exportToCSV = (companies, reportDateFrom, reportDateTo) => {
  const headers = ['Компания', 'Количество тарификаций', 'Период'];
  const period = `${reportDateFrom || '01.01.2026'} - ${reportDateTo || '16.01.2026'}`;
  let csvContent = headers.join(',') + '\n';
  companies.forEach(comp => {
    csvContent += [comp.name, comp.count, period].join(',') + '\n';
  });
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', `otchet_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};