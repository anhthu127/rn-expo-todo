import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { db } from './client';
import { events, type Event, type NewEvent } from './schema';

// Helper to get start and end of a day
const getDateRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

export const eventService = {
  // Create a new event
  async create(event: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newEvent: NewEvent = {
      ...event,
      id,
      createdAt: now,
      updatedAt: now,
      completed: false,
    };

    await db.insert(events).values(newEvent);
    return { ...newEvent, completed: false } as Event;
  },

  // Get all events for a specific day
  async getEventsByDate(date: Date): Promise<Event[]> {
    const { start, end } = getDateRange(date);
    
    const results = await db
      .select()
      .from(events)
      .where(
        and(
          gte(events.date, start),
          lte(events.date, end)
        )
      )
      .orderBy(events.createdAt);
    
    return results;
  },

  // Get today's events
  async getTodayEvents(): Promise<Event[]> {
    return this.getEventsByDate(new Date());
  },

  // Get events grouped by date for past days
  async getPastEvents(): Promise<Array<{ date: string; events: Event[]; completionRate: number }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all events before today
    const pastEvents = await db
      .select()
      .from(events)
      .where(lte(events.date, today))
      .orderBy(sql`${events.date} DESC`);

    // Group by date
    const groupedByDate = new Map<string, Event[]>();
    
    for (const event of pastEvents) {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(event);
    }

    // Calculate completion rate for each day
    const result = Array.from(groupedByDate.entries()).map(([date, dayEvents]) => {
      const completed = dayEvents.filter(e => e.completed).length;
      const total = dayEvents.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        date,
        events: dayEvents,
        completionRate: Math.round(completionRate),
      };
    });

    return result;
  },

  // Toggle event completion
  async toggleComplete(id: string): Promise<Event | undefined> {
    const event = await db.select().from(events).where(eq(events.id, id)).get();
    
    if (!event) return undefined;

    const updated = await db
      .update(events)
      .set({ 
        completed: !event.completed,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning()
      .get();

    return updated;
  },

  // Update event
  async update(id: string, data: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event | undefined> {
    const updated = await db
      .update(events)
      .set({ 
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning()
      .get();

    return updated;
  },

  // Delete event
  async delete(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  },

  // Initialize database (create tables if needed)
  async initialize(): Promise<void> {
    // Run migrations or create tables
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0 NOT NULL,
        date INTEGER NOT NULL,
        priority TEXT DEFAULT 'medium',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  },
};
