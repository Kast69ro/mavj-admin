import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOperators } from "../features/operators/operators";
import { OPERATOR_COLORS } from "../utils/operatorColors";
import { axiosRequest } from "../utils/axiosInstance";

const QUARTER_LABELS = { 1: "Янв–Мар", 2: "Апр–Июн", 3: "Июл–Сен", 4: "Окт–Дек" };

const MainPage = () => {
  const [selectedOperator, setSelectedOperator] = useState("Tcell");
  const { info } = useSelector((state) => state.operators);
  const dispatch = useDispatch();

  // ===== Победители прошлых розыгрышей =====
  const [availableYears, setAvailableYears] = useState([]);
  const [year, setYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [periods, setPeriods] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [winnersError, setWinnersError] = useState(null);

  // ===== Топ-10 по баллам =====
  const [topSubscribers, setTopSubscribers] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  useEffect(() => {
    setLoadingTop(true);
    axiosRequest
      .get("/subscribers/top", { params: { limit: 10 } })
      .then(({ data }) => setTopSubscribers(data.top || []))
      .catch(() => setTopSubscribers([]))
      .finally(() => setLoadingTop(false));
  }, []);

  useEffect(() => {
    dispatch(fetchOperators());
  }, [dispatch]);

  // Список доступных лет — берём из всех периодов, а не хардкодим
  useEffect(() => {
    axiosRequest
      .get("/periods")
      .then(({ data }) => {
        const years = Array.from(
          new Set((data.periods || []).map((p) => new Date(p.start_date).getFullYear()))
        ).sort((a, b) => b - a);
        setAvailableYears(years);
      })
      .catch(() => setAvailableYears([]));
  }, []);

  const loadWinners = useCallback(() => {
    setLoadingWinners(true);
    setWinnersError(null);
    axiosRequest
      .get("/periods/completed", {
        params: {
          year: year || undefined,
          quarter: quarter || undefined,
          top_limit: 5,
        },
      })
      .then(({ data }) => setPeriods(data.periods || []))
      .catch(() => setWinnersError("Не удалось загрузить победителей"))
      .finally(() => setLoadingWinners(false));
  }, [year, quarter]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Главная</h2>

      {/* Operator selector */}
      <div className="grid grid-cols-6 gap-3">
        {info?.map((op) => {
          const colors = OPERATOR_COLORS[op.code] ?? { bg: "#9ca3af", active: "#6b7280" };
          const isActive = selectedOperator === op.code;
          const isDisabled = op.status === "coming_soon";
          return (
            <button
              key={op.id}
              onClick={() => setSelectedOperator(op.code)}
              disabled={isDisabled}
              style={
                !isDisabled && isActive
                  ? { backgroundColor: colors.active }
                  : !isDisabled
                    ? { backgroundColor: colors.bg }
                    : {}
              }
              className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                isDisabled
                  ? "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
                  : isActive
                    ? "text-white shadow-md"
                    : "text-white opacity-60 hover:opacity-90"
              }`}
            >
              {op.name}
              {isDisabled && <span className="block text-xs font-normal mt-0.5">скоро</span>}
            </button>
          );
        })}
      </div>

      {/* ===== Победители прошлых розыгрышей ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">🏆 Победители прошлых розыгрышей</h3>
          <div className="flex gap-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Все годы</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Все кварталы</option>
              {Object.entries(QUARTER_LABELS).map(([q, label]) => (
                <option key={q} value={q}>{`Q${q} (${label})`}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingWinners && <p className="text-sm text-gray-400 py-6 text-center">Загрузка…</p>}
        {!loadingWinners && winnersError && (
          <p className="text-sm text-red-600 py-6 text-center">{winnersError}</p>
        )}
        {!loadingWinners && !winnersError && periods.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">Завершённых розыгрышей за этот период нет</p>
        )}

        {!loadingWinners &&
          !winnersError &&
          periods.map(({ period, winners }) => (
            <div key={period.id} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-800">{period.name}</p>
                <p className="text-xs text-gray-400">
                  {period.start_date} — {period.end_date}
                  {period.prize_budget != null && (
                    <span className="ml-2 text-emerald-600 font-medium">
                      Фонд: {Number(period.prize_budget).toLocaleString("ru-RU")} TJS
                    </span>
                  )}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Место</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Номер</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Оператор</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Баллы</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Ответов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((w, i) => (
                      <tr key={w.msisdn} className="border-b border-gray-100">
                        <td className="px-3 py-2">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </td>
                        <td className="px-3 py-2 font-mono">{w.msisdn}</td>
                        <td className="px-3 py-2 text-gray-500">{w.operator || "—"}</td>
                        <td className="px-3 py-2 text-right font-semibold text-blue-700">{w.points}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{w.answered}</td>
                      </tr>
                    ))}
                    {winners.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                          Нет ответов за этот период
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      {/* ===== Топ-10 по баллам ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">⭐ Топ-10 по баллам</h3>
        {loadingTop && <p className="text-sm text-gray-400 py-4 text-center">Загрузка…</p>}
        {!loadingTop && topSubscribers.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Нет данных</p>
        )}
        {!loadingTop && topSubscribers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Место</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Номер</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Оператор</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">Баллы</th>
                </tr>
              </thead>
              <tbody>
                {topSubscribers.map((s, i) => (
                  <tr key={s.msisdn} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-3 py-2 font-mono">{s.msisdn}</td>
                    <td className="px-3 py-2 text-gray-500">{s.operator || "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold text-blue-700">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
