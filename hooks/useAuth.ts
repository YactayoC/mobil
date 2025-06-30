import { loginRequest } from "@/api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const authData = await AsyncStorage.getItem("authState");
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        setAuth(parsedAuth);
      }
    } catch (error) {
      console.error("Error al cargar el estado de autenticación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthState = async (authState: AuthState) => {
    try {
      await AsyncStorage.setItem("authState", JSON.stringify(authState));
      console.log("Estado guardado en AsyncStorage:", authState);
    } catch (error) {
      console.error("Error al guardar el estado de autenticación:", error);
    }
  };

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

      const newAuthState = {
        isAuthenticated: true,
        user: response.data.extraInfo.idUsuario,
      };

      setAuth(newAuthState);
      await saveAuthState(newAuthState);
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

  const logout = async () => {
    const newAuthState = {
      isAuthenticated: false,
      user: null,
    };

    setAuth(newAuthState);
    await saveAuthState(newAuthState);
    setError(null);
    console.log("Usuario deslogueado");
  };

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth,
    login,
    logout,
    error,
    isLoading,
  };
}
