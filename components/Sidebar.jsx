import { Home, Users, BarChart3, Upload, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'main',         label: 'Главная',        icon: <Home size={18} /> },
  { key: 'subscribers', label: 'Абоненты',        icon: <Users size={18} /> },
  { key: 'reports',     label: 'Отчеты',          icon: <BarChart3 size={18} /> },
  { key: 'questions',   label: 'Вопросы',         icon: <Upload size={18} /> },
  { key: 'lottery',     label: 'Лотерея',         icon: <span className="text-base">🎰</span>, badge: 'NEW' },
  { key: 'analytics',   label: 'Аналитика',       icon: <BarChart3 size={18} /> },
  {
    key: 'settings', label: 'Настройки',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'loginHistory', label: 'История входов',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'monitoring', label: 'Мониторинг',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: 'billing', label: 'Биллинг',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const Sidebar = ({ currentPage, onNavigate, onLogout, currentUser, isOpen }) => (
  <div className={`${isOpen ? 'block' : 'hidden'} lg:block w-full lg:w-60 bg-slate-900 text-white lg:min-h-screen lg:sticky lg:top-0`}>
    <div className="p-5 hidden lg:block">
      <h1 className="text-xl font-bold">Панель управления</h1>
      <p className="text-xs text-slate-400 mt-1">SMS Викторина &amp; Лотерея</p>
    </div>

    {currentUser && (
      <div className="mx-4 mb-4 pb-3 border-b border-slate-700 px-1">
        <p className="text-xs text-slate-400">Добро пожаловать</p>
        <p className="font-medium text-sm">{currentUser.fullName}</p>
      </div>
    )}

    <nav className="px-3 space-y-0.5 pb-4">
      {NAV_ITEMS.map(item => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
            currentPage === item.key
              ? 'bg-white text-slate-900 font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {item.icon}
          {item.label}
          {item.badge && (
            <span className="ml-auto text-xs px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>

    <div className="px-3 pb-4">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition text-sm"
      >
        <LogOut size={18} />
        Выход
      </button>
    </div>
  </div>
);

export default Sidebar;