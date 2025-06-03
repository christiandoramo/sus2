import { fetchWithAuth } from "@/app/api/apiClient";
import { Button } from "@/components/Button";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/styles/colors";
import { AppointmentProps } from "@/types/AppointmentTypes";
import { AntDesign } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Card } from "./Card";
import { showToast } from "./Toast";

const AccordionItem = ({
  specialty,
  date,
  doctorName,
  latitude,
  longitude,
  status,
  id,
  attachments,
  observation,
}: AppointmentProps) => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const navigateToDetails = () => {
    router.push({
      pathname: "/DetailsScreen",
      params: {
        specialty,
        doctorName,
        date,
        latitude,
        longitude,
        status,
        id,
        attachments,
        observation,
      },
    });
  };

  const navigateToRequest = () => {
    router.push(
      `/RequestScreen?requestId=${id}&requestSpeciality=${specialty}`
    );
  };

  const mutation = useMutation({
    mutationFn: async ({
      endpoint,
      id,
    }: {
      endpoint: "confirm" | "cancel";
      id: string;
    }) => {
      const body = { patientId: user?.id };
      const patchData = await fetchWithAuth(
        `requests/${endpoint}/${id}`,
        "PATCH",
        body
      );
      return { patchData, endpoint };
    },
    onSuccess: async ({ endpoint }) => {
      const successMessage =
        endpoint === "confirm"
          ? {
              title: "Consulta confirmada",
              message: "Consulta confirmada com sucesso!",
            }
          : {
              title: "Consulta cancelada",
              message: "Consulta cancelada com sucesso!",
            };
      showToast("success", successMessage.title, successMessage.message);
      // Invalida a consulta para garantir que a lista de consultas seja atualizada
      await queryClient.invalidateQueries({
        queryKey: ["appointments", user?.id],
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast("error", "Erro ao mudar status da requisição", error.message);
      }
    },
  });

  const handleRequest = async (endpoint: "confirm" | "cancel") => {
    await mutation.mutateAsync({ endpoint, id });
  };

  return (
    <View className="w-full my-3">
      {/* Corpo do Accordion */}
      <Pressable
        className={`w-full h-[47px] rounded-t-[16px] flex-row justify-between items-center ${
          expanded ? "bg-ButtonBackground" : "bg-white"
        }`}
        style={{
          elevation: 4,
          borderBottomLeftRadius: expanded ? 0 : 16,
          borderBottomRightRadius: expanded ? 0 : 16,
        }}
        onPress={() => setExpanded(!expanded)}
      >
        <View className="flex-row items-center">
          {expanded ? (
            <View className="ml-3">
              <Text className="font-regular font-normal text-white text-[13px]">
                Requisição de consulta
              </Text>
              {date !== "" && (
                <View className="flex-row items-center">
                  <FontAwesome6 name="clock" size={14} color="white" />
                  <Text className="font-regular font-normal text-white text-[10.5px] ml-1">
                    {date}
                  </Text>
                </View>
              )}
              {status === "PENDING" && (
                <View className="flex-row items-center">
                  <Text className="font-regular font-normal text-white text-[10.5px]">
                    Aguardando confirmação do sistema
                  </Text>
                </View>
              )}
              {status === "DENIED" && (
                <View className="flex-row items-center">
                  <Text className="font-regular font-normal text-white text-[10.5px]">
                    Requisição negada, clique em editar para refazer
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-row items-center">
              <View className="ml-3">
                <FontAwesome6 name="user-doctor" size={36} color="black" />
              </View>
              <View className="ml-3">
                <Text className="font-regular font-normal text-black text-[13px]">
                  {specialty}
                </Text>
                <Text className="font-regular font-normal text-TextSecondary text-[12px]">
                  {date}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Pressable onPress={() => setExpanded(!expanded)} className="mr-2">
          <FontAwesome6
            name={`chevron-${expanded ? "up" : "down"}`}
            size={20}
            color="black"
          />
        </Pressable>
      </Pressable>

      {/* Conteúdo Expandido */}
      {expanded && (
        <View
          className="w-full h-[121.275px] bg-white rounded-b-[16px] p-4 mt-0"
          style={{ elevation: 4 }}
        >
          <View className="flex-row justify-between mt-1">
            <View className="flex-row items-center ms-3">
              <FontAwesome6 name="user-doctor" size={36} color="black" />
              <Text className="font-regular font-normal text-black text-[13px] ml-3">
                {specialty}
              </Text>
            </View>
            <View className="items-center me-3">
              <Pressable onPress={navigateToDetails}>
                <Feather
                  name="info"
                  size={24}
                  color={colors.ButtonBackground}
                />
              </Pressable>
              <Text className="font-regular font-normal text-TextSecondary text-[10px] mt-1">
                Detalhes
              </Text>
            </View>
          </View>

          <View className="flex-1 flex-row justify-center gap-5 mt-3 px-10">
            {status === "ACCEPTED" && (
              <>
                <View className="w-7/12 items-center justify-center">
                  <Button
                    title="Aceitar"
                    onPress={() => handleRequest("confirm")}
                    isLoading={mutation.isPending}
                    disabled={mutation.isPending}
                    backgroundColor={colors.ButtonBackground}
                    color={colors.ButtonText}
                    size={"h-10 w-40"}
                    border={"rounded-2xl border border-ButtonBorder"}
                  />
                </View>
                <View className="w-5/12 items-center justify-center">
                  <Button
                    title="Rejeitar"
                    onPress={() => handleRequest("cancel")}
                    isLoading={mutation.isPending}
                    disabled={mutation.isPending}
                    backgroundColor={colors.SecondaryButtonBackground}
                    color={colors.TextSecondary}
                    size={"h-10 w-24"}
                    border={"rounded-2xl border border-SecondaryButtonBorder"}
                  />
                </View>
              </>
            )}

            {status === "DENIED" && (
              <View className="w-full items-center justify-center">
                <Button
                  title="Editar"
                  onPress={navigateToRequest}
                  backgroundColor={colors.ButtonBackground}
                  color={colors.ButtonText}
                  size={"h-10 w-40"}
                  border={"rounded-2xl border border-ButtonBorder"}
                />
              </View>
            )}

            {status === "PENDING" && (
              <View className="w-full items-center justify-center">
                <Card
                  title="Aguardando"
                  size="w-5/6 h-1/6"
                  iconLibrary={AntDesign}
                  iconName="clockcircleo"
                  iconSize={24}
                  iconColor={colors.TextPrimary}
                  flexDirection="row"
                />
              </View>
            )}

            {status === "CONFIRMED" && (
              <View className="w-full items-center justify-center">
                <Card
                  title="Confirmado"
                  size="w-5/6 h-1/6"
                  iconLibrary={AntDesign}
                  iconName="checkcircleo"
                  iconSize={24}
                  iconColor={colors.TextPrimary}
                  flexDirection="row"
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export { AccordionItem };
