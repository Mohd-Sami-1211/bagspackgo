import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { getEventCustomFormFields, getEventParticipantFields } from '../src/lib/eventForm.js';
import { getEventSlotsLabel, getPublicEventSlots } from '../src/lib/eventSlots.js';

const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '@/lib/eventForm') {
            return { url: new URL('../src/lib/eventForm.js', import.meta.url).href, shortCircuit: true };
        }
        if (specifier.startsWith('@/models/')) {
            return { url: 'data:text/javascript,export const Booking = {}, Event = {}, User = {};', shortCircuit: true };
        }
        if (specifier === '@/lib/otp-service') {
            return { url: 'data:text/javascript,export const sendEventBookingConfirmation = null, sendEventRefundInitiated = null;', shortCircuit: true };
        }
        return nextResolve(specifier, context);
    },
});
const { calculateEventBookingQuote, normalizeEventParticipant } = await import('../src/lib/eventBooking.js');
hooks.deregister();

test('previous events still require all eight fields, while an empty selection accepts unnamed participants', () => {
    const participant = { idNumber: 'ABC', age: 300, idProofImage: 'invalid' };
    assert.equal(getEventParticipantFields().length, 8);
    assert.deepEqual(getEventParticipantFields([]), []);
    assert.throws(() => normalizeEventParticipant(participant, undefined, 0), /incomplete or invalid/);
    const anonymous = normalizeEventParticipant(participant, [], 0);
    assert.equal(anonymous.name, undefined);
    assert.equal(anonymous.idNumber, undefined);
    assert.equal(anonymous.idProofUrl, undefined);
    assert.equal(anonymous.age, undefined);
});

test('ID number and ID image can each be required independently of ID type', () => {
    const proof = 'data:image/jpeg;base64,AAAA';
    assert.equal(normalizeEventParticipant({ idNumber: 'ABC' }, ['idNumber'], 0).idNumber, 'ABC');
    assert.equal(normalizeEventParticipant({ idProofImage: proof }, ['idProofImage'], 0).idProofUrl, proof);
    assert.throws(() => normalizeEventParticipant({}, ['idNumber'], 1), /Participant 2/);
    assert.throws(() => normalizeEventParticipant({ idProofImage: 'invalid' }, ['idProofImage'], 0), /invalid format/);
});

test('unchecked fields and their dependents are omitted, while enabled choices still enforce required answers and charges', () => {
    const event = {
        pricePerSlot: 100,
        applicationFormType: 'customized',
        customFormFields: [
            { id: 'meal', title: 'Meal', type: 'dropdown', options: [{ value: 'Lunch', extraCharge: 15 }], required: true },
            { id: 'shirt', title: 'Shirt', type: 'dropdown', options: [{ value: 'Yes', extraCharge: 50 }], required: true, enabled: false },
            { id: 'size', title: 'Shirt size', required: true, dependsOn: 'shirt', showIfValue: 'Yes' },
        ],
    };
    assert.deepEqual(getEventCustomFormFields(event).map(field => field.id), ['meal']);
    assert.throws(() => calculateEventBookingQuote(event, 1), /Meal is required/);
    assert.throws(() => calculateEventBookingQuote(event, 1, [{ fieldId: 'shirt', slotIndex: 0, value: 'Yes' }]), /invalid response/);
    const quote = calculateEventBookingQuote(event, 1, [{ fieldId: 'meal', slotIndex: 0, value: 'Lunch' }]);
    assert.equal(quote.extraChargesTotal, 15);
    assert.deepEqual(quote.customFormResponses.map(response => response.fieldId), ['meal']);
});

test('public slot labels show the remaining count only when enabled and always show Sold out', () => {
    const event = { totalSlots: 20, bookedSlots: 12, reservedSlots: 2 };
    const hidden = getPublicEventSlots({ ...event, showAvailableSlots: false, showTotalSlots: true });
    assert.deepEqual(hidden, { isSoldOut: false, showAvailableSlots: false });
    assert.equal(getEventSlotsLabel(hidden), null);
    assert.equal(getEventSlotsLabel(getPublicEventSlots({ ...event, showAvailableSlots: true })), '6 slots available');
    assert.equal(getEventSlotsLabel(getPublicEventSlots({ ...event, showTotalSlots: true })), '6 slots available');
    for (const showAvailableSlots of [true, false]) {
        assert.equal(getEventSlotsLabel(getPublicEventSlots({ ...event, bookedSlots: 18, showAvailableSlots })), 'Sold out');
    }
});
