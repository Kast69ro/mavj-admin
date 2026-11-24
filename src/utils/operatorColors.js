export const OPERATOR_COLORS = {
  megafon: { bg: "#22c55e", active: "#16a34a" },
  tcell: { bg: "#a855f7", active: "#9333ea" },
  anor: { bg: "#3b82f6", active: "#2563eb" },
  omobile: { bg: "#ef4444", active: "#dc2626" },
  zet: { bg: "#f97316", active: "#ea580c" },
  babilon: { bg: "#eab308", active: "#ca8a04" },
  company: { bg: "#0f172a", active: "#0f172a" }, // наши документы (Mavj)
  all: { bg: "#A4816F", active: "#8B6B5A" },
  default: { bg: "#9ca3af", active: "#6b7280" },
};

export const getOperatorColors = (code) =>
  OPERATOR_COLORS[String(code ?? "").toLowerCase()] ?? OPERATOR_COLORS.default;

// Запасные названия — для ролей, которым недоступен справочник /operators
const OPERATOR_NAMES = {
  megafon: "MegaFon",
  tcell: "Tcell",
  anor: "Anor",
  omobile: "O-Mobile",
  zet: "ZET",
  babilon: "Babilon",
};

export const operatorName = (code) => OPERATOR_NAMES[String(code ?? "").toLowerCase()] ?? code;
