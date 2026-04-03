// src/stores/todo-store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { eventService } from '../db/services';
import type { Event, NewEvent } from '../db/schema';

interface EventStore {
  events: Event[];
  todayEvents: Event[];
  pastEvents: Array<{ date: string; events: Event[]; completionRate: number }>;
  isLoading: boolean;
  
  // Actions
  loadTodayEvents: () => Promise<void>;
  loadPastEvents: () => Promise<void>;
  createEvent: (event: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => Promise<void>;
  updateEvent: (id: string, data: Partial<Omit<Event, 'id' | 'createdAt'>>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useEventStore = create<EventStore>()((set, get) => ({
  events: [],
  todayEvents: [],
  pastEvents: [],
  isLoading: false,

  loadTodayEvents: async () => {
    set({ isLoading: true });
    try {
      const todayEvents = await eventService.getTodayEvents();
      set({ todayEvents, isLoading: false });
    } catch (error) {
      console.error('Failed to load today events:', error);
      set({ isLoading: false });
    }
  },

  loadPastEvents: async () => {
    set({ isLoading: true });
    try {
      const pastEvents = await eventService.getPastEvents();
      set({ pastEvents, isLoading: false });
    } catch (error) {
      console.error('Failed to load past events:', error);
      set({ isLoading: false });
    }
  },

  createEvent: async (event) => {
    try {
      await eventService.create(event);
      await get().refreshAll();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  },

  updateEvent: async (id, data) => {
    try {
      await eventService.update(id, data);
      await get().refreshAll();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  },

  toggleComplete: async (id) => {
    try {
      await eventService.toggleComplete(id);
      await get().refreshAll();
    } catch (error) {
      console.error('Failed to toggle event:', error);
    }
  },

  deleteEvent: async (id) => {
    try {
      await eventService.delete(id);
      await get().refreshAll();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().loadTodayEvents(),
      get().loadPastEvents(),
    ]);
  },
}));