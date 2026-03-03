import mongoose from 'mongoose';

const pricingTierSchema = new mongoose.Schema({
    minPeople: { type: Number, required: true },
    maxPeople: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }
});

const inclusiveDetailSchema = new mongoose.Schema({
    included: { type: Boolean, default: false },
    title: { type: String, default: '' },
    details: [{ type: String }]
});

const itineraryDaySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    location: { type: String, default: '' },
    agenda: { type: String, default: '' },
    travelFrom: { type: String, default: '' },
    travelTo: { type: String, default: '' },
    pickupTime: { type: String, default: '' },
    hotelName: { type: String, default: '' },
    activities: [{ type: String }],
    highlights: [{ type: String }]
});

const packageSchema = new mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['trip', 'trek'], default: 'trip' },
    packageType: { type: String, enum: ['individual', 'couple'], required: true },
    packageCategory: { type: String, enum: ['budget', 'premium'], required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },

    // Trek specific fields
    trekName: { type: String, default: '' },
    trekLevel: { type: String, enum: ['easy', 'moderate', 'difficult', ''], default: '' },

    // Pickup & Drop off locations by city
    pickupDropCities: [{
        cityName: { type: String, required: true },
        locations: [{
            name: { type: String, required: true },
            mapLink: { type: String, default: '' }
        }]
    }],

    pricingTiers: [pricingTierSchema],

    inclusives: {
        food: inclusiveDetailSchema,
        transport: inclusiveDetailSchema,
        accommodation: inclusiveDetailSchema,
        guidance: inclusiveDetailSchema,
        pickupDropoff: inclusiveDetailSchema
    },

    activities: [{
        name: { type: String, required: true },
        details: { type: String, required: true }
    }],

    itinerary: [itineraryDaySchema],

    termsAndConditions: [{ type: String }],

    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'active' },

    // Trek photos (optional up to 5)
    photos: [{ type: String }],

    // Stats for the package
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

export const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);
