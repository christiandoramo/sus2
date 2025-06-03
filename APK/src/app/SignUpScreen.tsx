import { login, register } from "@/app/api/auth";
import { Button } from "@/components/Button";
import { DateInput } from "@/components/DateInput";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
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

const schema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    birthDate: z
      .string()
      .min(1, "Data de Nascimento é obrigatória")
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        "Data inválida, use o formato yyyy-MM-ddTHH:mm:ss.sssZ"
      ),
    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .regex(/^\d+$/, "CPF deve conter apenas números")
      .length(11, "CPF deve ter exatamente 11 caracteres"),
    susNumber: z
      .string()
      .regex(/^\d+$/, "N° do SUS deve conter apenas números")
      .length(15, "N° do SUS deve ter exatamente 15 caracteres"),
    phoneNumber: z
      .string()
      .regex(/^\d{2}9\d{8}$/, "Telefone inválido, use o formato dd9seunúmero")
      .length(11, "N° do SUS deve ter exatamente 15 caracteres"),
    email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
    password: z.string().min(1, "Senha é obrigatória"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function Profile() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { setUser, setTokens, setSaveSession, loadStore } = useUserStore();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: "",
      birthDate: "",
      cpf: "",
      susNumber: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: {
      email: string;
      cpf: string;
      password: string;
      name: string;
      phoneNumber: string;
      susNumber: string;
      birthDate: string;
    }) => {
      try {
        await register(data);
        const loginData = await login(data.email, data.password);

        return {
          ...loginData,
          email: data.email,
          name: data.name,
          phoneNumber: data.phoneNumber,
          susNumber: data.susNumber,
          birthDate: data.birthDate,
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async (data) => {
      const {
        accessToken,
        id,
        userId,
        refreshToken,
        email,
        name,
        phoneNumber,
        susNumber,
        birthDate,
      } = data;

      await loadStore();

      setUser({
        userId,
        id,
        name,
        birthDate,
        susNumber,
        phoneNumber,
        email,
      });
      setSaveSession(true);
      setTokens({ accessToken, refreshToken });

      showToast("success", "Cadastro efetuado com sucesso", "Seja bem-vindo!");
      router.replace("/HomeScreen");
      await mobileDeviceCheckIn(id); // checkin do celular
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("cadastro")) {
          showToast("error", "Falha no cadastro", error.message);
        } else if (error.message.includes("login")) {
          showToast("error", "Falha no login", error.message);
        } else {
          showToast(
            "error",
            "Falha na operação",
            "Ocorreu um erro desconhecido."
          );
        }
      } else {
        showToast(
          "error",
          "Falha na operação",
          "Ocorreu um erro desconhecido."
        );
      }
    },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const { confirmPassword, ...rest } = data;
    await mutation.mutateAsync(rest);
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
        <View className="flex-1 bg-white dark:bg-gray-800 items-center">
          <View className="w-11/12 gap-5 justify-center mt-8">
            <Input>
              <Input.Field control={control} name="name" placeholder="Nome" />
            </Input>
            <Input>
              <DateInput
                name="birthDate"
                placeholder="Data de Nascimento"
                editable={true}
                control={control}
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="cpf"
                placeholder="CPF"
                keyboardType="numeric"
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="susNumber"
                placeholder="N° do SUS"
                keyboardType="numeric"
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="phoneNumber"
                placeholder="Telefone"
                keyboardType="number-pad"
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="email"
                placeholder="E-mail"
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
          <View className="flex-1 items-center justify-center mt-4">
            <View className="w-96 justify-center">
              <Button
                title={"Confirmar"}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
