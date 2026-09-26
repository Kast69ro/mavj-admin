import { useEffect, useState } from "react";
import { axiosRequest } from "./axiosInstance";

const COLOR_PALETTE = {
  green: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
  red: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  yellow: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  orange: { bg: "#ffedd5", text: "#9a3412", dot: "#f97316" },
  purple: { bg: "#f3e8ff", text: "#7e22ce", dot: "#a855f7" },
  grey: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  gray: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  blue: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
};

const FALLBACK_PALETTE = { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };

let _cache = null;
let _promise = null;

async function loadStatuses() {
  if (_cache) return _cache;
  if (!_promise) {
    _promise = axiosRequest
      .get("/statuses")
      .then(({ data }) => {
        const list = data.statuses || [];
        const config = {};
        list.forEach((s) => {
          const palette = COLOR_PALETTE[s.color] || FALLBACK_PALETTE;
          config[s.code] = { label: s.label_ru, ...palette };
        });
        const options = [
          { value: "", label: "Все статусы" },
          ...list.map((s) => ({ value: s.code, label: s.label_ru })),
        ];
        _cache = { config, options };
        return _cache;
      })
      .catch((e) => {
        console.error("Не удалось загрузить справочник статусов:", e);
        _promise = null;
        return { config: {}, options: [{ value: "", label: "Все статусы" }] };
      });
  }
  return _promise;
}

export function useStatuses() {
  const [state, setState] = useState(
    () => _cache || { config: {}, options: [{ value: "", label: "Все статусы" }] }
  );
  useEffect(() => {
    let mounted = true;
    loadStatuses().then((data) => {
      if (mounted) setState(data);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return state;
}
