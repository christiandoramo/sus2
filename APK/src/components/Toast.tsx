import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

const showToast = (type: ToastType, text1: string, text2: any) => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
  });
};

export { showToast };
