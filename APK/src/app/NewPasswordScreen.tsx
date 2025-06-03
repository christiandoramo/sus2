import { newPassword } from "@/app/api/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import * as z from "zod";

const schema = z
  .object({
    token: z.string().min(1, "Token é obrigatório"),
    password: z.string().min(1, "Senha é obrigatória"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function NewPasswordScreen() {
  const { origin } = useLocalSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => {
      const message = await newPassword(token, password);
      return message;
    },
    onSuccess: async (message) => {
      showToast("success", "Email enviado", message);
      if (origin === "login") {
        router.replace("/LoginScreen");
      } else if (origin === "settings") {
        router.replace("/SettingsScreen");
      }
    },
    onError: (error) => {
      showToast("error", "Erro ao enviar email", error.message);
    },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-800 items-center justify-center gap-7">
      <View className="w-11/12 gap-5 justify-center mt-8">
        <Input>
          <Input.Field control={control} name="token" placeholder="Token" />
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
        <Input>
          <Input.Field
            control={control}
            name="confirmPassword"
            placeholder="Confirme sua senha"
            secureTextEntry={!passwordVisible}
          />
          <Pressable onPress={togglePasswordVisibility}>
            <Text className="font-regular text-base font-normal text-LinkText">
              {passwordVisible ? "Esconder" : "Mostrar"}
            </Text>
          </Pressable>
        </Input>
      </View>
      <View className="w-96 justify-center mt-5">
        <Button
          title={"Redefinir Senha"}
          onPress={handleSubmit(onSubmit)}
          isLoading={mutation.isPending}
          disabled={mutation.isPending}
          backgroundColor={colors.ButtonBackground}
          color={colors.ButtonText}
          size={"h-16 w-full"}
          border="rounded-2xl"
        />
      </View>
    </View>
  );
}
