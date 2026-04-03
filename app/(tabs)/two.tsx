import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useEventStore } from '@/src/stores/todo-store';

export default function HistoryScreen() {
  const { pastEvents, isLoading, loadPastEvents } = useEventStore();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPastEvents();
  }, []);

  const handleRefresh = async () => {
    await loadPastEvents();
  };

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressColorText = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
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
            Event History
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            View past events and completion rates
          </Text>
        </View>

        {/* Stats Overview */}
        {pastEvents.length > 0 && (
          <View className="mx-6 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3">
              Overall Statistics
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {pastEvents.length}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Days
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {pastEvents.reduce((acc, day) => acc + day.events.length, 0)}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Total Events
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(
                    pastEvents.reduce((acc, day) => acc + day.completionRate, 0) / 
                    pastEvents.length
                  )}%
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Avg. Complete
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Past Events List */}
        <View className="px-6 pb-6">
          {pastEvents.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-6xl mb-4">📊</Text>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No past events yet
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                Complete some events to see your history
              </Text>
            </View>
          ) : (
            pastEvents.map((day) => {
              const isExpanded = expandedDates.has(day.date);
              const completedCount = day.events.filter(e => e.completed).length;
              
              return (
                <View
                  key={day.date}
                  className="mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
                >
                  {/* Date Header */}
                  <TouchableOpacity
                    onPress={() => toggleDate(day.date)}
                    className="p-4"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(day.date)}
                          {isToday(day.date) && (
                            <Text className="text-blue-500"> (Today)</Text>
                          )}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          {day.events.length} event{day.events.length !== 1 ? 's' : ''} · {completedCount} completed
                        </Text>
                      </View>
                      
                      {/* Completion Rate Badge */}
                      <View className="items-end">
                        <Text className={`text-2xl font-bold ${getProgressColorText(day.completionRate)}`}>
                          {day.completionRate}%
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {isExpanded ? '▲' : '▼'}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${getProgressColor(day.completionRate)}`}
                        style={{ width: `${day.completionRate}%` }}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Events List */}
                  {isExpanded && (
                    <View className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                      {day.events.map((event, index) => (
                        <View
                          key={event.id}
                          className={`flex-row items-start py-2 ${
                            index !== day.events.length - 1 
                              ? 'border-b border-gray-200 dark:border-gray-700' 
                              : ''
                          }`}
                        >
                          {/* Status Icon */}
                          <View className={`w-5 h-5 rounded-full mr-3 items-center justify-center mt-0.5 ${
                            event.completed 
                              ? 'bg-green-500' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            {event.completed && (
                              <Text className="text-white text-xs">✓</Text>
                            )}
                          </View>

                          {/* Event Details */}
                          <View className="flex-1">
                            <Text 
                              className={`font-medium ${
                                event.completed 
                                  ? 'text-gray-500 dark:text-gray-500 line-through' 
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {event.title}
                            </Text>
                            {event.description && (
                              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {event.description}
                              </Text>
                            )}
                            {event.priority && (
                              <View className={`self-start px-2 py-0.5 rounded mt-1 ${
                                event.priority === 'high' 
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : event.priority === 'medium'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                  : 'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                <Text className={`text-xs capitalize ${
                                  event.priority === 'high'
                                    ? 'text-red-700 dark:text-red-300'
                                    : event.priority === 'medium'
                                    ? 'text-yellow-700 dark:text-yellow-300'
                                    : 'text-green-700 dark:text-green-300'
                                }`}>
                                  {event.priority}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

