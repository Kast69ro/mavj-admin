import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Home, Users, BarChart3, Upload, LogOut, Settings, Smartphone, FolderOpen } from "lucide-react";

import LoginPage from "./pages/LoginPage";
import LotteryPage from "./pages/LotteryPage.jsx";
import MainPage from "./pages/MainPage";
import SubscribersPage from "./pages/SubscribersPage";
import ReportsPage from "./pages/ReportsPage";
import QuestionsPage from "./pages/QuestionsPage";
import WinnersPage from "./pages/WinnersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MonitoringPage from "./pages/MonitoringPage";
import BillingPage from "./pages/BillingPage";
import SmsPage from "./pages/SmsPage";
import UssdPage from "./pages/UssdPage";
import UsersPage from "./pages/UsersPage";
import OperatorLayout, { OperatorsIndexRedirect } from "./pages/OperatorLayout";
import OperatorPeriodListPage from "./pages/OperatorPeriodListPage";
import OperatorPeriodDetailPage from "./pages/OperatorPeriodDetailPage";
import OperatorSitePage from "./pages/OperatorSitePage";
import OperatorSettingsPage from "./pages/OperatorSettingsPage";
import OperatorContactsPage from "./pages/OperatorContactsPage";
import OperatorPartnersPage from "./pages/OperatorPartnersPage";
import OperatorExpensesPage from "./pages/OperatorExpensesPage";
import OperatorFinancePage from "./pages/OperatorFinancePage";
import OperatorDocumentsPage from "./pages/OperatorDocumentsPage";
import CompanySettingsPage from "./pages/CompanySettingsPage";
import OperatorsOverviewPage from "./pages/OperatorsOverviewPage";
import OperatorOverviewPage from "./pages/OperatorOverviewPage";
import DocumentsPage from "./pages/DocumentsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import OperatorsNav from "./components/OperatorsNav";
import ProfileMenu from "./components/ProfileMenu";
import RequirePermission from "./components/RequirePermission";
import NoAccess from "./components/NoAccess";
import { Role } from "./features/auth/authApi";
import { logout } from "./features/auth/authSlice";
import { useAccess } from "./utils/permissions";

const NAV_ITEMS = [
  { path: "/", label: "Главная", icon: <Home size={18} />, end: true, permission: "dashboard" },
  { path: "/subscribers", label: "Абоненты", icon: <Users size={18} />, permission: "subscribers" },
  { path: "/reports", label: "Отчеты", icon: <BarChart3 size={18} />, permission: "reports" },
  { path: "/questions", label: "Вопросы", icon: <Upload size={18} />, permission: "quiz" },
  { path: "/lottery", label: "Лотерея", icon: <span>🎰</span>, permission: "periods" },
  { path: "/analytics", label: "Аналитика", icon: <BarChart3 size={18} />, permission: "analytics" },
  { path: "/monitoring", label: "Мониторинг", icon: <span>📡</span>, permission: "monitoring" },
  { path: "/billing", label: "Биллинг", icon: <span>💰</span>, permission: "billing" },
  { path: "/sms", label: "SMS", icon: <span>💬</span>, permission: "sms_send" },
  { path: "/ussd", label: "USSD", icon: <span>💬</span>, permission: "ussd_templates" },
  { path: "/users", label: "Пользователи", icon: <span>🔑</span>, superadminOnly: true },
  { path: "/operators", label: "Операторы", icon: <Smartphone size={18} />, permission: "operators_view" },
  { path: "/documents", label: "Документы", icon: <FolderOpen size={18} />, permission: "documents_view" },
  { path: "/settings", label: "Настройки", icon: <Settings size={18} />, permission: "operators", accordion: "operators" },
];

const useNavItems = () => {
  const { can, superadmin } = useAccess();
  return NAV_ITEMS.filter((item) => (item.superadminOnly ? superadmin : can(item.permission)));
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navItems = useNavItems();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 text-white
      transition-transform duration-200
      lg:static lg:translate-x-0 lg:w-60 lg:min-h-screen lg:sticky lg:top-0 lg:self-start
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold">Панель управления</h1>
        <p className="text-xs text-slate-400 mt-1">
          SMS Викторина &amp; Лотерея
        </p>
      </div>
      <div className="p-5 border-b border-slate-700">
        <h4 className="text-lg">Добро пожаловать</h4>
        <p className="text-lg text-slate-400 mt-1">
          {user?.full_name || user?.username || "Пользователь"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) =>
          item.accordion === "operators" ? (
            <OperatorsNav key={item.path} icon={item.icon} label={item.label} onNavigate={onClose} />
          ) : (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? "bg-white text-slate-900 font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
          </NavLink>
          )
        )}
      </nav>

      <div className="px-3 pb-5 pt-2 border-t border-slate-700 space-y-0.5">
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

