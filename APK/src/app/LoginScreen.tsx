import { fetchWithAuth } from "@/app/api/apiClient";
import { login } from "@/app/api/auth";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as z from "zod";
import { mobileDeviceCheckIn } from "./api/notification";

const schema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { setUser, setTokens, setSaveSession } = useUserStore();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const loginData = await login(email, password);
      const { accessToken, refreshToken, id, userId } = loginData;

      setSaveSession(isChecked);
      setTokens({ accessToken, refreshToken });

      const patientData = await fetchWithAuth(`patients/${id}`);

      return { id, userId, ...patientData };
    },
    onSuccess: async (data) => {
      const {
        id,
        userId,
        email,
        name,
        phoneNumber,
        susNumber,
        birthDate,
        avatar,
      } = data;

      setUser({
        userId,
        id,
        name,
        birthDate,
        susNumber,
        phoneNumber,
        email,
      });

      if (avatar) {
        const uploads = await fetchWithAuth(`uploads/${avatar}`);
        setUser({ avatarUrl: uploads.url });
      }

      showToast("success", "Login efetuado com sucesso", "Seja bem-vindo!");
      router.replace("/HomeScreen");
      await mobileDeviceCheckIn(id); // checkin do celular
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast("error", "Falha no login", error.message);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center p-8 bg-white dark:bg-gray-800">
          <View className="w-full gap-3">
            <Input>
              <Input.Field
                control={control}
                name="email"
                placeholder="Digite seu E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="password"
                placeholder="Digite sua senha"
                secureTextEntry={!passwordVisible}
              />
              <Pressable onPress={togglePasswordVisibility}>
                <Text className="font-regular text-base font-normal text-LinkText">
                  {passwordVisible ? "Esconder" : "Mostrar"}
                </Text>
              </Pressable>
            </Input>
            <View className="w-full items-start justify-start">
              <Checkbox
                text="Mantenha-me Conectado"
                onPress={(isChecked) => setIsChecked(isChecked)}
              />
            </View>
            <View className="w-full items-end justify-end">
              <Link
                href={{
                  pathname: "/ChangePasswordScreen",
                  params: { origin: "login" },
                }}
              >
                <Text className="font-regular text-base font-normal text-LinkText">
                  Esqueci minha senha
                </Text>
              </Link>
            </View>
          </View>
          <View className="mt-36"></View>
          <View className="flex-1 w-96 items-center mt-12">
            <Button
              title="Fazer Login"
              onPress={handleSubmit(onSubmit)}
              isLoading={mutation.isPending}
              backgroundColor={colors.ButtonBackground}
              color={colors.ButtonText}
              size={"h-16 w-full"}
              border="rounded-2xl border border-ButtonBorder"
            />
          </View>
          <View className="w-full flex-row flex-wrap items-center justify-center gap-2">
            <Text className="font-regular text-base font-normal text-TextPrimary dark:text-white">
              Ainda não possui uma conta?
            </Text>
            <Link href={"/SignUpScreen"}>
              <Text className="font-regular text-base font-normal text-LinkText">
                Cadastre-se
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
