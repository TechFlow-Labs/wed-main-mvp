import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { toLocalYmd } from '../lib/dateUtils';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reservationDates?: Set<string>;
  reservationCountByDate?: Record<string, number>;
  onMonthChange?: (date: Date) => void;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  reservationDates = new Set(),
  reservationCountByDate = {},
  onMonthChange
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth()));
  }, [selectedDate]);

  useEffect(() => {
    onMonthChange?.(currentMonth);
  }, [currentMonth, onMonthChange]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  const dayNames = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];

  const isSelectedDate = (day: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const getReservationCount = (day: number) => {
    const dateStr = toLocalYmd(new Date(year, month, day));
    return reservationCountByDate[dateStr] || 0;
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth()));
    onDateSelect(today);
  };

  const monthTotal = Object.values(reservationCountByDate).reduce((a, b) => a + b, 0);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <View className="bg-white rounded-lg shadow p-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-800">
          {monthNames[month]} {year}
        </Text>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={goToToday} className="px-3 py-1.5 bg-wed-accent-lighter rounded-lg">
            <Text className="text-sm font-medium text-wed-primary">Σήμερα</Text>
          </Pressable>
          <View className="flex-row gap-1">
            <Pressable onPress={previousMonth} className="p-2 rounded-lg">
              <ChevronLeft size={20} color="#6b7280" />
            </Pressable>
            <Pressable onPress={nextMonth} className="p-2 rounded-lg">
              <ChevronRight size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>
      </View>
      {monthTotal > 0 && (
        <View className="flex-row items-center gap-2 mb-4">
          <CalendarDays size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600">
            {monthTotal} {monthTotal === 1 ? 'κράτηση' : 'κρατήσεις'} αυτόν τον μήνα
          </Text>
        </View>
      )}

      <View className="gap-1">
        {/* Day headers row - 7 equal columns */}
        <View className="flex-row gap-1">
          {dayNames.map((day) => (
            <View key={day} className="flex-1 items-center justify-center py-2">
              <Text className="text-sm font-medium text-gray-500">{day}</Text>
            </View>
          ))}
        </View>
        {/* Calendar grid - rows of 7 equal cells */}
        {(() => {
          const totalSlots = startingDayOfWeek + daysInMonth;
          const paddedSlots = Math.ceil(totalSlots / 7) * 7;
          const slots: (number | null)[] = [
            ...Array.from({ length: startingDayOfWeek }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
            ...Array.from({ length: paddedSlots - totalSlots }, () => null)
          ];
          const rows: (number | null)[][] = [];
          for (let i = 0; i < slots.length; i += 7) {
            rows.push(slots.slice(i, i + 7));
          }
          return rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-1">
              {row.map((dayNum, colIndex) =>
                dayNum === null ? (
                  <View key={`empty-${rowIndex}-${colIndex}`} className="flex-1 aspect-square" />
                ) : (
                  <Pressable
                    key={dayNum}
                    onPress={() => onDateSelect(new Date(year, month, dayNum))}
                    className={`flex-1 aspect-square rounded-lg items-center justify-center ${
                      isSelectedDate(dayNum)
                        ? 'bg-wed-primary'
                        : isToday(dayNum)
                          ? 'bg-wed-accent-lighter border-2 border-wed-primary'
                          : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${isSelectedDate(dayNum) ? 'text-white' : 'text-gray-700'}`}>{dayNum}</Text>
                    {getReservationCount(dayNum) > 0 && (
                      <View className={`absolute bottom-1 min-w-[20px] h-5 px-1 rounded-full items-center justify-center ${isSelectedDate(dayNum) ? 'bg-white/30' : 'bg-wed-primary'}`}>
                        <Text className="text-xs font-semibold text-white">{getReservationCount(dayNum)}</Text>
                      </View>
                    )}
                  </Pressable>
                )
              )}
            </View>
          ));
        })()}
      </View>
    </View>
  );
}
