import { CustomFile } from "@/types/AppointmentTypes";
import { AntDesign } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

type FileThumbnailProps = {
  file: CustomFile;
  onRemove: () => void;
};

const FileThumbnail = ({ file, onRemove }: FileThumbnailProps) => {
  const isImage = file.type.startsWith("image/");

  return (
    <View className="w-[28%] h-[120px] m-1.5 rounded-lg overflow-hidden relative">
      <View className="flex-1">
        {isImage ? (
          <Image source={{ uri: file.uri }} className="size-full" />
        ) : (
          <View className="flex-1 justify-center items-center">
            <AntDesign name="pdffile1" size={50} color="red" />
          </View>
        )}
      </View>
      <Text className="flex-1 font-regular text-xs font-normal mt-1 text-center text-black dark:text-white">
        {file.name}
      </Text>
      <Pressable
        onPress={onRemove}
        className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
        style={{ elevation: 5 }}
      >
        <AntDesign name="closecircleo" size={20} color="white" />
      </Pressable>
    </View>
  );
};

export { FileThumbnail };
