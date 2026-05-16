require('dotenv').config({path: '.env.local'});
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EXTRACTION_PROMPT = `You are an expert travel-package analyst. Your job is to deeply read and analyze the content of a travel or trek package (from a PDF or web page) and extract highly detailed, STRUCTURED data that maps perfectly into a package-creation form.

IMPORTANT RULES:
1. DEEP EXTRACTION: Do not just extract an overview. You MUST thoroughly extract all Inclusions, Exclusions, Additional Points, and Terms & Conditions. Look for bullet points, fine print, and embedded lists.
2. DETAILED ITINERARY: For EVERY single day mentioned, you must extract:
   - What the travelers are doing (agenda: arrival, travel-day, exploration, or checkout).
   - Where they are travelling from and to.
   - All the highlights and specific activities of the day.
   - Which hotel they are staying at and its star rating (if mentioned).
3. REFACTORING & MOLDING: You must refactor and polish the extracted text. Keep the meaning exactly the same, but rewrite it to be highly professional, engaging, and perfectly sized for a modern UI. For lists (inclusions/exclusions/highlights), keep items concise (10-20 words max per item). For "aboutPackage", write a compelling, well-structured paragraph.
4. NO FABRICATION: Do not invent missing information. If a specific field (like a hotel name or pickup time) is completely absent, use an empty string "" or [].
5. CATEGORIZATION: For "category", determine "trip" or "trek". For "destination", map exactly to: "kashmir", "ladakh", "bhaderwah", "warwan-marwah-valley", "uttarakhand", "goa", "himachal", "rajasthan", "kerala", "sikkim", "andaman", "arunachal", "meghalaya", "assam", "madhya", "tamilnadu", "maharashtra" (pick the closest).
6. PRICING: Extract all pricing tiers with people ranges and per-person prices.

Return a valid JSON object with this EXACT structure:
{
  "category": "trip" or "trek",
  "packageInfo": {
    "name": "Package Name",
    "packageType": "individual" or "couple",
    "packageCategory": "premium" or "budget",
    "destination": "one of the valid destination values",
    "days": number,
    "trekName": "name of trek (trek only)",
    "trekLevel": "easy" or "moderate" or "difficult" (trek only)
  },
  "aboutPackage": "Detailed compelling description of the package, beautifully rewritten...",
  "pricingTiers": [
    { "minPeople": 1, "maxPeople": 2, "price": number, "discount": 0 }
  ],
  "pickupDropCities": [
    {
      "cityName": "City Name",
      "locations": [
        { "name": "Specific Location Name (e.g. Airport/Station)", "mapLink": "" }
      ]
    }
  ],
  "inclusivesList": ["Refactored detailed inclusion 1", "Refactored detailed inclusion 2"],
  "exclusivesList": ["Refactored detailed exclusion 1", "Refactored detailed exclusion 2"],
  "additionalPoints": ["Refactored additional point 1"],
  "termsAndConditions": ["Refactored term 1"],
  "itinerary": [
    {
      "day": 1,
      "location": "Place Name",
      "agenda": "arrival" or "travel-day" or "exploration" or "checkout",
      "travelFrom": "origin (if travelling)",
      "travelTo": "destination (if travelling)",
      "pickupTime": "e.g. 09:00 AM",
      "checkinTime": "e.g. 02:00 PM",
      "hotelName": "Name of Hotel",
      "hotelStars": "3",
      "activities": ["Refactored activity description"],
      "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"]
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no extra text. Just the raw JSON.`;

const contentText = `
KASHMIR PARADISE TRIP (5 DAYS)
Welcome to the paradise on earth! This 5-day package covers the best of Kashmir.

Overview:
Experience the breathtaking beauty of Kashmir with our exclusive 5-day premium couple package.

Pricing:
2 people: 15,000 INR per person

Inclusions:
- Welcome drink on arrival
- 4 nights accommodation in 3-star hotels
- Daily breakfast and dinner
- Shikara ride on Dal Lake
- All transportation by private AC cab

Exclusions:
- Airfare / Train fare
- Lunch and personal expenses
- Entry fees to gardens and monuments
- Guide fees
- Anything not mentioned in inclusions

Additional Points:
- Please carry valid ID proofs.
- Woolen clothes are recommended.

Terms & Conditions:
- 50% advance for booking.
- Cancellation within 7 days is non-refundable.

Itinerary:
Day 1: Arrival in Srinagar
Arrive at Srinagar airport. Pick up and transfer to the hotel. Later, enjoy a 1-hour Shikara ride on Dal Lake. Overnight stay at Hotel Srinagar Paradise (3 Star).

Day 2: Srinagar to Gulmarg
After breakfast, drive from Srinagar to Gulmarg. Explore the meadow of flowers and take the Gondola ride. Return to Srinagar for overnight stay.

Day 3: Srinagar to Pahalgam
Drive from Srinagar to Pahalgam. En route visit saffron fields and Awantipora ruins. Explore Pahalgam valley. Stay at Pahalgam Resort (3 Star).

Day 4: Pahalgam to Srinagar
Return to Srinagar. Visit Mughal Gardens (Nishat, Shalimar). Overnight stay at Srinagar houseboat.

Day 5: Departure
After breakfast, check out and drop at Srinagar Airport for onward journey.
`;

async function test() {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    `\n\nHere is the package content to analyze:\n\n${contentText}`
  ]);

  console.log(result.response.text());
}
test().catch(console.error);
