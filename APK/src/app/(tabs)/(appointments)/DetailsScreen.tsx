import { fetchWithAuth } from "@/app/api/apiClient";
import { getAddressFromCoordinates } from "@/app/api/geocodingService";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { showToast } from "@/components/Toast";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/styles/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Linking, ScrollView, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function DetailsScreen() {
  // Hooks
  const {
    specialty,
    doctorName,
    date,
    latitude,
    longitude,
    status,
    id,
    attachments,
    observation,
  } = useLocalSearchParams();
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  // Função auxiliar para converter os parâmetros em string
  const paramToString = (
    param: string | string[] | null | undefined,
    fieldName?: string
  ) => {
    if (fieldName === "observation") {
      return Array.isArray(param)
        ? param[0]
        : String(param ?? "motivo desconhecido");
    }
    return Array.isArray(param) ? param[0] : String(param ?? "");
  };

  // Variáveis derivadas dos parâmetros
  const specialtyString = paramToString(specialty);
  const doctorNameString = paramToString(doctorName);
  const dateString = paramToString(date);
  const latitudeString = paramToString(latitude);
  const longitudeString = paramToString(longitude);
  const statusString = paramToString(status);
  const idString = paramToString(id);
  const attachmentsString = paramToString(attachments);
  const observationString = paramToString(observation);

  const navigateToRequest = () => {
    router.push({
      pathname: "/RequestScreen",
      params: {
        requestId: idString,
        specialtyString,
        files: attachmentsString,
      },
    });
  };

  // Query para obter o endereço a partir das coordenadas
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["address", latitudeString, longitudeString],
    queryFn: async () => {
      const address = await getAddressFromCoordinates(
        latitudeString,
        longitudeString
      );
      return { address };
    },
    enabled: !!latitudeString && !!longitudeString,
  });

  // Mutação para alterar o status da requisição
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
      return { patchData, endpoint, body };
    },
    onSuccess: async ({ endpoint, body }) => {
      // Invalida a query geral de requisições
      await queryClient.invalidateQueries({
        queryKey: ["appointments", user?.id],
      });

      // Busca os detalhes da requisição atualizada
      const updatedRequest = await fetchWithAuth(`requests/${id}`, "GET", body);
      const requestDetails = await updatedRequest.json();

      // Mostra uma mensagem de sucesso
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

      // Navega para a tela de detalhes com os dados atualizados
      router.replace({
        pathname: `/DetailsScreen`,
        params: {
          specialty: requestDetails.specialty,
          doctorName: requestDetails.doctorName,
          date: requestDetails.date,
          latitude: requestDetails.latitude,
          longitude: requestDetails.longitude,
          status: requestDetails.status,
          id: requestDetails.id,
          attachments: requestDetails.attachments,
          observation: requestDetails.observation,
        },
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast("error", "Erro ao mudar status da requisição", error.message);
      }
    },
  });

  const handleRequest = async (endpoint: "confirm" | "cancel") => {
    await mutation.mutateAsync({ endpoint, id: idString });
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) =>
      console.error("Erro ao abrir o mapa", err)
    );
  };

  const address = data?.address;

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    showToast("error", "Erro ao conectar com a API do Google", error.message);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <View className="flex-1 bg-white dark:bg-gray-800">
        <View className="w-full">
          <Image
            source={require("@/assets/topo.png")}
            className="w-full h-[300px] flex-shrink-0 absolute -top-[70px]"
          />
          <View className="w-full justify-center items-center mt-16">
            <FontAwesome6 name="user-doctor" size={70} color="black" />
            <Text className="text-white text-center text-2xl font-bold mt-4">
              {specialtyString}
            </Text>
          </View>
        </View>

        {(statusString === "ACCEPTED" || statusString === "CONFIRMED") && (
          <>
            <View className="w-full mt-24 px-6 ms-2">
              <Text
                className="font-regular text-2xl font-normal text-black 
        dark:text-white text-justify"
              >
                {doctorNameString}
              </Text>
            </View>

            <View className="w-full px-6 ms-2">
              <Text
                className="font-regular text-xl font-normal text-black 
        dark:text-white text-justify"
              >
                {dateString}
              </Text>
            </View>

            <View className="w-full mt-6 px-6 ms-2">
              <Text
                className="font-regular text-sm font-semibold text-black 
        dark:text-white"
              >
                Localização:
              </Text>
              <Text
                className="font-regular font-normal text-xs text-TextSecondary 
        dark:text-SecondaryButtonBorder mt-1 mb-2"
              >
                {address || "Localização não disponível"}
              </Text>
              {latitudeString && longitudeString ? (
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                  initialRegion={{
                    latitude: parseFloat(latitudeString),
                    longitude: parseFloat(longitudeString),
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                  }}
                  scrollEnabled={true} // Desabilita o scroll do mapa
                  zoomEnabled={true} // Desabilita o zoom do mapa
                  rotateEnabled={false} // Desabilita a rotação do mapa
                  pitchEnabled={false} // Desabilita o inclinação do mapa
                  onPress={openMaps} // Adiciona a função de abrir o Google Maps ao clicar no mapa
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(latitudeString),
                      longitude: parseFloat(longitudeString),
                    }}
                    title="Localização"
                    description={address || "Localização não disponível"}
                  />
                </MapView>
              ) : (
                <Text className="mt-2 text-gray-500">
                  Preview do mapa não disponível
                </Text>
              )}
            </View>
          </>
        )}

        {statusString === "PENDING" && (
          <View className="w-11/12 mt-48 px-6 ms-2">
            <Text
              className="font-regular text-xl font-normal text-black 
      dark:text-white text-justify"
            >
              Sua Requisição foi enviada e está aguardando aceitação
            </Text>
          </View>
        )}

        {statusString === "DENIED" && (
          <View className="w-11/12 mt-48 px-6 ms-2">
            <Text
              className="font-regular text-xl font-normal text-black 
        dark:text-white text-justify"
            >
              Sua Requisição foi rejeitada por {observationString}. Clique em
              editar para tentar novamente:
            </Text>
          </View>
        )}

        {statusString === "ACCEPTED" && (
          <View className="flex-1 items-center justify-center gap-5 px-10">
            <View className="w-full flex-row items-center justify-between">
              <Button
                title="Aceitar"
                onPress={() => handleRequest("confirm")}
                isLoading={mutation.isPending}
                backgroundColor={colors.ButtonBackground}
                color={colors.ButtonText}
                size={"h-[60%] w-6/12"}
                border={"rounded-2xl border border-ButtonBorder"}
              />
              <Button
                title="Cancelar"
                onPress={() => handleRequest("cancel")}
                isLoading={mutation.isPending}
                backgroundColor={colors.SecondaryButtonBackground}
                color={colors.TextSecondary}
                size={"h-[60%] w-5/12"}
                border={"rounded-2xl border border-SecondaryButtonBorder"}
              />
            </View>
          </View>
        )}
        {statusString === "DENIED" && (
          <View className="flex-1 items-center justify-center gap-5 px-10">
            <View className="w-full items-center justify-start">
              <Button
                title="Editar"
                onPress={navigateToRequest}
                isLoading={mutation.isPending}
                backgroundColor={colors.ButtonBackground}
                color={colors.ButtonText}
                size={"h-[40%] w-9/12"}
                border={"rounded-2xl border border-SecondaryButtonBorder"}
              />
            </View>
          </View>
        )}
        {statusString === "PENDING" && (
          <View className="w-full h-[10%] items-center justify-center mt-32">
            <Card
              title="Aguardando"
              size="w-5/6"
              iconLibrary={AntDesign}
              iconName="clockcircleo"
              iconSize={50}
              iconColor={colors.TextPrimary}
              flexDirection="row"
            />
          </View>
        )}
        {statusString === "CONFIRMED" && (
          <View className="w-full h-[10%] items-center justify-center mt-10">
            <Card
              title="Confirmado"
              size="w-5/6"
              iconLibrary={AntDesign}
              iconName="checkcircleo"
              iconSize={50}
              iconColor={colors.TextPrimary}
              flexDirection="row"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
