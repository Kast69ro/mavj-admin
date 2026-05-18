export const token = localStorage.getItem("token") || null;

export const setToken = (newToken) => {
  localStorage.setItem("token", newToken);
};