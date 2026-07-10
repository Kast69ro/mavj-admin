import { useEffect, useState } from "react";
import { operators, subscribers } from "../data/mockData";
import { useDispatch, useSelector } from "react-redux";
import { fetchOperators } from "../features/operators/operators";
import { OPERATOR_COLORS } from "../utils/operatorColors";

const MainPage = ({ onNavigate }) => {
  const [selectedOperator, setSelectedOperator] = useState("Tcell");

  const { info, error, isLoading } = useSelector((state) => state.operators);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOperators());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Главная</h2>
      {/* Operator selector */}
      <div className="grid grid-cols-6 gap-3">
        {info?.operators?.map((op) => {
          const colors = OPERATOR_COLORS[op.code] ?? {
            bg: "#9ca3af",
            active: "#6b7280",
          };
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
              {isDisabled && (
                <span className="block text-xs font-normal mt-0.5">скоро</span>
              )}
            </button>
          );
        })}
      </div>{" "}
      {/* Billing table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Тарификация</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Дата
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Номер
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Баллы
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm">{sub.date}</td>
                  <td className="px-4 py-3 text-sm font-mono">{sub.number}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {sub.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
