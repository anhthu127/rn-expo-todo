import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useEventStore } from '@/src/stores/todo-store';
import { eventService } from '@/src/db/services';

export default function TodayScreen() {
  const { todayEvents, isLoading, loadTodayEvents, toggleComplete, deleteEvent } = useEventStore();
  const lastTapRef = useRef<{ [key: string]: number }>({});
  const [groupedEvents, setGroupedEvents] = useState<{ [date: string]: any[] }>({});

  useEffect(() => {
    const init = async () => {
      await eventService.initialize();
      await loadTodayEvents();
    };
    init();
  }, []);

  useEffect(() => {
    // Group events by date
    const grouped: { [date: string]: any[] } = {};
    todayEvents.forEach(event => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    setGroupedEvents(grouped);
  }, [todayEvents]);

  const handleRefresh = async () => {
    await loadTodayEvents();
  };

  const handleDoubleTap = (eventId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[eventId] || 0;
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      router.push(`/edit-event?id=${eventId}`);
      lastTapRef.current[eventId] = 0;
    } else {
      lastTapRef.current[eventId] = now;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Page Title */}
        <View className="p-4 pb-2">
          <Text className="text-2xl font-bold text-white">Today's Events</Text>
          <Text className="text-xs text-gray-400 mt-1">
            Double-tap an item to edit
          </Text>
        </View>

        {/* Event Cards by Date */}
        {sortedDates.length === 0 ? (
          <View className="m-4 bg-gray-800 rounded-lg p-8">
            <Text className="text-gray-500 text-center">
              No events today. Tap + to add one.
            </Text>
          </View>
        ) : (
          sortedDates.map(dateKey => {
            const dayEvents = groupedEvents[dateKey];
            return (
              <View key={dateKey} className="m-4 bg-gray-800 rounded-lg p-6">
                <Text className="text-2xl font-bold text-white mb-4">
                  TODO ({formatDate(dateKey)})
                </Text>

                {/* Events List for this date */}
                <View>
                  {dayEvents.map((event, index) => (
                    <TouchableOpacity
                      key={event.id}
                      onPress={() => handleDoubleTap(event.id)}
                      activeOpacity={0.7}
                      className={`flex-row items-start py-2 ${
                        index !== dayEvents.length - 1 ? 'mb-1' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <TouchableOpacity
                        onPress={() => toggleComplete(event.id)}
                        className="mr-3 mt-0.5"
                      >
                        <View className={`w-5 h-5 border-2 rounded ${
                          event.completed 
                            ? 'bg-white border-white' 
                            : 'border-gray-400'
                        } items-center justify-center`}>
                          {event.completed && (
                            <Text className="text-gray-900 text-xs font-bold">✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Content */}
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

                      {/* Delete Button */}
                      <TouchableOpacity
                        onPress={() => deleteEvent(event.id)}
                        className="ml-2 p-1"
                      >
                        <Text className="text-red-400 text-sm">✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/create-event')}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
