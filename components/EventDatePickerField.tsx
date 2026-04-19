import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createElement } from 'react';
import { toLocalYmd } from '../lib/dateUtils';

type EventDatePickerFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

function formatPickerLabel(d: Date): string {
  return d.toLocaleDateString('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function EventDatePickerField({ value, onChange }: EventDatePickerFieldProps) {
  const [androidOpen, setAndroidOpen] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <View className="w-full border border-gray-300 rounded-lg overflow-hidden bg-white">
        {createElement('input', {
          type: 'date',
          value: toLocalYmd(value),
          onChange: (e: { target: { value: string } }) => {
            const v = e.target.value;
            if (!v) return;
            const [y, m, d] = v.split('-').map(Number);
            if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
              onChange(new Date(y, m - 1, d, 12, 0, 0, 0));
            }
          },
          style: {
            width: '100%',
            padding: '10px 12px',
            fontSize: 16,
            color: '#111827',
            borderWidth: 0,
            outlineStyle: 'none',
            boxSizing: 'border-box',
          },
        })}
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View>
        <Pressable
          onPress={() => setAndroidOpen(true)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <Text className="text-gray-900">{formatPickerLabel(value)}</Text>
          <Text className="text-xs text-gray-500 mt-1">Πατήστε για επιλογή ημερομηνίας</Text>
        </Pressable>
        {androidOpen ? (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setAndroidOpen(false);
              if (event.type === 'set' && date) {
                onChange(date);
              }
            }}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View className="w-full items-stretch">
      <Text className="text-sm text-gray-800 mb-2 font-medium">{formatPickerLabel(value)}</Text>
      <DateTimePicker
        value={value}
        mode="date"
        display="inline"
        themeVariant="light"
        onChange={(_event, date) => {
          if (date) onChange(date);
        }}
      />
    </View>
  );
}
