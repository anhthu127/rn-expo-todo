import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useEventStore } from '@/src/stores/todo-store';
import { eventService } from '@/src/db/services';

type ViewMode = 'week' | 'month';

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [viewMode, selectedDate]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'week') {
        const weekEvents = await getWeekEvents(selectedDate);
        setEvents(weekEvents);
      } else {
        const monthEvents = await getMonthEvents(selectedDate);
        setEvents(monthEvents);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
    setIsLoading(false);
  };

  const getWeekEvents = async (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Start on Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekEvents = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dayEvents = await eventService.getEventsByDate(currentDay);
      if (dayEvents.length > 0) {
        const completedCount = dayEvents.filter(e => e.completed).length;
        weekEvents.push({
          date: currentDay.toISOString().split('T')[0],
          events: dayEvents,
          completionRate: Math.round((completedCount / dayEvents.length) * 100),
        });
      }
    }
    return weekEvents;
  };

  const getMonthEvents = async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const monthEvents = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const currentDay = new Date(d);
      const dayEvents = await eventService.getEventsByDate(currentDay);
      if (dayEvents.length > 0) {
        const completedCount = dayEvents.filter(e => e.completed).length;
        monthEvents.push({
          date: currentDay.toISOString().split('T')[0],
          events: dayEvents,
          completionRate: Math.round((completedCount / dayEvents.length) * 100),
        });
      }
    }
    return monthEvents;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const formatDateHeader = () => {
    if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadEvents} />
        }
      >
        {/* Header */}
        <View className="p-4">
          <Text className="text-2xl font-bold text-white mb-4">
            Calendar
          </Text>

          {/* View Mode Toggle */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setViewMode('week')}
              className={`flex-1 py-3 rounded-lg ${
                viewMode === 'week' ? 'bg-blue-500' : 'bg-gray-800'
              }`}
            >
              <Text className={`text-center font-semibold ${
                viewMode === 'week' ? 'text-white' : 'text-gray-400'
              }`}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('month')}
              className={`flex-1 py-3 rounded-lg ${
                viewMode === 'month' ? 'bg-blue-500' : 'bg-gray-800'
              }`}
            >
              <Text className={`text-center font-semibold ${
                viewMode === 'month' ? 'text-white' : 'text-gray-400'
              }`}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Navigation */}
          <View className="flex-row items-center justify-between bg-gray-800 rounded-lg p-4 mb-4">
            <TouchableOpacity
              onPress={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
              className="p-2"
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            
            <Text className="text-white font-semibold">
              {formatDateHeader()}
            </Text>
            
            <TouchableOpacity
              onPress={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
              className="p-2"
            >
              <Text className="text-white text-xl">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Events List */}
        <View className="px-4 pb-6">
          {events.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8">
              <Text className="text-gray-500 text-center">
                No events in this {viewMode}
              </Text>
            </View>
          ) : (
            events.map((day) => {
              const completedCount = day.events.filter((e: any) => e.completed).length;
              const totalCount = day.events.length;
              
              return (
                <View
                  key={day.date}
                  className="mb-4 bg-gray-800 rounded-lg p-6"
                >
                  {/* Date Header */}
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-xl font-bold text-white">
                        TODO ({formatDate(day.date)})
                      </Text>
                      <Text className={`text-sm font-semibold ${
                        day.completionRate >= 80 
                          ? 'text-green-400'
                          : day.completionRate >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {day.completionRate}%
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">
                      {formatDateLong(day.date)} · {completedCount}/{totalCount} completed
                    </Text>
                  </View>

                  {/* Events List */}
                  <View>
                    {day.events.map((event: any, index: number) => (
                      <View
                        key={event.id}
                        className={`flex-row items-start py-2 ${
                          index !== day.events.length - 1 ? 'mb-1' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <View className="mr-3 mt-0.5">
                          <View className={`w-5 h-5 border-2 rounded ${
                            event.completed 
                              ? 'bg-white border-white' 
                              : 'border-gray-400'
                          } items-center justify-center`}>
                            {event.completed && (
                              <Text className="text-gray-900 text-xs font-bold">✓</Text>
                            )}
                          </View>
                        </View>

                        {/* Event Details */}
                        <View className="flex-1">
                          <Text 
                            className={`text-base leading-6 ${
                              event.completed 
                                ? 'text-gray-500 line-through' 
                                : 'text-white'
                            }`}
                          >
                            {event.title}
                          </Text>
                          {event.description && (
                            <Text className={`text-sm mt-0.5 ${
                              event.completed 
                                ? 'text-gray-600' 
                                : 'text-gray-400'
                            }`}>
                              {event.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
