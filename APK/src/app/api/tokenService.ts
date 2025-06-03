import { useUserStore } from "@/store/userStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function refreshToken(refreshToken: string) {
  const { user } = useUserStore();
  try {
    const response = await fetch(`${API_URL}auth/refresh-token/${user?.userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao renovar o token');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao renovar o token');
  }
}