// Migration script: Convert Event.description to Event.content
// Run this once with: npx tsx migrate-events.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Your Firebase config (same as in src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDGfa7tr6tp5r0T4k-zrSmkzK62ELZsxB0",
  authDomain: "church-website-b67ea.firebaseapp.com",
  projectId: "church-website-b67ea",
  storageBucket: "church-website-b67ea.firebasestorage.app",
  messagingSenderId: "844075176556",
  appId: "1:844075176556:web:99a1c2af4ff55c96faf09d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface OldEvent {
  id: string;
  name: { vi: string; en: string };
  date: string;
  time: string;
  location: string;
  description?: { vi: string; en: string }; // OLD field
  content?: { vi: string; en: string };     // NEW field
  thumbnail?: string;
  thumbnailPath?: string;
}

async function migrateEvents() {
  console.log('🔄 Starting migration: description → content...\n');

  try {
    // 1. Read current events from Firebase
    const eventsRef = doc(db, 'site-data', 'events');
    const eventsSnap = await getDoc(eventsRef);

    if (!eventsSnap.exists()) {
      console.log('❌ No events document found in Firebase');
      return;
    }

    const data = eventsSnap.data() as { value?: OldEvent[] };
    const events = data?.value || [];

    if (events.length === 0) {
      console.log('✅ No events to migrate');
      return;
    }

    console.log(`📋 Found ${events.length} events\n`);

    // 2. Migrate each event
    let migratedCount = 0;
    let skippedCount = 0;

    const migratedEvents = events.map((event) => {
      // Check if already has content field
      if (event.content && event.content.vi) {
        console.log(`⏭️  Skipped: "${event.name.vi}" - already has content field`);
        skippedCount++;
        return event;
      }

      // Check if has description to migrate
      if (event.description) {
        console.log(`✅ Migrated: "${event.name.vi}" - copied description → content`);
        migratedCount++;
        return {
          ...event,
          content: event.description, // Copy description to content
          // Keep description field for safety (can be removed later)
        };
      }

      console.log(`⚠️  Warning: "${event.name.vi}" - no description or content`);
      return event;
    });

    // 3. Save back to Firebase
    await setDoc(eventsRef, {
      value: migratedEvents,
      updatedAt: new Date()
    });

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration complete!`);
    console.log(`   - Migrated: ${migratedCount} events`);
    console.log(`   - Skipped: ${skippedCount} events (already had content)`);
    console.log(`   - Total: ${events.length} events`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateEvents()
  .then(() => {
    console.log('\n🎉 Done! Your events now use the "content" field.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
