import { Loading } from "@/components/Loading";
import { Pressable, PressableProps, Text } from "react-native";

type Props = PressableProps & {
  title: string;
  isLoading?: boolean;
  backgroundColor: string;
  color: string;
  size: string;
  border?: string;
};

export function Button({
  title,
  isLoading = false,
  backgroundColor,
  color,
  size,
  border,
  ...rest
}: Props) {
  return (
    <Pressable
      style={{ elevation: 5, backgroundColor }}
      disabled={isLoading}
      className={`${size} items-center justify-center ${border}`}
      {...rest}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <Text
          style={{ color }}
          className={"font-regular text-base font-normal"}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
