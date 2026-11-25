export function getEventSlotsLabel(event) {
    if (event.showTotalSlots === true) return `${event.totalSlots} total slots`;

    const slotsLeft = event.slotsLeft ?? event.slotsRemaining;
    return slotsLeft > 0 ? `${slotsLeft} slots available` : 'Sold out';
}
