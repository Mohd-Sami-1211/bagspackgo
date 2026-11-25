export const MAX_EVENT_SLOTS_PER_BOOKING = 20;

export function getAvailableEventSlots(event) {
    return Math.max(0, Number(event.totalSlots || 0) - Number(event.bookedSlots || 0) - Number(event.reservedSlots || 0));
}

export function shouldShowAvailableSlots(event) {
    return (event.showAvailableSlots ?? event.showTotalSlots) === true;
}

export function getPublicEventSlots(event) {
    const slotsLeft = getAvailableEventSlots(event);
    const showAvailableSlots = shouldShowAvailableSlots(event);
    return {
        showAvailableSlots,
        isSoldOut: slotsLeft === 0,
        ...(showAvailableSlots && { slotsLeft }),
    };
}

export function isEventSoldOut(event) {
    return event.isSoldOut ?? (event.slotsLeft <= 0);
}

export function getEventSlotsLabel(event) {
    if (isEventSoldOut(event)) return 'Sold out';
    if (!shouldShowAvailableSlots(event) || !Number.isFinite(event.slotsLeft)) return null;

    return `${event.slotsLeft} ${event.slotsLeft === 1 ? 'slot' : 'slots'} available`;
}

export function getEventSlotShortageMessage(event, availableSlots) {
    if (availableSlots <= 0) return 'This event is sold out.';
    if (!shouldShowAvailableSlots(event)) return 'There aren’t enough slots for this booking. Try a smaller group.';

    return `Only ${availableSlots} ${availableSlots === 1 ? 'slot is' : 'slots are'} available.`;
}
