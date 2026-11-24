import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOperators } from "../features/operators/operators";
import { axiosRequest } from "../utils/axiosInstance";
import { OPERATOR_COLORS } from "../utils/operatorColors";
import { formatDay } from "../utils/utils";

const periodYear = (p) => String(p.start_date ?? "").slice(0, 4);

const MEDALS = {
  0: { icon: "🥇", row: "bg-amber-50/70", ring: "ring-amber-200 bg-amber-100 text-amber-700" },
  1: { icon: "🥈", row: "bg-slate-50", ring: "ring-slate-200 bg-slate-100 text-slate-600" },
  2: { icon: "🥉", row: "bg-orange-50/60", ring: "ring-orange-200 bg-orange-100 text-orange-700" },
};

const fmt = (n) => Number(n ?? 0).toLocaleString("ru-RU");

const getColors = (op) => {
  const fallback = OPERATOR_COLORS[op?.code?.toLowerCase()] ?? OPERATOR_COLORS.default;
  return {
    bg: op?.color_bg ?? fallback.bg,
    active: op?.color_active ?? fallback.active,
  };
};

// ===== Мелкие UI-компоненты =====

const Place = ({ index }) => {
  const medal = MEDALS[index];
  if (medal) {
    return (
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 text-base ${medal.ring}`}>
        {medal.icon}
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
      {index + 1}
    </span>
  );
};

const OperatorChip = ({ code, operatorsByCode }) => {
  if (!code) return <span className="text-gray-300">—</span>;
  const op = operatorsByCode[code.toLowerCase()];
  const { active } = getColors(op ?? { code });
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${active}1a`, color: active }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active }} />
      {op?.name ?? code}
    </span>
  );
};

const Card = ({ icon, title, subtitle, actions, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl">{icon}</span>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const Skeleton = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-11 animate-pulse rounded-lg bg-gray-100" />
    ))}
  </div>
);

const Empty = ({ icon = "📭", text }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <span className="mb-2 text-3xl opacity-60">{icon}</span>
    <p className="text-sm text-gray-400">{text}</p>
  </div>
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="max-w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
  >
    {children}
  </select>
);

