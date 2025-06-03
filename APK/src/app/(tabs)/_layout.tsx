import { colors } from "@/styles/colors";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image, useWindowDimensions } from "react-native";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();

  const titleColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
  const headerBackgroundColor = colorScheme === "dark" ? "#1F2937" : "#FFFFFF";
  const tabBarBackgroundColor = colorScheme === "dark" ? "#1F2937" : "#FFFFFF";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.BackgroundShapes,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="(appointments)"
        options={{
          title: "Página Inicial",
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => (
            <Image
              source={require("@/assets/inicio.png")}
              className="size-full"
              resizeMode="contain"
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="RequestScreen"
        options={{
          title: "Requisição",
          headerStyle: { backgroundColor: headerBackgroundColor },
          headerTintColor: titleColor,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: width > 390 ? 20 : 16,
            fontFamily: "Inter_400Regular",
            fontWeight: "bold",
          },
          href: "/RequestScreen",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("@/assets/requisicao.png")}
              className="size-full"
              resizeMode="contain"
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: "Configurações",
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ color }) => (
            <Feather
              name="settings"
              color={color}
              size={30}
              iconStyle={{
                flex: 1,
                aspectRatio: 1,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
