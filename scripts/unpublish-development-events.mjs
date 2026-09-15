import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';

dotenv.config({ path: '.env.local', quiet: true });

// Fixed inventory approved by the owner. Never select future events by date alone.
const eventIds = [
  '69d529dd73599d47fecfb0cc',
  '69d813fd8bd5ed5172502222',
  '69df8e0a7e59ee90b59c0814',
  '69e87d19186ebcba1334782f',
  '6a052869ca27ee297967e0c7',
  '6a3e501739e87eaeae55b9bc',
  '6a4b52c8b6fb0c0667231340',
];
const cutoff = new Date('2026-09-15T08:07:23.132Z');
const batchId = 'unpublish-development-events-2026-09-15';
const apply = process.argv.includes('--apply');
const ids = eventIds.map(id => new mongoose.Types.ObjectId(id));

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const events = db.collection('events');
  const filter = { _id: { $in: ids }, createdAt: { $lte: cutoff } };
  const inventory = await events.find(filter, { projection: { _id: 1, title: 1, status: 1, visibility: 1, createdAt: 1, updatedAt: 1 } }).toArray();
  if (inventory.length !== ids.length) throw new Error('The approved event inventory no longer matches. No events were changed.');

  const bookingProjection = { _id: 1, event: 1, status: 1, updatedAt: 1 };
  const beforeBookings = await db.collection('bookings').find({ event: { $in: ids } }, { projection: bookingProjection }).sort({ _id: 1 }).toArray();
  const beforeOtherEvents = await events.countDocuments({ _id: { $nin: ids } });
  let modifiedCount = 0;

  if (apply) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const current = await events.find(filter, { session, projection: { _id: 1, status: 1, visibility: 1, updatedAt: 1 } }).toArray();
        if (current.length !== ids.length) throw new Error('Inventory changed during cleanup.');
        // A small, durable rollback record stays in the same database. Booking
        // documents, participant details, payments and activity are never written.
        await db.collection('maintenance_changes').updateOne({ _id: batchId }, {
          $setOnInsert: {
            createdAt: new Date(), cutoff,
            reason: 'Owner identified all existing events as development trials; unpublish them while retaining booking history.',
            eventsBefore: current,
            linkedBookings: beforeBookings.length,
          },
        }, { upsert: true, session });
        const result = await events.updateMany({
          ...filter,
          $or: [{ status: { $ne: 'draft' } }, { visibility: { $ne: 'private' } }],
        }, { $set: { status: 'draft', visibility: 'private', updatedAt: new Date() } }, { session });
        modifiedCount = result.modifiedCount;
      });
    } finally {
      await session.endSession();
    }
  }

  const remainingPublishedTrials = await events.countDocuments({ _id: { $in: ids }, status: { $in: ['published', 'completed', 'cancelled'] } });
  const afterBookings = await db.collection('bookings').find({ event: { $in: ids } }, { projection: bookingProjection }).sort({ _id: 1 }).toArray();
  const report = {
    batchId, applied: apply, verifiedAt: new Date().toISOString(), cutoff: cutoff.toISOString(),
    approvedEvents: eventIds.length, modifiedCount, remainingPublishedTrials,
    eventIds, linkedBookingsBefore: beforeBookings.length, linkedBookingsAfter: afterBookings.length,
    bookingHistoryUnchanged: JSON.stringify(beforeBookings) === JSON.stringify(afterBookings),
    otherEventsBefore: beforeOtherEvents, otherEventsAfter: await events.countDocuments({ _id: { $nin: ids } }),
    recoveryRecord: apply ? 'maintenance_changes/' + batchId : null,
    events: inventory.map(({ _id, title, status, visibility }) => ({ id: String(_id), title, statusBefore: status, visibilityBefore: visibility ?? '(default public)' })),
  };
  console.log(JSON.stringify(report, null, 2));
  if (apply) {
    await fs.mkdir('docs/seo', { recursive: true });
    await fs.writeFile('docs/seo/development-events-cleanup.json', JSON.stringify(report, null, 2) + '\n');
    if (remainingPublishedTrials !== 0 || !report.bookingHistoryUnchanged) process.exitCode = 1;
  }
} catch (error) {
  // Do not print connection strings or driver request details.
  console.error('Development event cleanup failed:', error.name);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
