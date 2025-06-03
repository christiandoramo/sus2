import { Stack } from "expo-router/stack";
import { useColorScheme } from "nativewind";
import { useWindowDimensions } from "react-native";

export default function Layout() {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();

  const titleColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
  const headerBackgroundColor = colorScheme === "dark" ? "#1F2937" : "#FFFFFF";

  return (
    <>
      <Stack>
        <Stack.Screen
          name="SettingsScreen"
          options={{
            title: "Configurações",
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
          name="EditAccountScreen"
          options={{
            title: "Editar Conta",
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
    </>
  );
}
