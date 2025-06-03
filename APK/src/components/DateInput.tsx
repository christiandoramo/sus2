import DateTimePicker from "@react-native-community/datetimepicker";
import { clsx } from "clsx";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

interface DateInputProps {
  name: string;
  control: Control<any>;
  editable: boolean;
  placeholder: string;
}

function DateInput({ name, control, editable, placeholder }: DateInputProps) {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="flex-1">
          <Pressable onPress={() => setShow(true)} disabled={!editable}>
            <View className="flex-row items-center justify-between">
              <Text
                className={clsx("font-regular text-base font-normal", {
                  "text-black": value,
                  "text-TextSecondary": !value,
                })}
              >
                {value
                  ? new Date(value).toLocaleDateString("pt-BR")
                  : placeholder}
              </Text>
              {error && (
                <Text className="font-regular text-xs font-normal text-red-600">
                  {error.message}
                </Text>
              )}
            </View>
          </Pressable>
          {show && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event: any, selectedDate?: Date) => {
                setShow(false);
                const currentDate = selectedDate || date;
                setDate(currentDate);
                onChange(new Date(currentDate).toISOString());
              }}
            />
          )}
        </View>
      )}
    />
  );
}

export { DateInput };
