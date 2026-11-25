import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const fixture = {
    bookings: new Map(),
    notifications: [],
    reset(event) {
        this.bookings.clear();
        this.notifications.length = 0;
        this.event = { _id: 'event', totalSlots: 2, bookedSlots: 0, reservedSlots: 0, pricePerSlot: 0, participantFields: [], ...event };
        this.beforeClaim = null;
    },
};

globalThis.__freeEventBookingTest = {
    async startSession() {
        return {
            async withTransaction(callback) {
                this.bookings = new Map(fixture.bookings);
                this.slotChanges = {};
                await callback();
                fixture.bookings = this.bookings;
                Object.assign(fixture.event, this.slotChanges);
            },
            async endSession() {},
        };
    },
    Booking: {
        findOne({ user, checkoutKey }) {
            return { lean: async () => fixture.bookings.get(`${user}:${checkoutKey}`) };
        },
        async create([booking], { session }) {
            const key = `${booking.user}:${booking.checkoutKey}`;
            assert.ok(session);
            if (session.bookings.has(key)) throw Object.assign(new Error('Duplicate checkout'), { code: 11000 });
            const created = { ...booking, _id: `booking-${session.bookings.size + 1}` };
            session.bookings.set(key, created);
            return [created];
        },
    },
    Event: {
        findOne() {
            return { select: async () => ({ ...fixture.event }) };
        },
        async findOneAndUpdate(filter, { $inc }, { session }) {
            assert.ok(session);
            assert.equal(filter.status, 'published');
            fixture.beforeClaim?.();
            const [sum, total] = filter.$expr.$lte;
            const slots = Object.values($inc)[0];
            assert.deepEqual(sum.$add, [
                { $ifNull: ['$bookedSlots', 0] },
                { $ifNull: ['$reservedSlots', 0] },
                slots,
            ]);
            assert.equal(total, '$totalSlots');
            if (fixture.event.bookedSlots + fixture.event.reservedSlots + slots > fixture.event.totalSlots) return null;
            for (const [field, count] of Object.entries($inc)) session.slotChanges[field] = fixture.event[field] + count;
            return fixture.event;
        },
    },
    after: callback => fixture.notifications.push(callback),
};

const stubs = {
    'next/server': 'export const NextResponse = Response, after = globalThis.__freeEventBookingTest.after;',
    mongoose: 'export default globalThis.__freeEventBookingTest;',
    '@/lib/db': 'export default async function dbConnect() {}',
    '@/lib/auth': 'export const getCurrentUser = async () => ({ role: "user", userId: "guest" });',
    '@/models/booking.model': 'export const Booking = globalThis.__freeEventBookingTest.Booking;',
    '@/models/event.model': 'export const Event = globalThis.__freeEventBookingTest.Event;',
    '@/models/user.model': 'export const User = {};',
    '@/models/guidedetails.model': 'export const GuideDetails = { exists: async () => false };',
    '@/lib/otp-service': 'export const sendEventBookingConfirmation = null, sendEventRefundInitiated = null;',
};
const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (stubs[specifier]) {
            return { url: `data:text/javascript,${encodeURIComponent(stubs[specifier])}`, shortCircuit: true };
        }
        if (specifier === '@/lib/eventForm' || specifier === '@/lib/eventBooking') {
            const name = specifier.split('/').at(-1);
            return { url: new URL(`../src/lib/${name}.js`, import.meta.url).href, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    },
});
const { POST } = await import('../src/app/api/user/bookings/route.js');
hooks.deregister();

function book(body = {}) {
    return POST(new Request('http://localhost/api/user/bookings', {
        method: 'POST',
        body: JSON.stringify({
            event: 'event',
            slots: 1,
            checkoutKey: 'free-checkout-001',
            contactDetails: { email: 'guest@example.test', phone: '1234567890' },
            participants: [{}],
            ...body,
        }),
    }));
}

test('a zero-total booking confirms the last available slot and reusing its checkout key books it only once', async () => {
    fixture.reset({ reservedSlots: 1 });

    const first = await book();
    assert.equal(first.status, 201);
    const booking = await first.json();
    assert.equal(booking.status, 'confirmed');
    assert.equal(booking.amountPaid, 0);
    assert.equal(booking.expiresAt, null);
    const stored = [...fixture.bookings.values()][0];
    assert.equal(stored.paymentId, 'free_event');
    assert.equal(stored.slotsReserved, false);
    assert.ok(stored.confirmedAt instanceof Date);
    assert.ok(stored.participants[0].passCode);
    assert.equal(fixture.event.bookedSlots, 1);
    assert.equal(fixture.event.reservedSlots, 1);

    const replay = await book();
    assert.equal(replay.status, 200);
    assert.equal((await replay.json()).bookingId, booking.bookingId);
    assert.equal(fixture.bookings.size, 1);
    assert.equal(fixture.event.bookedSlots, 1);
});

test('held seats count toward capacity and a lost race for the final slot rolls back the booking', async () => {
    fixture.reset({ totalSlots: 1, reservedSlots: 1 });
    const alreadyHeld = await book();
    assert.equal(alreadyHeld.status, 409);
    assert.equal(fixture.bookings.size, 0);

    fixture.reset({ totalSlots: 1 });
    fixture.beforeClaim = () => { fixture.event.bookedSlots = 1; };
    const lostRace = await book();
    assert.equal(lostRace.status, 409);
    assert.equal(fixture.bookings.size, 0);
    assert.equal(fixture.event.bookedSlots, 1);
    assert.equal(fixture.notifications.length, 0);
});

test('a group must fit in the remaining capacity before any of its slots are booked', async () => {
    fixture.reset({ totalSlots: 3, bookedSlots: 1 });
    const tooLarge = await book({ slots: 3, participants: [{}, {}, {}] });
    assert.equal(tooLarge.status, 409);
    assert.equal(fixture.event.bookedSlots, 1);
    assert.equal(fixture.bookings.size, 0);

    const fits = await book({ slots: 2, participants: [{}, {}] });
    assert.equal(fits.status, 201);
    assert.equal((await fits.json()).status, 'confirmed');
    assert.equal(fixture.event.bookedSlots, 3);
    assert.equal([...fixture.bookings.values()][0].participants.length, 2);
});

test('a paid add-on on a zero-price event creates a pending payment hold', async () => {
    fixture.reset({
        applicationFormType: 'customized',
        customFormFields: [{ id: 'meal', title: 'Meal', type: 'dropdown', options: [{ value: 'Lunch', extraCharge: 50 }] }],
    });
    const response = await book({ customFormResponses: [{ slotIndex: 0, fieldId: 'meal', value: 'Lunch' }] });
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.status, 'pending');
    assert.ok(result.amountPaid > 0);
    assert.ok(result.expiresAt);
    assert.equal(fixture.event.bookedSlots, 0);
    assert.equal(fixture.event.reservedSlots, 1);
    assert.equal(fixture.notifications.length, 0);
});
