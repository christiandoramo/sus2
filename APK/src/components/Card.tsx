import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type IconLibrary = typeof MaterialIcons | typeof AntDesign;

type CardProps = {
  title: string;
  size: string;
  iconLibrary: IconLibrary;
  iconName: string;
  iconSize: number;
  iconColor: string;
  flexDirection: "row" | "col";
  onPress?: () => void;
  disabled?: boolean;
};

export function Card({
  title,
  size,
  iconLibrary: Icon,
  iconName,
  iconSize = 24,
  iconColor = "black",
  flexDirection,
  onPress,
  disabled = true,
}: CardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1 },
        { elevation: 4 },
      ]}
      className={`${size} flex-1 justify-center items-center`}
    >
      <View
        className={`size-full flex-${flexDirection} justify-center items-center 
        rounded-2xl bg-BoxBackground shadow-md gap-4`}
      >
        <Icon
          name={iconName as any}
          size={iconSize}
          color={iconColor}
          style={{ opacity: 0.5, textAlign: "center" }}
          className="justify-center items-center opacity-50"
        />
        {title && (
          <Text
            className="text-base font-normal opacity-50 
        text-TextPrimary text-center"
          >
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