const Th = ({ children, right }) => (
  <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 ${right ? "text-right" : "text-left"}`}>
    {children}
  </th>
);

// ===== Страница =====

const MainPage = () => {
  const [selectedOperator, setSelectedOperator] = useState(""); // "" — все операторы
  const { info } = useSelector((state) => state.operators);
  const dispatch = useDispatch();

  const operatorsByCode = useMemo(
    () => (info ?? []).reduce((acc, op) => ({ ...acc, [String(op.code).toLowerCase()]: op }), {}),
    [info]
  );
  const selectedOp = operatorsByCode[selectedOperator.toLowerCase()];

  // ===== Победители прошлых розыгрышей =====
  const [completedPeriods, setCompletedPeriods] = useState([]); // варианты для фильтров
  const [year, setYear] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [periods, setPeriods] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [winnersError, setWinnersError] = useState(null);

  // ===== Топ-10 по баллам =====
  const [topSubscribers, setTopSubscribers] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  useEffect(() => {
    setLoadingTop(true);
    axiosRequest
      .get("/subscribers/top", {
        params: { limit: 10, operator: selectedOperator || undefined },
      })
      .then(({ data }) => setTopSubscribers(data.top || []))
      .catch(() => setTopSubscribers([]))
      .finally(() => setLoadingTop(false));
  }, [selectedOperator]);

  useEffect(() => {
    dispatch(fetchOperators());
  }, [dispatch]);

  // Варианты фильтров — все завершённые периоды, а не хардкод
  useEffect(() => {
    axiosRequest
      .get("/periods/completed", { params: { top_limit: 1 } })
      .then(({ data }) =>
        setCompletedPeriods(
          (data.periods || [])
            .map(({ period }) => period)
            .sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)))
        )
      )
      .catch(() => setCompletedPeriods([]));
  }, []);

  const availableYears = [...new Set(completedPeriods.map(periodYear))];
  const periodOptions = completedPeriods.filter((p) => !year || periodYear(p) === year);

  const handleYearChange = (value) => {
    setYear(value);
    // Выбранный период другого года сбрасываем
    const selected = completedPeriods.find((p) => String(p.id) === periodId);
    if (value && selected && periodYear(selected) !== value) setPeriodId("");
  };

  const loadWinners = useCallback(() => {
    setLoadingWinners(true);
    setWinnersError(null);
    axiosRequest
      .get("/periods/completed", {
        params: {
          period_id: periodId || undefined,
          year: (!periodId && year) || undefined, // период уже однозначно определяет год
          top_limit: 5,
          operator: selectedOperator || undefined,
        },
      })
      .then(({ data }) => setPeriods(data.periods || []))
      .catch(() => setWinnersError("Не удалось загрузить победителей"))
      .finally(() => setLoadingWinners(false));
  }, [year, periodId, selectedOperator]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  // Подстраховка: если бэк не фильтрует победителей по оператору — фильтруем на клиенте
  const filterByOperator = (rows) =>
    selectedOperator
      ? rows.filter((r) => String(r.operator || "").toLowerCase() === selectedOperator.toLowerCase())
      : rows;

  const maxPoints = Math.max(1, ...topSubscribers.map((s) => Number(s.points) || 0));
  const scopeLabel = selectedOp?.name ?? "все операторы";

  return (
    <div className="space-y-6">
      {/* ===== Заголовок ===== */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Главная</h2>
          <p className="mt-1 text-sm text-gray-500">
            Победители розыгрышей и лидеры по баллам · <span className="font-medium text-gray-700">{scopeLabel}</span>
          </p>
        </div>
      </div>

      {/* ===== Выбор оператора ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(() => {
            const isActive = selectedOperator === "";
            const c = OPERATOR_COLORS.all;
            return (
              <button
                onClick={() => setSelectedOperator("")}
                style={isActive ? { backgroundColor: c.active, borderColor: c.active } : {}}
                className={`flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "text-white shadow-md"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: isActive ? "#fff" : c.active }}
                />
                Все операторы
              </button>
            );
          })()}

          {info?.map((op) => {
            const colors = getColors(op);
            const isActive = selectedOperator === op.code;
            const isComingSoon = op.status === "coming_soon";
            const isDisabled = isComingSoon || op.status === "inactive";
            return (
              <button
                key={op.id}
                onClick={() => setSelectedOperator(op.code)}
                disabled={isDisabled}
                style={
                  isActive && !isDisabled
                    ? { backgroundColor: colors.active, borderColor: colors.active }
                    : {}
                }
                className={`flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  isDisabled
                    ? "cursor-not-allowed border-dashed border-gray-200 text-gray-300"
                    : isActive
                      ? "text-white shadow-md"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: isDisabled ? "#e5e7eb" : isActive ? "#fff" : colors.bg,
                  }}
                />
                {op.name}
                {isComingSoon && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-400">
                    скоро
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* ===== Победители прошлых розыгрышей ===== */}
        <div className="xl:col-span-3">
          <Card
            icon="🏆"
            title="Победители прошлых розыгрышей"
            subtitle="Топ-5 участников каждого завершённого периода"
            actions={
              <div className="flex flex-wrap gap-2">
                <Select value={year} onChange={handleYearChange}>
                  <option value="">Все годы</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
                <Select value={periodId} onChange={setPeriodId}>
                  <option value="">Все периоды</option>
                  {periodOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {`${p.name} (${formatDay(p.start_date)} – ${formatDay(p.end_date)})`}
                    </option>
                  ))}
                </Select>
              </div>
            }
          >
            {loadingWinners && <Skeleton rows={6} />}

            {!loadingWinners && winnersError && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{winnersError}</p>
                <button
                  onClick={loadWinners}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                >
                  Повторить
                </button>
              </div>
            )}

            {!loadingWinners && !winnersError && periods.length === 0 && (
              <Empty icon="🗓️" text="Завершённых розыгрышей за этот период нет" />
            )}

            {!loadingWinners && !winnersError && periods.length > 0 && (
              <div className="space-y-5">
                {periods.map(({ period, winners: allWinners }) => {
                  const winners = filterByOperator(allWinners || []);
                  return (
                    <div key={period.id} className="overflow-hidden rounded-xl border border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50/80 px-4 py-3">
                        <p className="font-semibold text-gray-800">{period.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-white px-2.5 py-1 text-gray-500 ring-1 ring-gray-200">
                            {period.start_date} — {period.end_date}
                          </span>
                          {period.prize_budget != null && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200">
                              Фонд: {fmt(period.prize_budget)} TJS
                            </span>
                          )}
                        </div>
                      </div>

                      {winners.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-gray-400">
                          {selectedOperator ? "Нет победителей этого оператора" : "Нет ответов за этот период"}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <Th>Место</Th>
                                <Th>Номер</Th>
                                <Th>Оператор</Th>
                                <Th right>Баллы</Th>
                                <Th right>Ответов</Th>
                              </tr>
                            </thead>
                            <tbody>
                              {winners.map((w, i) => (
                                <tr
                                  key={w.msisdn}
                                  className={`border-b border-gray-50 last:border-0 transition hover:bg-gray-50 ${MEDALS[i]?.row ?? ""}`}
                                >
                                  <td className="px-3 py-2"><Place index={i} /></td>
                                  <td className="px-3 py-2 font-mono text-gray-800">{w.msisdn}</td>
                                  <td className="px-3 py-2">
                                    <OperatorChip code={w.operator} operatorsByCode={operatorsByCode} />
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-indigo-600">
                                    {fmt(w.points)}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums text-gray-500">{fmt(w.answered)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ===== Топ-10 по баллам ===== */}
        <div className="xl:col-span-2">
          <div className="xl:sticky xl:top-6">
            <Card icon="⭐" title="Топ-10 по баллам" subtitle={`Лидеры · ${scopeLabel}`}>
              {loadingTop && <Skeleton rows={10} />}

              {!loadingTop && topSubscribers.length === 0 && <Empty text="Нет данных" />}

              {!loadingTop && topSubscribers.length > 0 && (
                <ul className="space-y-1.5">
                  {topSubscribers.map((s, i) => {
                    const pct = Math.round(((Number(s.points) || 0) / maxPoints) * 100);
                    return (
                      <li
                        key={s.msisdn}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-50 ${MEDALS[i]?.row ?? ""}`}
                      >
                        <Place index={i} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-sm text-gray-800">{s.msisdn}</span>
                            <span className="text-sm font-semibold tabular-nums text-indigo-600">
                              {fmt(s.points)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            {!selectedOperator && (
                              <OperatorChip code={s.operator} operatorsByCode={operatorsByCode} />
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
