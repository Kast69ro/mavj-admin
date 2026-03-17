import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, BarChart3, Upload, LogOut } from 'lucide-react';

// Pages
import LoginPage        from './pages/LoginPage';
import MainPage         from './pages/MainPage';
import SubscribersPage  from './pages/SubscribersPage';
import ReportsPage      from './pages/ReportsPage';
import QuestionsPage    from './pages/QuestionsPage';
import LotteryPage      from './pages/LotteryPage';
import WinnersPage      from './pages/WinnersPage';
import AnalyticsPage    from './pages/AnalyticsPage';
import SettingsPage     from './pages/SettingsPage';
import LoginHistoryPage from './pages/LoginHistoryPage';
import MonitoringPage   from './pages/MonitoringPage';
import BillingPage      from './pages/BillingPage';

// ===== NAV CONFIG =====
const NAV_ITEMS = [
  { path: '/',               label: 'Главная',       icon: <Home size={18} />,     end: true },
  { path: '/subscribers',   label: 'Абоненты',       icon: <Users size={18} /> },
  { path: '/reports',       label: 'Отчеты',         icon: <BarChart3 size={18} /> },
  { path: '/questions',     label: 'Вопросы',        icon: <Upload size={18} /> },
  { path: '/lottery',       label: 'Лотерея',        icon: <span>🎰</span>,        badge: 'NEW' },
  { path: '/analytics',     label: 'Аналитика',      icon: <BarChart3 size={18} /> },
  { path: '/settings',      label: 'Настройки',      icon: <span>⚙️</span> },
  { path: '/login-history', label: 'История входов', icon: <span>🕐</span> },
  { path: '/monitoring',    label: 'Мониторинг',     icon: <span>📡</span> },
  { path: '/billing',       label: 'Биллинг',        icon: <span>💰</span> },
];

// ===== SIDEBAR =====
const Sidebar = ({ user, onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 text-white
      transition-transform duration-200
      lg:static lg:translate-x-0 lg:w-60 lg:min-h-screen lg:sticky lg:top-0 lg:self-start
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold">Панель управления</h1>
        <p className="text-xs text-slate-400 mt-1">SMS Викторина &amp; Лотерея</p>
      </div>

      {user && (
        <div className="px-5 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-400">Добро пожаловать</p>
          <p className="font-medium text-sm">{user.fullName}</p>
        </div>
      )}

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-white text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-2 border-t border-slate-700">
        <button
          onClick={() => { onLogout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition text-sm"
        >
          <LogOut size={18} /> Выход
        </button>
      </div>
    </aside>
  );
};

// ===== LAYOUT =====
const Layout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-20">
        <h1 className="text-lg font-bold">Панель управления</h1>
        <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg hover:bg-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      <Sidebar user={user} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route index                 element={<MainPage />} />
            <Route path="subscribers"   element={<SubscribersPage />} />
            <Route path="reports"       element={<ReportsPage />} />
            <Route path="questions"     element={<QuestionsPage />} />
            <Route path="lottery"       element={<LotteryPage />} />
            <Route path="winners"       element={<WinnersPage />} />
            <Route path="analytics"     element={<AnalyticsPage />} />
            <Route path="settings"      element={<SettingsPage />} />
            <Route path="login-history" element={<LoginHistoryPage />} />
            <Route path="monitoring"    element={<MonitoringPage />} />
            <Route path="billing"       element={<BillingPage />} />
            <Route path="*"             element={<p className="text-gray-400 text-center mt-20">404 — Страница не найдена</p>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// ===== APP =====
const App = () => {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route
          path="/*"
          element={
            user
              ? <Layout user={user} onLogout={() => setUser(null)} />
              : <LoginPage onLogin={setUser} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;