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
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(new Date(event.date));
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
      priority: event?.priority || 'medium',
    });

    router.back();
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!event) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-gray-400">Event not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        <View className="m-4 bg-gray-800 rounded-lg p-6">
          <Text className="text-2xl font-bold text-white mb-6">
            Edit Event
          </Text>

          {/* Title Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-300 mb-2">
              Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter event title"
              placeholderTextColor="#6B7280"
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
            />
          </View>

          {/* Description Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-300 mb-2">
              Description (optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description"
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white min-h-[80px]"
              textAlignVertical="top"
            />
          </View>

          {/* Date Picker */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-300 mb-2">
              Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3"
            >
              <Text className="text-white">
                {formatDate(date)}
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

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-700 py-4 rounded-lg border border-gray-600"
            >
              <Text className="text-center font-semibold text-gray-300">
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={!title.trim()}
              className={`flex-1 py-4 rounded-lg ${
                title.trim() 
                  ? 'bg-blue-500' 
                  : 'bg-gray-700'
              }`}
            >
              <Text className={`text-center font-semibold ${
                title.trim() ? 'text-white' : 'text-gray-500'
              }`}>
                Update Event
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
