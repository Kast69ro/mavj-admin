import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Home, Users, BarChart3, Upload, LogOut } from 'lucide-react';

import LoginPage        from './pages/LoginPage';
import MainPage         from './pages/MainPage';
import SubscribersPage  from './pages/SubscribersPage';
import ReportsPage      from './pages/ReportsPage';
import QuestionsPage    from './pages/QuestionsPage';
import WinnersPage      from './pages/WinnersPage';
import AnalyticsPage    from './pages/AnalyticsPage';
import SettingsPage     from './pages/SettingsPage';
import LoginHistoryPage from './pages/LoginHistoryPage';
import MonitoringPage   from './pages/MonitoringPage';
import BillingPage      from './pages/BillingPage';
import { Role } from './features/auth/authApi';
import { logout } from './features/auth/authSlice';

const NAV_ITEMS = [
  { path: '/',               label: 'Главная',       icon: <Home size={18} />,     end: true },
  { path: '/subscribers',   label: 'Абоненты',       icon: <Users size={18} /> },
  { path: '/reports',       label: 'Отчеты',         icon: <BarChart3 size={18} /> },
  { path: '/questions',     label: 'Вопросы',        icon: <Upload size={18} /> },
  { path: '/lottery',       label: 'Лотерея',        icon: <span>🎰</span> },
  { path: '/analytics',     label: 'Аналитика',      icon: <BarChart3 size={18} /> },
  { path: '/settings',      label: 'Настройки',      icon: <span>⚙️</span> },
  { path: '/login-history', label: 'История входов', icon: <span>🕐</span> },
  { path: '/monitoring',    label: 'Мониторинг',     icon: <span>📡</span> },
  { path: '/billing',       label: 'Биллинг',        icon: <span>💰</span> },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !user) {
      dispatch(Role());
    }
  }, [token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
      <div className="p-5 border-b border-slate-700">
        <h4 className="text-lg">Добро пожаловать</h4>
        <p className="text-lg text-slate-400 mt-1">{user?.username || 'Пользователь'}</p>
      </div>

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
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-2 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition text-sm"
        >
          <LogOut size={18} /> Выход
        </button>
      </div>
    </aside>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-20">
        <h1 className="text-lg font-bold">Панель управления</h1>
        <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg hover:bg-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
        <div className="">
          <Routes>
            <Route index                 element={<MainPage />} />
            <Route path="subscribers"   element={<SubscribersPage />} />
            <Route path="reports"       element={<ReportsPage />} />
            <Route path="questions"     element={<QuestionsPage />} />
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

const App = () => {
  const { token } = useSelector(state => state.auth);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="*"
          element={token ? <Layout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;