const fetch = require('node-fetch');

async function testBooking() {
    try {
        const res = await fetch('http://localhost:3000/api/user/trip-bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                packageId: '60d5ecb8b392d7001f3e9a74', // fake
                guideId: '60d5ecb8b392d7001f3e9a75', // fake
                startDate: new Date().toISOString(),
                numPeople: 2,
                category: 'couple',
                baseAmount: 1000,
                discount: 0,
                platformFee: 50,
                taxes: 0,
                totalAmount: 1050,
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (err) {
        console.error("Test error:", err);
    }
}

testBooking();
