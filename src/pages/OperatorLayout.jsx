import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, NavLink, Outlet, useParams } from 'react-router-dom';
import { CalendarRange, Globe, SlidersHorizontal, Contact, Handshake, Receipt, Wallet } from 'lucide-react';
import { fetchContentOperators, OPERATOR_STATUSES } from '../features/operatorContent/operatorContentApi';
import { OPERATOR_COLORS } from '../utils/operatorColors';
import { mediaUrl } from '../utils/utils';
import { ErrorBox } from '../components/ContentModal';

// Разделы страницы оператора. Новая функция = новая вкладка здесь + дочерний маршрут в App.jsx
const OPERATOR_TABS = [
  { path: 'general', label: 'Общее', icon: <Globe size={16} /> },
  { path: 'settings', label: 'Настройки', icon: <SlidersHorizontal size={16} /> },
  { path: 'periods', label: 'Периоды', icon: <CalendarRange size={16} /> },
  { path: 'contacts', label: 'Ответственные', icon: <Contact size={16} /> },
  { path: 'partners', label: 'Партнёры', icon: <Handshake size={16} /> },
  { path: 'expenses', label: 'Расходы', icon: <Receipt size={16} /> },
  { path: 'finance', label: 'Финансы', icon: <Wallet size={16} /> },
];

export const OperatorsIndexRedirect = () => {
  const dispatch = useDispatch();
  const { operators, operatorsLoading, operatorsError } = useSelector((state) => state.operatorContent);

  useEffect(() => {
    if (operators.length === 0) dispatch(fetchContentOperators());
  }, [dispatch, operators.length]);

  const first = operators.find((o) => o.status === 'active') ?? operators[0];
  if (first) return <Navigate to={`/operator-content/${first.code}`} replace />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Операторы</h2>
      <ErrorBox>{operatorsError}</ErrorBox>
      {operatorsLoading ? (
        <p className="text-sm text-gray-400">Загрузка…</p>
      ) : (
        !operatorsError && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-400">
            Операторы не найдены
          </div>
        )
      )}
    </div>
  );
};

const OperatorLayout = () => {
  const { code } = useParams();
  const dispatch = useDispatch();
  const { operators, operatorsLoading, operatorsError } = useSelector((state) => state.operatorContent);

  useEffect(() => {
    if (operators.length === 0) dispatch(fetchContentOperators());
  }, [dispatch, operators.length]);

  const operator = operators.find((o) => o.code === code);
  const colors = OPERATOR_COLORS[code] ?? OPERATOR_COLORS.default;

  if (!operator) {
    return (
      <div className="space-y-6">
        <ErrorBox>{operatorsError}</ErrorBox>
        {operatorsLoading || operators.length === 0 ? (
          !operatorsError && <p className="text-sm text-gray-400">Загрузка…</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-400">
            Оператор «{code}» не найден
          </div>
        )}
      </div>
    );
  }

  const isActive = operator.status === 'active';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: colors.bg }} />
        <div className="px-6 pt-5 flex items-center gap-4">
          <div
            className="w-14 h-14 shrink-0 rounded-xl border bg-white flex items-center justify-center overflow-hidden"
            style={{ borderColor: colors.bg }}
          >
            {operator.logo_url ? (
              <img src={mediaUrl(operator.logo_url)} alt="" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="font-bold text-xl" style={{ color: colors.active }}>
                {operator.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">{operator.name}</h2>
              {!isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  {OPERATOR_STATUSES.find((st) => st.value === operator.status)?.label ?? operator.status}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-gray-400">{operator.code}</p>
          </div>
        </div>

        <nav className="px-4 mt-4 flex gap-1 overflow-x-auto border-t border-gray-100">
          {OPERATOR_TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive: tabActive }) =>
                `flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition ${
                  tabActive ? 'text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`
              }
              style={({ isActive: tabActive }) => (tabActive ? { borderColor: colors.active } : undefined)}
            >
              {tab.icon} {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {!isActive && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
          Оператор выключен: на сайте его страница недоступна, в остальных разделах админки он не показывается.
          Включить можно на вкладке «Общее».
        </div>
      )}

      <Outlet context={{ operator, colors }} />
    </div>
  );
};

export default OperatorLayout;
