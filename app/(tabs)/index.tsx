import { eventService } from '@/src/db/services';
import { useEventStore } from '@/src/stores/todo-store';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TodayScreen() {
  const { todayEvents, isLoading, loadTodayEvents, toggleComplete, deleteEvent } = useEventStore();
  const lastTapRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    // Initialize database and load events
    const init = async () => {
      await eventService.initialize();
      await loadTodayEvents();
    };
    init();
  }, []);

  const handleRefresh = async () => {
    await loadTodayEvents();
  };

  const handleDoubleTap = (eventId: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[eventId] || 0;
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      router.push(`/edit-event?id=${eventId}`);
      lastTapRef.current[eventId] = 0; // Reset
    } else {
      // First tap
      lastTapRef.current[eventId] = now;
    }
  };

  const completedCount = todayEvents.filter(e => e.completed).length;
  const totalCount = todayEvents.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Today's Events
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            💡 Double-tap an event to edit it
          </Text>

          {/* Progress Card */}
          {totalCount > 0 && (
            <View className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-blue-900 dark:text-blue-100 font-semibold">
                  Progress
                </Text>
                <Text className="text-blue-900 dark:text-blue-100 font-bold text-lg">
                  {completionRate}%
                </Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <View 
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </View>
              <Text className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                {completedCount} of {totalCount} events completed
              </Text>
            </View>
          )}
        </View>

        {/* Events List */}
        <View className="px-6 pb-24">
          {todayEvents.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-6xl mb-4">📅</Text>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No events today
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                Tap the + button to create your first event
              </Text>
            </View>
          ) : (
            todayEvents.map((event) => (
              <View
                key={event.id}
                className={`mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-l-4 ${getPriorityColor(event.priority || 'medium')}`}
              >
                <View className="flex-row items-start">
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => toggleComplete(event.id)}
                    className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center mt-0.5 ${
                      event.completed 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-400 dark:border-gray-500'
                    }`}
                  >
                    {event.completed && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </TouchableOpacity>

                  {/* Content - Double-tap to Edit */}
                  <TouchableOpacity 
                    onPress={() => handleDoubleTap(event.id)}
                    className="flex-1"
                    activeOpacity={0.7}
                  >
                    <Text 
                      className={`text-lg font-semibold mb-1 ${
                        event.completed 
                          ? 'text-gray-400 dark:text-gray-600 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {event.title}
                    </Text>
                    {event.description && (
                      <Text className="text-gray-600 dark:text-gray-400 mb-2">
                        {event.description}
                      </Text>
                    )}
                    <View className="flex-row items-center">
                      <View className={`px-2 py-1 rounded ${
                        event.priority === 'high' 
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : event.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <Text className={`text-xs font-semibold capitalize ${
                          event.priority === 'high'
                            ? 'text-red-700 dark:text-red-300'
                            : event.priority === 'medium'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          {event.priority}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => deleteEvent(event.id)}
                    className="ml-2 p-2"
                  >
                    <Text className="text-red-500 text-lg">🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/create-event')}
        className="absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}

