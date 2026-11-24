import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const btn =
  'p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed';

const Pager = ({ page, total, limit, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-gray-500">
        Страница {page} из {pages} · всего {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Назад" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} />
        </button>
        <button type="button" aria-label="Вперёд" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pager;
