const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao realizar o login");
    }

    return response.json();
  } catch (error) {
    console.error("Error during login:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao realizar o login");
  }
}

export async function register(data: {
  email: string;
  cpf: string;
  password: string;
  name: string;
  phoneNumber: string;
  susNumber: string;
  birthDate: string;
}) {
  try {
    const response = await fetch(`${API_URL}patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao realizar o cadastro");
    }

    return response.json();
  } catch (error) {
    console.error("Error during registration:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao realizar o cadastro");
  }
}

export async function changePassword(email: string) {
  try {
    const response = await fetch(`${API_URL}users/request-password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao realizar o reset de senha");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro durante reset de senha:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido o reset de senha");
  }
}

export async function newPassword(token: string, newPassword: string) {
  try {
    const response = await fetch(`${API_URL}users/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao realizar a troca de senha");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro durante troca de senha:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao realizar a troca de senha");
  }
}
