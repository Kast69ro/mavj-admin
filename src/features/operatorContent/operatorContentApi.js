import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosRequest } from "../../utils/axiosInstance";

const BASE = "/operator-content";

export const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif";

// Проверка файла до отправки — те же правила, что и на бэкенде.
export const validateImage = (file) => {
  if (!file) return "Файл не выбран";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Допустимы PNG, JPG, WEBP, GIF";
  if (file.size > MAX_IMAGE_SIZE) return "Файл больше 3 МБ";
  return null;
};

// Бэкенд отдаёт ошибки как {"detail": "текст"}; 413 может прийти от прокси без detail.
export const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d) => d?.msg).filter(Boolean).join("; ") || fallback;
  }
  if (status === 413) return "Файл больше 3 МБ";
  return fallback;
};

const uploadImage = (url, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosRequest.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ===== Операторы =====

export const fetchContentOperators = createAsyncThunk(
  "operatorContent/fetchOperators",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get(`${BASE}/operators`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось загрузить операторов"));
    }
  }
);

export const updateContentOperator = createAsyncThunk(
  "operatorContent/updateOperator",
  async ({ code, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.patch(`${BASE}/operators/${code}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось сохранить оператора"));
    }
  }
);

export const uploadOperatorLogo = createAsyncThunk(
  "operatorContent/uploadLogo",
  async ({ code, file }, { rejectWithValue }) => {
    try {
      const { data } = await uploadImage(`${BASE}/operators/${code}/logo`, file);
      return { code, logo_url: data.logo_url };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось загрузить логотип"));
    }
  }
);

// ===== Периоды =====

export const fetchOperatorPeriods = createAsyncThunk(
  "operatorContent/fetchPeriods",
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get(`${BASE}/operators/${code}/periods`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось загрузить периоды"));
    }
  }
);

export const createOperatorPeriod = createAsyncThunk(
  "operatorContent/createPeriod",
  async ({ code, ...payload }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.post(`${BASE}/operators/${code}/periods`, payload);
      dispatch(fetchOperatorPeriods(code));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось создать период"));
    }
  }
);

export const updateOperatorPeriod = createAsyncThunk(
  "operatorContent/updatePeriod",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.patch(`${BASE}/periods/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось сохранить период"));
    }
  }
);

export const deleteOperatorPeriod = createAsyncThunk(
  "operatorContent/deletePeriod",
  async (id, { rejectWithValue }) => {
    try {
      await axiosRequest.delete(`${BASE}/periods/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось удалить период"));
    }
  }
);

// ===== Экран периода: призы и победители =====

export const fetchPeriodDetail = createAsyncThunk(
  "operatorContent/fetchPeriodDetail",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosRequest.get(`${BASE}/periods/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось загрузить период"));
    }
  }
);

// Сохраняет приз и, если выбрана картинка, сразу загружает её.
export const savePrize = createAsyncThunk(
  "operatorContent/savePrize",
  async ({ periodId, id, image, ...payload }, { dispatch, rejectWithValue }) => {
    let prize;
    try {
      const res = id
        ? await axiosRequest.patch(`${BASE}/prizes/${id}`, payload)
        : await axiosRequest.post(`${BASE}/periods/${periodId}/prizes`, payload);
      prize = res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось сохранить приз"));
    }
    try {
      if (image) await uploadImage(`${BASE}/prizes/${prize.id}/image`, image);
    } catch (error) {
      dispatch(fetchPeriodDetail(periodId));
      return rejectWithValue(
        `Приз сохранён, но фото не загружено: ${getErrorMessage(error, "ошибка загрузки")}`
      );
    }
    dispatch(fetchPeriodDetail(periodId));
    return prize;
  }
);

export const uploadPrizeImage = createAsyncThunk(
  "operatorContent/uploadPrizeImage",
  async ({ periodId, id, file }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await uploadImage(`${BASE}/prizes/${id}/image`, file);
      dispatch(fetchPeriodDetail(periodId));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось загрузить фото приза"));
    }
  }
);

export const deletePrize = createAsyncThunk(
  "operatorContent/deletePrize",
  async ({ periodId, id }, { dispatch, rejectWithValue }) => {
    try {
      await axiosRequest.delete(`${BASE}/prizes/${id}`);
      dispatch(fetchPeriodDetail(periodId));
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось удалить приз"));
    }
  }
);

// Сохраняет победителя и, если выбрано фото, сразу загружает его.
export const saveWinner = createAsyncThunk(
  "operatorContent/saveWinner",
  async ({ periodId, id, photo, ...payload }, { dispatch, rejectWithValue }) => {
    let winner;
    try {
      const res = id
        ? await axiosRequest.patch(`${BASE}/winners/${id}`, payload)
        : await axiosRequest.post(`${BASE}/periods/${periodId}/winners`, payload);
      winner = res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось сохранить победителя"));
    }
    try {
      if (photo) await uploadImage(`${BASE}/winners/${winner.id}/photo`, photo);
    } catch (error) {
      dispatch(fetchPeriodDetail(periodId));
      return rejectWithValue(
        `Победитель сохранён, но фото не загружено: ${getErrorMessage(error, "ошибка загрузки")}`
      );
    }
    dispatch(fetchPeriodDetail(periodId));
    return winner;
  }
);

export const uploadWinnerPhoto = createAsyncThunk(
  "operatorContent/uploadWinnerPhoto",
  async ({ periodId, id, file }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await uploadImage(`${BASE}/winners/${id}/photo`, file);
      dispatch(fetchPeriodDetail(periodId));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось загрузить фото победителя"));
    }
  }
);

