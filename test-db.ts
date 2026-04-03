import { eventService } from './src/db/services';

// Test script to verify database setup
async function testDatabase() {
  console.log('Initializing database...');
  await eventService.initialize();
  console.log('✅ Database initialized');

  // Create a test event
  console.log('\nCreating test event...');
  const testEvent = await eventService.create({
    title: 'Test Event',
    description: 'This is a test event',
    date: new Date(),
    priority: 'medium',
  });
  console.log('✅ Test event created:', testEvent);

  // Get today's events
  console.log('\nFetching today\'s events...');
  const todayEvents = await eventService.getTodayEvents();
  console.log('✅ Today\'s events:', todayEvents.length);

  console.log('\n✨ Database setup complete!');
}

testDatabase().catch(console.error);
