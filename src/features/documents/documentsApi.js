import { axiosRequest } from "../../utils/axiosInstance";

export const PAGE_SIZE = 50;
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_COMMENT_LENGTH = 500;
export const COMPANY_NAME = "Mavj (наши)";

export const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "jpg", "jpeg", "png", "zip",
];
export const FILE_ACCEPT = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

// Что можно открыть во вкладке. Тип задаём сами по расширению: blob открывается на домене
// админки, поэтому файл не должен отрисоваться как HTML, что бы ни прислал сервер
const PREVIEW_MIME = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export const fileExtension = (name) => {
  const m = /\.([^.]+)$/.exec(name || "");
  return m ? m[1].toLowerCase() : "";
};

export const canPreview = (doc) => fileExtension(doc.file_name) in PREVIEW_MIME;

// Проверка файла до отправки — те же правила, что и на бэкенде
export const validateDocumentFile = (file) => {
  if (!file) return "Файл не выбран";
  if (!ALLOWED_EXTENSIONS.includes(fileExtension(file.name))) {
    return "Недопустимый тип файла. Можно: PDF, DOC/DOCX, XLS/XLSX, CSV, TXT, JPG/PNG, ZIP";
  }
  if (file.size > MAX_FILE_SIZE) return "Файл больше 20 МБ";
  if (file.size === 0) return "Файл пустой";
  return null;
};

// Ошибки FastAPI: {"detail": "текст"} или список {msg}. Сообщение сервера показываем как есть
export const toApiError = (error, fallback) => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;
  let message = fallback;
  if (typeof detail === "string" && detail) message = detail;
  else if (Array.isArray(detail) && detail.length) {
    message = detail.map((d) => d?.msg).filter(Boolean).join("; ") || fallback;
  } else if (status === 413) message = "Файл больше 20 МБ";
  else if (status === 403) message = "Нет доступа";
  return { status, message };
};

const call = async (request, fallback) => {
  try {
    return (await request()).data;
  } catch (error) {
    throw toApiError(error, fallback);
  }
};

// Справочник типов приводим к [{code, name}] — независимо от того, пришёл список,
// словарь code → название или разбивка по владельцам {operator: [...], company: [...]}
const normalizeTypes = (data) => {
  const raw = data?.types ?? data?.items ?? data;
  const fromArray = (arr) =>
    arr.map((t) =>
      typeof t === "string"
        ? { code: t, name: t }
        : { code: t.code ?? t.value ?? t.id, name: t.name ?? t.name_ru ?? t.label_ru ?? t.label ?? t.title ?? t.code }
    );
  let list = [];
  if (Array.isArray(raw)) list = fromArray(raw);
  else if (raw && typeof raw === "object") {
    list = Object.entries(raw).flatMap(([code, v]) =>
      Array.isArray(v) ? fromArray(v) : [{ code, name: typeof v === "string" ? v : v?.name ?? code }]
    );
  }
  // «Прочее» есть и у операторов, и у компании — в общем фильтре оставляем один пункт
  return list.filter((t, i) => t.code && list.findIndex((x) => x.code === t.code) === i);
};

// owner: "operator" | "company" | undefined (все типы)
export const fetchDocumentTypes = (owner) =>
  call(
    () => axiosRequest.get("/documents/types", { params: { owner: owner || undefined } }),
    "Не удалось загрузить типы документов"
  ).then(normalizeTypes);

export const fetchDocuments = ({ owner, operator, type, period, q, page = 1, limit = PAGE_SIZE } = {}) =>
  call(
    () =>
      axiosRequest.get("/documents", {
        params: {
          owner: owner || undefined,
          operator: operator || undefined,
          type: type || undefined,
          period: period || undefined,
          q: q || undefined,
          page,
          limit,
        },
      }),
    "Не удалось загрузить документы"
  ).then((data) => ({ items: data?.items || [], total: data?.total ?? 0 }));

export const uploadDocument = ({ owner, operator, file, type, title, period, doc_date, comment }, onProgress) => {
  const form = new FormData();
  form.append("owner", owner);
  if (owner === "operator") form.append("operator", operator);
  form.append("type", type);
  form.append("title", title);
  if (period) form.append("period", period);
  if (doc_date) form.append("doc_date", doc_date);
  if (comment) form.append("comment", comment);
  form.append("file", file);
  return call(
    () =>
      axiosRequest.post("/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      }),
    "Не удалось загрузить документ"
  );
};

export const updateDocument = (id, changes) =>
  call(() => axiosRequest.patch(`/documents/${id}`, changes), "Не удалось сохранить документ");

export const deleteDocument = (id) =>
  call(() => axiosRequest.delete(`/documents/${id}`), "Не удалось удалить документ");

// Имя из Content-Disposition. Кириллица приходит в filename*=UTF-8''…
export const fileNameFromDisposition = (header) => {
  if (!header) return null;
  const encoded = /filename\*\s*=\s*(?:UTF-8|utf-8)?''([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // битая кодировка — попробуем обычный filename
    }
  }
  const plain = /filename\s*=\s*(?:"([^"]+)"|([^;]+))/i.exec(header);
  return plain ? (plain[1] ?? plain[2]).trim() : null;
};

const requestFile = async (id, inline) => {
  try {
    return await axiosRequest.get(`/documents/${id}/download`, {
      params: inline ? { inline: true } : undefined,
      responseType: "blob",
    });
  } catch (error) {
    throw toApiError(error, "Не удалось скачать документ");
  }
};

const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Публичных ссылок на файлы нет — качаем через API с токеном
export const downloadDocument = async (doc) => {
  const res = await requestFile(doc.id, false);
  saveBlob(res.data, fileNameFromDisposition(res.headers["content-disposition"]) || doc.file_name || doc.title);
};

export const previewDocument = async (doc) => {
  // Вкладку открываем сразу по клику, до запроса, иначе её заблокирует браузер
  const tab = window.open("", "_blank");
  if (!tab) return downloadDocument(doc);
  tab.opener = null;
  try {
    const res = await requestFile(doc.id, true);
    const blob = new Blob([res.data], { type: PREVIEW_MIME[fileExtension(doc.file_name)] });
    const url = URL.createObjectURL(blob);
    tab.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  } catch (error) {
    tab.close();
    throw error;
  }
};
