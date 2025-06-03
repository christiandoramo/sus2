import { fetchWithAuth } from "@/app/api/apiClient";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { NotificationButton } from "@/components/NotificationButton";
import { showToast } from "@/components/Toast";
import { ToggleTheme } from "@/components/ToggleTheme";
import { useUserStore } from "@/store/userStore";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const UserImage = ({ avatarUrl }: { avatarUrl?: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <View
      className="w-[122px] h-[122px] rounded-full border 
    border-white bg-white dark:border-gray-800  dark:bg-gray-700 
    overflow-hidden relative -top-[61px] items-center justify-center"
    >
      {avatarUrl && loading && <Loading />}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="w-full h-full object-cover"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      ) : (
        <FontAwesome6 name="user-large" size={80} color="gray" />
      )}
    </View>
  );
};

export default function Profile() {
  const { user, clearStore } = useUserStore();
  const { colorScheme } = useColorScheme();
  const isDarkTheme = colorScheme === "dark";

  const mutation = useMutation({
    mutationFn: async () => {
      await fetchWithAuth(`auth/logout/${user?.userId}`, "POST");
    },
    onSuccess: async () => {
      await clearStore();
      showToast("success", "Até logo!", "Você saiu com sucesso. Volte sempre!");
      router.replace("/LoginScreen");
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast("error", "Falha ao sair", error.message);
      }
    },
  });

  const handleLogout = async () => {
    await mutation.mutateAsync();
  };

  const handleAboutUs = () => {
    Linking.openURL("https://sites.google.com/view/equipe-ctc?usp=sharing");
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:ctcagendasaude@gmail.com");
  };

  const handleChangePassword = () => {
    router.push({
      pathname: "/ChangePasswordScreen",
      params: { origin: "settings" },
    });
  };

  const iconColor = isDarkTheme ? "white" : "black";

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      className="bg-white dark:bg-gray-800"
    >
      <View className="flex-1 items-center">
        <Image
          source={require("@/assets/topo2.png")}
          className="w-full h-[90px] object-cover"
        />
        <UserImage avatarUrl={user?.avatarUrl} />
        <View className="mt-[-40px]">
          <Button
            title="Editar perfil"
            backgroundColor="#5DB075"
            color="#FFF"
            size="h-10 w-28"
            border="rounded-2xl"
            onPress={() => router.push("/EditAccountScreen")}
          />
        </View>
      </View>

      <View className="flex-col gap-8 mb-36 w-full px-6">
        {/* Notificações */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Entypo name="bell" size={24} color={iconColor} />
            <Text className="text-xl text-black dark:text-white">
              Notificações
            </Text>
          </View>
          <View className="me-5">
            <NotificationButton />
          </View>
        </View>

        {/* Sobre nós */}
        <Pressable
          className="flex-row items-center justify-between"
          onPress={handleAboutUs}
        >
          <View className="flex-row items-center gap-3">
            <FontAwesome6 name="people-group" size={20} color={iconColor} />
            <Text className="text-xl text-black dark:text-white">
              Sobre nós
            </Text>
          </View>
          <View className="me-5">
            <Entypo name="chevron-thin-right" size={24} color={iconColor} />
          </View>
        </Pressable>

        {/* Fale conosco */}
        <Pressable
          className="flex-row items-center justify-between"
          onPress={handleEmailPress}
        >
          <View className="flex-row items-center gap-3">
            <MaterialIcons name="email" size={24} color={iconColor} />
            <Text className="text-xl text-black dark:text-white">
              Fale conosco
            </Text>
          </View>
          <View className="me-5">
            <Entypo name="chevron-thin-right" size={24} color={iconColor} />
          </View>
        </Pressable>

        {/* Alterar Senha */}
        <Pressable onPress={handleChangePassword}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <FontAwesome6 name="key" size={24} color={iconColor} />
              <Text className="text-xl text-black dark:text-white">
                Alterar Senha
              </Text>
            </View>
            <View className="me-5">
              <Entypo name="chevron-thin-right" size={24} color={iconColor} />
            </View>
          </View>
        </Pressable>

        {/* Alterar o tema */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color={iconColor}
            />
            <Text className="text-xl text-black dark:text-white">
              Alterar o tema
            </Text>
          </View>
          <View className="me-0.5">
            <ToggleTheme />
          </View>
        </View>

        {/* Sair da conta */}
        <Pressable onPress={handleLogout}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={iconColor}
              />
              <Text className="text-xl text-black dark:text-white">
                Sair da conta
              </Text>
            </View>
            <View className="me-5">
              <Entypo name="chevron-thin-right" size={24} color={iconColor} />
            </View>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
