import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEventStore } from '@/src/stores/todo-store';

export default function EditEventScreen() {
  const params = useLocalSearchParams();
  const eventId = params.id as string;
  
  const { todayEvents, pastEvents, updateEvent } = useEventStore();
  
  // Find event in either todayEvents or pastEvents
  let event = todayEvents.find(e => e.id === eventId);
  if (!event) {
    // Search in past events
    for (const day of pastEvents) {
      const found = day.events.find(e => e.id === eventId);
      if (found) {
        event = found;
        break;
      }
    }
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(new Date(event.date));
      setPriority(event.priority || 'medium');
    }
  }, [event]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    await updateEvent(eventId, {
      title: title.trim(),
      description: description.trim() || null,
      date,
      priority,
    });

    router.back();
  };

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  if (!event) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-600 dark:text-gray-400">Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Event
        </Text>

        {/* Title Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
          />
        </View>

        {/* Description Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        {/* Date Picker */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3"
          >
            <Text className="text-gray-900 dark:text-white">
              {date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Priority Selector */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </Text>
          <View className="flex-row gap-3">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                className={`flex-1 py-3 rounded-lg ${
                  priority === p 
                    ? priorityColors[p]
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={`text-center font-semibold capitalize ${
                  priority === p ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-lg"
          >
            <Text className="text-center font-semibold text-gray-700 dark:text-gray-300">
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={!title.trim()}
            className={`flex-1 py-4 rounded-lg ${
              title.trim() 
                ? 'bg-blue-500' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <Text className="text-center font-semibold text-white">
              Update Event
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