// Старые адреса настроек (/operator-content/… и /operators/:code/вкладка) → /settings/…
const LegacySettingsRedirect = () => {
  const { code, "*": rest } = useParams();
  const { search } = useLocation();
  return <Navigate to={`/settings/${[code, rest].filter(Boolean).join("/")}${search}`} replace />;
};

// Стартовая страница: «Главная», а если права на неё нет — «Биллинг» или первый доступный раздел
const HomePage = () => {
  const { can } = useAccess();
  const navItems = useNavItems();
  if (can("dashboard")) return <MainPage />;
  const start = can("billing") ? "/billing" : navItems[0]?.path;
  if (start) return <Navigate to={start} replace />;
  return <NoAccess message="Вашей роли пока не выданы права. Обратитесь к администратору." />;
};

const guard = (permission, page) => <RequirePermission permission={permission}>{page}</RequirePermission>;

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-20">
        <h1 className="text-lg font-bold">Панель управления</h1>
        <div className="flex items-center gap-1">
          <ProfileMenu dark />
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:pt-4 min-w-0">
        <div className="hidden lg:flex justify-end mb-2">
          <ProfileMenu />
        </div>
        <div className="">
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="subscribers" element={guard("subscribers", <SubscribersPage />)} />
            <Route path="reports" element={guard("reports", <ReportsPage />)} />
            <Route path="questions" element={guard("quiz", <QuestionsPage />)} />
            <Route path="winners" element={guard("periods", <WinnersPage />)} />
            <Route path="analytics" element={guard("analytics", <AnalyticsPage />)} />
            <Route path="monitoring" element={guard("monitoring", <MonitoringPage />)} />
            <Route path="billing" element={guard("billing", <BillingPage />)} />
            <Route path="sms" element={guard("sms_send", <SmsPage />)} />
            <Route path="ussd" element={guard("ussd_templates", <UssdPage />)} />
            <Route path="lottery" element={guard("periods", <LotteryPage />)} />
            <Route path="users" element={<RequirePermission superadminOnly><UsersPage /></RequirePermission>} />

            <Route path="operators" element={guard("operators_view", <OperatorsOverviewPage />)} />
            <Route path="operators/:code" element={guard("operators_view", <OperatorOverviewPage />)} />
            <Route path="documents" element={guard("documents_view", <DocumentsPage />)} />

            <Route path="settings" element={guard("operators", <OperatorsIndexRedirect />)} />
            <Route path="settings/company" element={<Navigate to="/settings/company/documents" replace />} />
            <Route
              path="settings/company/documents"
              element={guard(["operators", "company_documents_view"], <CompanySettingsPage />)}
            />
            <Route path="settings/:code" element={guard("operators", <OperatorLayout />)}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<OperatorSitePage />} />
              <Route path="site" element={<Navigate to="../general" replace />} />
              <Route path="settings" element={<OperatorSettingsPage />} />
              <Route path="periods" element={<OperatorPeriodListPage />} />
              <Route path="periods/:periodId" element={<OperatorPeriodDetailPage />} />
              <Route path="contacts" element={<OperatorContactsPage />} />
              <Route path="partners" element={<OperatorPartnersPage />} />
              <Route path="expenses" element={<OperatorExpensesPage />} />
              <Route path="finance" element={<OperatorFinancePage />} />
              <Route path="documents" element={guard("documents_view", <OperatorDocumentsPage />)} />
            </Route>

            {/* Старые адреса раздела настроек */}
            <Route path="operator-content" element={<Navigate to="/settings" replace />} />
            <Route path="operator-content/:code/*" element={<LegacySettingsRedirect />} />
            <Route path="operators/:code/*" element={<LegacySettingsRedirect />} />

            <Route
              path="*"
              element={
                <p className="text-gray-400 text-center mt-20">
                  404 — Страница не найдена
                </p>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// Пока не загружен профиль, права неизвестны — ни меню, ни разделы не показываем
const AuthGate = () => {
  const dispatch = useDispatch();
  const { user, userError, mustChangePassword } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) dispatch(Role());
  }, [user, dispatch]);

  if (mustChangePassword) return <ChangePasswordPage />;
  if (user) return <Layout />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4 text-center">
      {userError ? (
        <>
          <p className="text-sm text-red-600">{userError}</p>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(Role())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Повторить
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              Выйти
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">Загрузка…</p>
      )}
    </div>
  );
};

const App = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="*"
          element={token ? <AuthGate /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
