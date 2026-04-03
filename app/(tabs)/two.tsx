import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useEventStore } from '@/src/stores/todo-store';

export default function HistoryScreen() {
  const { pastEvents, isLoading, loadPastEvents } = useEventStore();

  useEffect(() => {
    loadPastEvents();
  }, []);

  const handleRefresh = async () => {
    await loadPastEvents();
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
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="p-4 pb-2">
          <Text className="text-2xl font-bold text-white mb-1">
            History
          </Text>
          <Text className="text-xs text-gray-400">
            View past events by date
          </Text>
        </View>

        {/* Past Events List */}
        <View className="px-4 pb-6">
          {pastEvents.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-8">
              <Text className="text-gray-500 text-center">
                No past events yet
              </Text>
            </View>
          ) : (
            pastEvents.map((day) => {
              const completedCount = day.events.filter(e => e.completed).length;
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
                        {isToday(day.date) && (
                          <Text className="text-blue-400"> (Today)</Text>
                        )}
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
                    {day.events.map((event, index) => (
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
