import { useState } from "react";
import { Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useColorScheme } from "nativewind";
import * as Notifications from "expo-notifications";
import { useUserStore } from "@/store/userStore";

export function NotificationButton() {
  const [isDisabled, setIsDisabled] = useState(false); // Estado para desabilitar o botão
  const { colorScheme } = useColorScheme();
  const isDarkTheme = colorScheme === "dark";
  const iconColor = isDarkTheme ? "white" : "black";
  const setNotificationsOn = useUserStore((state) => state.setNotifications);
  const notificationsOn = useUserStore((state) => state.notifications);

  const toggleNotification = async () => {
    if (isDisabled) return; // Impede a função de ser chamada se o botão estiver desabilitado

    setIsDisabled(true); // Desabilita o botão

    if (!!notificationsOn) {
      setNotificationsOn(false);
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      setNotificationsOn(true);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notificação Ativada",
          body: "As notificações estão ativadas.",
        },
        trigger: { seconds: 2 },
      });
    }
    // Reabilita o botão após 2 segundos
    setTimeout(() => {
      setIsDisabled(false);
    }, 2000);
  };

  return (
    <Pressable onPress={toggleNotification} disabled={isDisabled}>
      {notificationsOn ? (
        <MaterialCommunityIcons name="bell-ring" size={24} color={iconColor} />
      ) : (
        <MaterialCommunityIcons
          name="bell-cancel"
          size={24}
          color={iconColor}
        />
      )}
    </Pressable>
  );
}
