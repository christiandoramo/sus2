import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import BouncyCheckbox from "react-native-bouncy-checkbox";

type Props = {
  text: string;
  onPress: (isChecked: boolean) => void;
};

export function Checkbox({ text, onPress }: Props) {
  return (
    <BouncyCheckbox
      size={25}
      fillColor={colors.ButtonBackground}
      unFillColor={colors.SecondaryButtonBackground}
      text={text}
      iconStyle={{ borderColor: colors.ButtonBackground }}
      innerIconStyle={{ borderWidth: 2 }}
      textStyle={{
        color: colors.TextSecondary,
        textDecorationLine: "none",
        fontFamily: fontFamily.regular,
        fontSize: 16,
        fontStyle: "normal",
        fontWeight: "400",
      }}
      onPress={onPress}
    />
  );
}
