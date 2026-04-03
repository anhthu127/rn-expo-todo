import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEventStore } from '@/src/stores/todo-store';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const createEvent = useEventStore(state => state.createEvent);

  const handleCreate = async () => {
    if (!title.trim()) {
      return;
    }

    await createEvent({
      title: title.trim(),
      description: description.trim() || null,
      date,
      priority: 'medium',
    });

    router.back();
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        <View className="m-4 bg-gray-800 rounded-lg p-6">
          <Text className="text-2xl font-bold text-white mb-6">
            Add New Event
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
              onPress={handleCreate}
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
                Add Event
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
