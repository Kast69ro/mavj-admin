import { axiosRequest } from "../../utils/axiosInstance";
import { toApiError } from "../documents/documentsApi";

export const OVERVIEW_STATUSES = {
  active: { label: "Активен", className: "bg-emerald-50 text-emerald-700" },
  coming_soon: { label: "Скоро", className: "bg-sky-50 text-sky-700" },
  inactive: { label: "Неактивен", className: "bg-gray-100 text-gray-500" },
};

export const fetchOperatorsOverview = async () => {
  try {
    const { data } = await axiosRequest.get("/operators-overview");
    return data?.operators ?? (Array.isArray(data) ? data : []);
  } catch (error) {
    throw toApiError(error, "Не удалось загрузить операторов");
  }
};

export const fetchOperatorOverview = async (code) => {
  try {
    const { data } = await axiosRequest.get(`/operators-overview/${encodeURIComponent(code)}`);
    return data;
  } catch (error) {
    throw toApiError(error, "Не удалось загрузить сведения об операторе");
  }
};
