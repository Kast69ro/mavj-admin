import { useState, useEffect } from 'react';

const LotteryPage = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Decorative background blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-200 rounded-full blur-3xl opacity-40" />

        <div className="relative bg-white border border-gray-200 rounded-3xl shadow-xl p-10 sm:p-14 text-center overflow-hidden">
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-amber-400 to-emerald-500" />

          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg mb-6">
            🎰
          </div>

          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
            Раздел в разработке
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Скоро{'.'.repeat(dots)}
          </h2>

          <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            Мы дорабатываем раздел «Лотерея» — участники, билеты, розыгрыши
            и настройки скоро появятся здесь.
          </p>

          {/* Progress-ish indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {['👥', '🎟️', '🎰', '⚙️'].map((icon, i) => (
              <div
                key={i}
                className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg opacity-60"
              >
                {icon}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Ведутся работы
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryPage;