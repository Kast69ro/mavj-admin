import React, { useEffect, useState, useCallback } from "react";
import { axiosRequest } from "../utils/axiosInstance";

const StatCard = ({ label, value, color, suffix = "%" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`text-3xl font-bold text-${color}-600`}>
      {value ?? "—"}
      {value != null ? suffix : ""}
    </p>
    {value != null && (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`bg-${color}-600 h-2 rounded-full`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    )}
  </div>
);

const statusColor = (status) => {
  if (status === "running") return "bg-emerald-500";
  if (status === "restarting") return "bg-amber-500";
  return "bg-gray-400";
};

const MonitoringPage = () => {
  const [system, setSystem] = useState(null);
  const [containers, setContainers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sysRes, contRes] = await Promise.all([
        axiosRequest.get("/monitoring/system"),
        axiosRequest.get("/monitoring/containers"),
      ]);
      setSystem(sysRes.data);
      setContainers(contRes.data.containers || []);
      setError(null);
    } catch (e) {
      setError(
        e.response?.data?.detail || "Не удалось получить данные мониторинга"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return <p className="text-gray-400">Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
        {error}
      </div>
    );
  }

  const runningCount = containers.filter((c) => c.status === "running").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Мониторинг системы</h2>
        <span className="text-xs text-gray-400">
          Обновляется каждые 5 сек · Аптайм: {system?.uptime?.human}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow p-5 text-white">
          <p className="text-sm opacity-90">Контейнеров работает</p>
          <p className="text-2xl font-bold">
            {runningCount} / {containers.length}
          </p>
        </div>
        <StatCard label="CPU (хост)" value={system?.cpu_percent} color="blue" />
        <StatCard
          label="Память"
          value={system?.memory?.percent}
          color="purple"
        />
        <StatCard label="Диск" value={system?.disk?.percent} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600">Память</p>
          <p className="text-lg font-semibold">
            {system?.memory?.used_mb?.toLocaleString()} МБ / {" "}
            {system?.memory?.total_mb?.toLocaleString()} МБ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600">Диск</p>
          <p className="text-lg font-semibold">
            {system?.disk?.used_gb} ГБ / {system?.disk?.total_gb} ГБ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600">Load average</p>
          <p className="text-lg font-semibold">
            {system?.load_avg?.["1m"]} / {system?.load_avg?.["5m"]} / {" "}
            {system?.load_avg?.["15m"]}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Контейнеры</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4">Имя</th>
                <th className="py-2 pr-4">Образ</th>
                <th className="py-2 pr-4">Статус</th>
                <th className="py-2 pr-4">CPU</th>
                <th className="py-2 pr-4">Память</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((c) => (
                <tr key={c.name} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium">{c.name}</td>
                  <td className="py-2 pr-4 text-gray-500 truncate max-w-[240px]">
                    {c.image}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${statusColor(
                          c.status
                        )}`}
                      />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {c.cpu_percent != null ? `${c.cpu_percent}%` : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    {c.mem_used_mb != null
                      ? `${c.mem_used_mb} / ${c.mem_limit_mb} МБ (${c.mem_percent}%)`
                      : "—"}
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

export default MonitoringPage;
