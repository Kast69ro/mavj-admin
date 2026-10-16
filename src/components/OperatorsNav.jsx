import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import { fetchContentOperators } from "../features/operatorContent/operatorContentApi";
import { OPERATOR_COLORS } from "../utils/operatorColors";

const BASE_PATH = "/operator-content";

const OPERATOR_STATUS_LABELS = {
  inactive: "Отключён",
  coming_soon: "Скоро",
};

// Пункт сайдбара «Операторы» в виде аккордеона: внутри — отдельная ссылка на каждого оператора
const OperatorsNav = ({ icon, label, onNavigate }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { operators, operatorsLoading, operatorsError } = useSelector((state) => state.operatorContent);

  const isSectionActive = pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`);
  const [open, setOpen] = useState(isSectionActive);

  useEffect(() => {
    if (isSectionActive) setOpen(true);
  }, [isSectionActive]);

  useEffect(() => {
    if (open && operators.length === 0 && !operatorsLoading && !operatorsError) {
      dispatch(fetchContentOperators());
    }
  }, [open, operators.length, operatorsLoading, operatorsError, dispatch]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
          isSectionActive ? "text-white font-semibold" : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-5 pl-3 border-l border-slate-700 py-1 space-y-0.5">
            {operatorsLoading && operators.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-500">Загрузка…</p>
            )}
            {operatorsError && operators.length === 0 && (
              <button
                type="button"
                onClick={() => dispatch(fetchContentOperators())}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300"
              >
                Ошибка загрузки — повторить
              </button>
            )}
            {operators.map((op) => {
              const colors = OPERATOR_COLORS[op.code] ?? OPERATOR_COLORS.default;
              const isActive = op.status === "active";

              // Выключенные тоже открываются (чтобы их можно было включить), но показываются серым
              return (
                <NavLink
                  key={op.code}
                  to={`${BASE_PATH}/${op.code}`}
                  onClick={onNavigate}
                  className={({ isActive: linkActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                      linkActive
                        ? "bg-white text-slate-900 font-semibold shadow-sm"
                        : isActive
                          ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                          : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                    }`
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? colors.bg : "#475569" }}
                  />
                  <span className="flex-1 truncate">{op.name}</span>
                  {!isActive && (
                    <span className="text-[10px] uppercase tracking-wide">
                      {OPERATOR_STATUS_LABELS[op.status] ?? op.status}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorsNav;
