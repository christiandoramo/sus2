import { useUserStore } from "@/store/userStore";
import { MaterialIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { useColorScheme } from "nativewind";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function ToggleTheme() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkTheme = colorScheme === "dark";

  const position = useSharedValue(isDarkTheme ? 0 : 1);

  const setTheme = useUserStore((state) => state.setTheme);

  const togglePosition = () => {
    position.value = withSpring(isDarkTheme ? 1 : 0, { damping: 2 });
    toggleColorScheme();

    const newTheme = isDarkTheme ? "light" : "dark";
    setTheme(newTheme);
  };

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value * 24 }],
    };
  });

  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={togglePosition}
        className="w-16 h-9 justify-center p-0.5"
      >
        <View
          className={clsx(
            "w-full h-full rounded-3xl p-0.5 justify-center",
            isDarkTheme ? "bg-[#292929]" : "bg-[#fea231]"
          )}
        >
          <Animated.View
            style={[animatedCircleStyle]}
            className={clsx(
              "size-6 rounded-xl items-center justify-center",
              isDarkTheme ? "bg-[#010101]" : "bg-white"
            )}
          >
            <MaterialIcons
              name={isDarkTheme ? "dark-mode" : "light-mode"}
              size={20}
              color={isDarkTheme ? "#feda42" : "#ffdd3e"}
            />
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}
