import { loginRequest } from "@/api/authApi";
import { useState } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
}

export function useAuth() {
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const login = async (usuario: string, password: string) => {
    if (usuario.trim().length === 0 || password.trim().length === 0) {
      setError("Complete los campos requeridos");
      return;
    }

    try {
      const response = await loginRequest(usuario, password);
      const { estado, mensaje } = response.data;
      if (estado === "error") {
        setError(mensaje);
        return;
      }

      setAuth({ isAuthenticated: true, user: response.data.extraInfo });
      setError(null);
      return response.data;
    } catch (err: unknown) {
      let message = "Error al iniciar sesión";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        message = errorObj.response?.data?.message || message;
      }
      setError(message);
      throw err;
    }
  };

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    login,
    error,
  };
}