export const deleteWinner = createAsyncThunk(
  "operatorContent/deleteWinner",
  async ({ periodId, id }, { dispatch, rejectWithValue }) => {
    try {
      await axiosRequest.delete(`${BASE}/winners/${id}`);
      dispatch(fetchPeriodDetail(periodId));
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось удалить победителя"));
    }
  }
);

// ===== Вкл/выкл оператора =====

export const OPERATOR_STATUSES = [
  { value: "active", label: "Включён" },
  { value: "inactive", label: "Выключен" },
  { value: "coming_soon", label: "Скоро" },
];

export const setOperatorStatus = createAsyncThunk(
  "operatorContent/setOperatorStatus",
  async ({ code, status }, { dispatch, rejectWithValue }) => {
    try {
      await axiosRequest.patch(`/operators/${code}/status`, null, { params: { status } });
      dispatch(fetchContentOperators());
      return { code, status };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Не удалось изменить статус оператора"));
    }
  }
);

// ===== Настройки, ответственные, партнёры, расходы, финансы =====
// Данные этих вкладок живут в состоянии страницы, поэтому thunk просто возвращает ответ.

const request = (type, fallback, call) =>
  createAsyncThunk(`operatorContent/${type}`, async (arg, { rejectWithValue }) => {
    try {
      const { data } = await call(arg);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, fallback));
    }
  });

export const fetchOperatorSettings = request("fetchSettings", "Не удалось загрузить настройки", (code) =>
  axiosRequest.get(`${BASE}/operators/${code}/settings`)
);
export const updateOperatorSettings = request("updateSettings", "Не удалось сохранить настройки", ({ code, ...payload }) =>
  axiosRequest.patch(`${BASE}/operators/${code}/settings`, payload)
);

export const fetchOperatorContacts = request("fetchContacts", "Не удалось загрузить ответственных", (code) =>
  axiosRequest.get(`${BASE}/operators/${code}/contacts`)
);
export const saveOperatorContact = request("saveContact", "Не удалось сохранить контакт", ({ code, id, ...payload }) =>
  id
    ? axiosRequest.patch(`${BASE}/contacts/${id}`, payload)
    : axiosRequest.post(`${BASE}/operators/${code}/contacts`, payload)
);
export const deleteOperatorContact = request("deleteContact", "Не удалось удалить контакт", (id) =>
  axiosRequest.delete(`${BASE}/contacts/${id}`)
);

export const fetchOperatorPartners = request("fetchPartners", "Не удалось загрузить партнёров", (code) =>
  axiosRequest.get(`${BASE}/operators/${code}/partners`)
);
export const saveOperatorPartner = request("savePartner", "Не удалось сохранить партнёра", ({ code, id, ...payload }) =>
  id
    ? axiosRequest.patch(`${BASE}/partners/${id}`, payload)
    : axiosRequest.post(`${BASE}/operators/${code}/partners`, payload)
);
export const deleteOperatorPartner = request("deletePartner", "Не удалось удалить партнёра", (id) =>
  axiosRequest.delete(`${BASE}/partners/${id}`)
);

// Категории приводим к [{code, label}] — независимо от того, пришёл ли список или словарь code → label
const normalizeCategories = (data) => {
  const raw = data?.categories ?? data;
  if (Array.isArray(raw)) {
    return raw.map((c) => ({ code: c.code ?? c.value ?? c.key ?? c.id, label: c.label ?? c.name ?? c.title }));
  }
  return Object.entries(raw || {}).map(([code, label]) => ({ code, label }));
};

export const fetchExpenseCategories = request("fetchExpenseCategories", "Не удалось загрузить категории расходов", () =>
  axiosRequest.get(`${BASE}/expense-categories`).then((res) => ({ data: normalizeCategories(res.data) }))
);
export const fetchOperatorExpenses = request("fetchExpenses", "Не удалось загрузить расходы", (code) =>
  axiosRequest.get(`${BASE}/operators/${code}/expenses`)
);
export const saveOperatorExpense = request("saveExpense", "Не удалось сохранить расход", ({ code, id, ...payload }) =>
  id
    ? axiosRequest.patch(`${BASE}/expenses/${id}`, payload)
    : axiosRequest.post(`${BASE}/operators/${code}/expenses`, payload)
);
export const deleteOperatorExpense = request("deleteExpense", "Не удалось удалить расход", (id) =>
  axiosRequest.delete(`${BASE}/expenses/${id}`)
);

export const fetchOperatorFinance = request("fetchFinance", "Не удалось загрузить финансы", ({ code, date_from, date_to }) =>
  axiosRequest.get(`${BASE}/operators/${code}/finance`, { params: { date_from, date_to } })
);
export const fetchAllFinance = request("fetchAllFinance", "Не удалось загрузить финансы", ({ date_from, date_to }) =>
  axiosRequest.get(`${BASE}/finance`, { params: { date_from, date_to } })
);
