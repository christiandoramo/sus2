import { Loading } from "@/components/Loading";
import { useUserStore } from "@/store/userStore";
import "@/styles/global.css";
import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "expo-router";
import { Stack } from "expo-router/stack";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { ImageBackground, useWindowDimensions, View } from "react-native";
import Toast from "react-native-toast-message";

const queryCLient = new QueryClient();

export default function Layout() {
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const { loadStore, tokens, theme } = useUserStore();

  const titleColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
  const headerBackgroundColor = colorScheme === "dark" ? "#1F2937" : "#FFFFFF";

  useEffect(() => {
    const initializeSession = async () => {
      await loadStore();
      setIsLoading(false);
    };
    if (fontsLoaded) {
      initializeSession();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isLoading) {
      if (theme) {
        setColorScheme(theme);
      }
      if (tokens?.accessToken && tokens?.refreshToken) {
        router.replace("/HomeScreen");
      } else {
        router.replace("/LoginScreen");
      }
    }
  }, [isLoading]);

  if (isLoading || !fontsLoaded) {
    return (
      <>
        <ImageBackground
          source={require("../../assets/images/splash.png")}
          resizeMode="cover"
          className="flex-1 items-center bg-cover"
        ></ImageBackground>
        <View
          className="flex-1 absolute top-80 bottom-0 inset-x-0 items-center justify-center"
          style={{ zIndex: 999 }}
        >
          <Loading />
        </View>
      </>
    );
  }

  return (
    <>
      <QueryClientProvider client={queryCLient}>
        <Stack>
          <Stack.Screen
            name="LoginScreen"
            options={{
              title: "Agenda Saúde",
              headerStyle: { backgroundColor: headerBackgroundColor },
              headerTintColor: titleColor,
              headerShadowVisible: false,
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontSize: width > 390 ? 20 : 16,
                fontFamily: "Inter_400Regular",
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="SignUpScreen"
            options={{
              title: "Cadastro",
              headerStyle: { backgroundColor: headerBackgroundColor },
              headerTintColor: titleColor,
              headerShadowVisible: false,
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontSize: width > 390 ? 20 : 16,
                fontFamily: "Inter_400Regular",
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="ChangePasswordScreen"
            options={{
              title: "Alterar Senha",
              headerStyle: { backgroundColor: headerBackgroundColor },
              headerTintColor: titleColor,
              headerShadowVisible: false,
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontSize: width > 390 ? 20 : 16,
                fontFamily: "Inter_400Regular",
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="NewPasswordScreen"
            options={{
              title: "Nova Senha",
              headerStyle: { backgroundColor: headerBackgroundColor },
              headerTintColor: titleColor,
              headerShadowVisible: false,
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontSize: width > 390 ? 20 : 16,
                fontFamily: "Inter_400Regular",
                fontWeight: "bold",
              },
            }}
          />
        </Stack>
        <Toast />
      </QueryClientProvider>
    </>
  );
}
