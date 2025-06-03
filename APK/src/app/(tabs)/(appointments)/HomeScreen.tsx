import { fetchWithAuth } from "@/app/api/apiClient";
import { AccordionItem } from "@/components/AccordionItem";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { showToast } from "@/components/Toast";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/styles/colors";
import { AppointmentProps } from "@/types/AppointmentTypes";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function AppointmentsScreen() {
  const { user } = useUserStore();
  const username = user?.name || "Usuário";
  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () => fetchWithAuth(`requests/patient-requests/${user?.id}`),
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <View className="flex-1 size-full justify-center items-center">
        <Loading />
      </View>
    );
  }

  if (isError) {
    showToast("error", "Erro ao efetuar requisição", error.message);
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-800">
      <View className="w-full mt-8 justify-center items-center">
        <Text className="font-regular text-black text-2xl font-bold dark:text-white">
          Olá, {username}
        </Text>
      </View>

      <View className="p-10 flex-1 mt-5">
        <Text className="font-regular text-xl font-medium text-black dark:text-white">
          Minhas Consultas:
        </Text>
        {Array.isArray(appointments) && appointments?.length > 0 ? (
          <FlashList
            data={(appointments as AppointmentProps[]).filter(
              (item) => item.status !== "CANCELLED" && item.status !== "EXPIRED"
            )}
            renderItem={({ item }) => {
              const formattedDate = item.date
                ? format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm")
                : "";

              return (
                <AccordionItem
                  key={item.id}
                  id={item.id}
                  specialty={item.specialty}
                  date={formattedDate}
                  doctorName={item.doctorName}
                  latitude={item.latitude}
                  longitude={item.longitude}
                  status={item.status}
                  attachments={item.attachments}
                  observation={item.observation}
                />
              );
            }}
            estimatedItemSize={40}
          />
        ) : (
          <View className="flex-1 justify-center items-center gap-10 my-10">
            <Text className="font-regular text-lg text-black dark:text-white">
              Nenhuma consulta encontrada.
            </Text>
            <Button
              title="Ir para Requisições"
              onPress={() => router.push("/RequestScreen")}
              backgroundColor={colors.ButtonBackground}
              color={colors.ButtonText}
              size={"h-16 w-full"}
              border="rounded-2xl border border-ButtonBorder"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
