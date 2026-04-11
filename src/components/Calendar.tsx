import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const hasReservation = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return reservationDates.has(dateStr);
  };

  const getReservationCount = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
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
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-wed-primary bg-wed-accent-lighter rounded-lg hover:bg-wed-accent-light transition-colors"
          >
            Σήμερα
          </button>
          <div className="flex gap-1">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {monthTotal > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <CalendarDays className="w-4 h-4" />
          <span>{monthTotal} {monthTotal === 1 ? 'κράτηση' : 'κρατήσεις'} αυτόν τον μήνα</span>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const selected = isSelectedDate(day);
          const today = isToday(day);
          const count = getReservationCount(day);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(new Date(year, month, day))}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium
                transition-all relative
                ${selected
                  ? 'bg-wed-primary text-white shadow-md'
                  : today
                  ? 'bg-wed-accent-lighter text-wed-primary border-2 border-wed-primary'
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <span>{day}</span>
              {count > 0 && (
                <span className={`
                  absolute bottom-1 min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center text-xs font-semibold
                  ${selected ? 'bg-white/30 text-white' : 'bg-wed-primary text-white'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
