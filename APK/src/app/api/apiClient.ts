import { refreshToken } from "@/app/api/tokenService";
import { useUserStore } from "@/store/userStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const fetchWithAuth = async (
  endpoint: string,
  method: string = "GET",
  body: any = null,
  contentType: string = "application/json"
) => {
  const { tokens } = useUserStore.getState();

  const headers: HeadersInit = {
    "Content-Type": contentType,
  };

  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
    body: body
      ? contentType === "application/json"
        ? JSON.stringify(body)
        : body
      : undefined,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    // Se a resposta for 401 (não autorizado), tenta atualizar o token
    if (response.status === 401) {
      if (!tokens?.refreshToken) {
        throw new Error("Refresh token não disponível");
      }

      // Atualiza o token
      const newTokens = await refreshToken(tokens.refreshToken);
      useUserStore.getState().setTokens(newTokens);

      // Reenvia a requisição com o novo token
      headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      return await retryResponse.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao realizar requisição:", error);
    throw error;
  }
};

export { fetchWithAuth };
