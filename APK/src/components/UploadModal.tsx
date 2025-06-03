import { Loading } from "@/components/Loading";
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Option = {
  children: React.ReactNode;
  text: string;
  onPress: () => void;
};

type Props = {
  modalVisible: boolean;
  onClose: () => void;
  options: Option[];
  isLoading?: boolean;
};

export function UploadModal({
  modalVisible,
  onClose,
  options,
  isLoading = false,
}: Props) {
  return (
    <Modal
      animationType="slide"
      visible={modalVisible}
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center bg-transparent">
          {isLoading && <Loading />}
          {!isLoading && (
            <TouchableWithoutFeedback>
              <View
                className="w-4/5 min-h-[20%] items-center justify-center p-5 rounded-xl bg-white gap-3"
                style={{ elevation: 5 }}
              >
                <Text className="font-regular text-xl font-bold mb-3">
                  Escolha a opção de upload
                </Text>

                <View className="w-full flex-row items-center justify-between gap-5">
                  {options.map((option, index) => (
                    <Pressable
                      key={index}
                      onPress={option.onPress}
                      className="flex-1 flex-col items-center 
                  justify-center p-3 rounded-lg gap-3 bg-BoxBackground"
                    >
                      {option.children}
                      <Text className="font-regular text-xs font-normal text-center">
                        {option.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
