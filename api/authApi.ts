import api from "./axiosConfig";

export const loginRequest = (usuario: string, password: string) => {
  return api.post("/usuario/login", { usuario, password });
};
