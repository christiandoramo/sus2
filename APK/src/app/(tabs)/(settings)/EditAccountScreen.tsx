import { fetchWithAuth } from "@/app/api/apiClient";
import { Button } from "@/components/Button";
import { DateInput } from "@/components/DateInput";
import { Input } from "@/components/Input";
import { showToast } from "@/components/Toast";
import { UploadModal } from "@/components/UploadModal";
import { useUserStore } from "@/store/userStore";
import { colors } from "@/styles/colors";
import { CustomFile } from "@/types/AppointmentTypes";
import { FontAwesome6 } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import * as z from "zod";

const schema = z.object({
  name: z.string().optional(),
  birthDate: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value);
    }, "Data inválida, use o formato yyyy-MM-ddTHH:mm:ss.sssZ"),
  susNumber: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return /^\d{15}$/.test(value);
    }, "N° do SUS deve ter exatamente 15 caracteres"),
  phoneNumber: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return /^\d{11}$/.test(value);
    }, "Telefone inválido, use o formato dd9seunúmero"),
  email: z.string().email("E-mail inválido").optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditAccountScreen() {
  const [image, setImage] = useState<CustomFile[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editable, setEditable] = useState(false);
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { user, setUser } = useUserStore();

  const UserImage = ({
    imageUri,
    onCameraPress,
  }: {
    imageUri?: string;
    onCameraPress: () => void;
  }) => {
    return (
      <View className="w-full items-center justify-center">
        <View
          className="size-36 rounded-full border-[0px] 
      border-white dark:border-gray-800 bg-[#F6F6F6] 
      dark:bg-gray-700 overflow-hidden items-center justify-center"
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="size-full object-cover"
            />
          ) : user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              className="size-full object-cover"
            />
          ) : (
            <FontAwesome6 name="user-large" size={80} color="gray" />
          )}
        </View>
        <Pressable
          onPress={onCameraPress}
          className="absolute bottom-2 right-2 bg-gray-200 rounded-full p-2"
        >
          <FontAwesome6
            name="camera"
            size={18}
            color={colors.BackgroundShapes}
          />
        </Pressable>
      </View>
    );
  };

  const mutation = useMutation({
    mutationFn: async ({
      name,
      birthDate,
      susNumber,
      phoneNumber,
      email,
      image,
    }: {
      name: string;
      birthDate: string;
      susNumber: string;
      phoneNumber: string;
      email: string;
      image: CustomFile[];
    }) => {
      const formData = new FormData();
      const updatedFields: { [key: string]: string } = {};

      const fields = { name, birthDate, susNumber, phoneNumber, email };

      Object.entries(fields).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
          updatedFields[key] = value;
        }
      });

      if (image.length > 0) {
        formData.append("file", {
          uri: image[0].uri,
          name: image[0].name,
          type: image[0].type,
        } as any);
        updatedFields["file"] = image[0].uri;
      }

      const patientData = await fetchWithAuth(
        `patients/${user?.id}`,
        "PATCH",
        formData,
        "multipart/form-data"
      );
      return { ...patientData, updatedFields };
    },
    onSuccess: async (data) => {
      const { updatedFields } = data;

      Object.keys(updatedFields).forEach((field) => {
        if (field !== "file") {
          setUser({ [field]: updatedFields[field] });
        }
      });

      if (data.avatar && updatedFields["file"]) {
        const uploads = await fetchWithAuth(`uploads/${data.avatar}`);
        setUser({ avatarUrl: uploads.url });
      }

      showToast(
        "success",
        "Informações atualizadas",
        "Suas informações foram atualizadas com sucesso"
      );

      router.replace("/SettingsScreen");
    },
    onError: (error) => {
      if (error instanceof Error) {
        showToast("error", "Erro ao atualizar informações", error.message);
      }
    },
  });

  const createFileObject = (
    uri: string,
    name: string,
    type: string
  ): CustomFile => {
    const cleanName = name; //name.split(".").slice(0, -1).join(".") || name;
    return {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      name,
      type,
    };
  };

  const pickImage = async (mode: "camera" | "galeria") => {
    try {
      let result;
      if (mode === "galeria") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.back,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled) {
        const file = createFileObject(
          result.assets[0].uri,
          result.assets[0].fileName || "image.jpg",
          result.assets[0].mimeType || "image/jpeg"
        );
        setImage([file]);
        setEditable(true);
        setModalVisible(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast("error", "Erro ao selecionar arquivo", error.message);
      } else {
        showToast("error", "Erro desconhecido", "Ocorreu um erro inesperado.");
      }
      setModalVisible(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (editable) {
      await mutation.mutateAsync({
        name: data.name || "",
        birthDate: data.birthDate || "",
        susNumber: data.susNumber || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        image,
      });
    } else {
      setEditable(true);
    }
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
          <View className="mt-4">
            <UserImage
              imageUri={image.length > 0 ? image[0].uri : user?.avatarUrl}
              onCameraPress={() => setModalVisible(true)}
            />
          </View>
          <UploadModal
            modalVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            options={[
              {
                children: (
                  <FontAwesome6
                    name="camera"
                    size={24}
                    color={colors.TextPrimary}
                  />
                ),
                text: "Câmera",
                onPress: () => pickImage("camera"),
              },
              {
                children: (
                  <FontAwesome6
                    name="image"
                    size={24}
                    color={colors.TextPrimary}
                  />
                ),
                text: "Galeria",
                onPress: () => pickImage("galeria"),
              },
            ]}
          />
          <View className="w-11/12 gap-8 justify-center mt-10">
            <Input>
              <Input.Field
                control={control}
                name="name"
                placeholder={user?.name || "Nome"}
                editable={editable}
              />
            </Input>
            <Input>
              <DateInput
                control={control}
                name="birthDate"
                placeholder={
                  user?.birthDate
                    ? format(new Date(user?.birthDate), "dd/MM/yyyy")
                    : "Data de Nascimento"
                }
                editable={editable}
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="sus"
                placeholder={user?.susNumber || "N° do SUS"}
                editable={editable}
                keyboardType="numeric"
              />
            </Input>

            <Input>
              <Input.Field
                control={control}
                name="phone"
                placeholder={user?.phoneNumber || "Telefone"}
                editable={editable}
                keyboardType="number-pad"
              />
            </Input>
            <Input>
              <Input.Field
                control={control}
                name="email"
                placeholder={user?.email || "E-mail"}
                editable={editable}
                keyboardType="email-address"
              />
            </Input>
          </View>
          <View className="w-96 justify-center mt-10">
            <Button
              title={editable ? "Confirmar" : "Editar informações"}
              onPress={handleSubmit(onSubmit)}
              isLoading={mutation.isPending}
              backgroundColor={colors.ButtonBackground}
              color={colors.ButtonText}
              size={"h-16 w-full"}
              border="rounded-2xl"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
