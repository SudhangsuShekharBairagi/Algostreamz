import api from "./api";

const profileApi = {
  get: () => api.get("/profile"),
  update: (payload) => api.put("/profile", payload),
  changePassword: (payload) => api.put("/profile/password", payload),
  deleteAccount: (password) => api.delete("/profile", { data: { password } }),
  getProgress: () => api.get("/progress"),
};

export default profileApi;
