import { create } from "zustand";
import {
  deleteData as deleteAsyncData,
  getData as getAsyncData,
  saveData as saveAsyncData,
} from "./asyncStore";
import {
  deleteData as deleteSecureData,
  getData as getSecureData,
  saveData as saveSecureData,
} from "./secureStore";

interface UserState {
  user: {
    userId?: string;
    id?: string;
    name?: string;
    birthDate?: string;
    susNumber?: string;
    phoneNumber?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  tokens: {
    accessToken?: string;
    refreshToken?: string;
  } | null;
  saveSession: boolean;
  theme: "light" | "dark" | "system";
  notifications: boolean;

  setUser: (user: Partial<UserState["user"]>) => void;
  setTokens: (tokens: Partial<UserState["tokens"]>) => void;
  setSaveSession: (save: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setNotifications: (notifications: boolean) => void;

  loadStore: () => Promise<void>;
  clearStore: () => Promise<void>;
}

const validateTheme = (theme: any): "light" | "dark" | "system" => {
  return ["dark", "light", "system"].includes(theme) ? theme : "system";
};

const useUserStore = create<UserState>((set) => ({
  user: null,
  tokens: null,
  saveSession: false,
  theme: "light",
  notifications: true,

  setUser: async (user) => {
    set((state) => {
      const updatedUser = { ...state.user, ...user };

      if (state.saveSession) {
        // Se saveSession é true, salve ou atualize o usuário no SecureStore
        saveSecureData("user", JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },
  setTokens: async (tokens) => {
    // Atualizar o estado e armazenar tokens com base na configuração de salvar tokens
    set((state) => {
      const newTokens = { ...state.tokens, ...tokens };

      if (state.saveSession) {
        // Se saveSession é true, salve ou atualize os tokens no SecureStore
        if (newTokens.accessToken) {
          saveSecureData(
            "tokens",
            JSON.stringify({
              accessToken: newTokens.accessToken,
              refreshToken:
                newTokens.refreshToken || state.tokens?.refreshToken, // Atualiza o refreshToken
            })
          );
        } else {
          // Se accessToken não está presente, remova os tokens
          deleteSecureData("tokens");
          return { tokens: null };
        }
      } else {
        // Se setSaveSession é false, salve ou atualize os tokens apenas no estado
        if (newTokens.accessToken) {
          // Armazena temporariamente no estado
          set({
            tokens: {
              accessToken: newTokens.accessToken,
              refreshToken:
                newTokens.refreshToken || state.tokens?.refreshToken,
            },
          });
        } else {
          // Se accessToken não está presente, remova os tokens
          set({ tokens: null });
        }
      }

      return { tokens: newTokens };
    });
  },
  setSaveSession: async (save) => {
    set((state) => {
      if (!save && state.tokens) {
        // Se a configuração de salvar tokens for desativada e tokens existem, remova os tokens do SecureStore
        deleteSecureData("tokens");
      }
      // Atualize o estado com a nova configuração de salvar tokens
      return { saveSession: save };
    });
  },
  setTheme: async (theme) => {
    set((state) => {
      if (state.saveSession) {
        // Salvar o tema no AsyncStorage se saveSession for true
        saveAsyncData("theme", theme);
      }
      // Sempre atualiza o estado local com o tema, independentemente do saveSession
      return { theme };
    });
  },
  setNotifications: async (notifications) => {
    set((state) => {
      if (state.saveSession) {
        // Salvar o tema no AsyncStorage se saveSession for true
        saveAsyncData("notifications", JSON.stringify(notifications));
      }
      // Sempre atualiza o estado local com o tema, independentemente do saveSession
      return { notifications };
    });
  },
  loadStore: async () => {
    // Carregar dados do AsyncStorage e SecureStore e definir o estado
    const userData = await getSecureData("user");
    const tokenData = await getSecureData("tokens");
    const themeData = await getAsyncData("theme");
    const notificationsData = await getAsyncData("notifications");

    set({
      user: userData ? JSON.parse(userData) : null,
      tokens: tokenData ? JSON.parse(tokenData) : null,
      theme: themeData ? validateTheme(themeData) : "system",
      notifications: notificationsData ? JSON.parse(notificationsData) : null,
    });
  },
  clearStore: async () => {
    // Limpar AsyncStorage e SecureStore e redefinir o estado
    await deleteSecureData("user");
    await deleteSecureData("tokens");
    await deleteAsyncData("theme");
    await deleteAsyncData("notifications");
    set({ user: null, tokens: null, theme: "light", notifications: true });
  },
}));

export { useUserStore };
