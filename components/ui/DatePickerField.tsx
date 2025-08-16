import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { TextInput } from 'react-native-paper';

type Props = {
  label: string;
  value: string; // expected format YYYY-MM-DD or empty
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerField({ label, value, onChange, minimumDate, maximumDate }: Props) {
  const [show, setShow] = useState(false);

  const dateValue = useMemo(() => {
    if (!value) return undefined;
    const parts = value.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m - 1, d);
    }
    return undefined;
  }, [value]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) onChange(formatDate(selectedDate));
  };

  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onPressIn={() => setShow(true)}
        editable={false}
        right={<TextInput.Icon icon="calendar" onPress={() => setShow(true)} />}
      />
      {show && (
        <DateTimePicker
          value={dateValue ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
} 