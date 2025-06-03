import { changePassword } from "@/app/api/auth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import * as z from "zod";

const schema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function ChangePassword() {
  const { origin } = useLocalSearchParams();
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await changePassword(email);
      return response;
    },
    onSuccess: async (response) => {
      const message = response.message || "Email enviado com sucesso";
      showToast("success", "Email enviado", message);
      router.push({
        pathname: "/NewPasswordScreen",
        params: { origin },
      });
    },
    onError: (error) => {
      showToast("error", "Erro ao enviar email", error.message);
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-800 items-center justify-center gap-7">
      <View className="w-11/12 gap-5 justify-center mt-8">
        <Input>
          <Input.Field
            control={control}
            name="email"
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
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
