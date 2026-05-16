import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* ─── System prompt for structured extraction ──────────── */
const EXTRACTION_PROMPT = `You are an expert travel-package AI assistant. Your job is to deeply analyze the content of a travel or trek package (from a PDF or web page) and extract data to perfectly fill out our platform's package-creation form.

FIRSTLY, UNDERSTAND OUR CORE STRUCTURE:
1. OVERVIEW SECTION: This is the "aboutPackage" field. You must write a comprehensive overview of the whole package here, keeping the meaning intact but making it highly professional and engaging.
2. ABOUT PACKAGE SECTION: This maps to the "packageInfo" object. Here you must fill in the package name, destination, how many days, category (trip/trek), packageType (individual/couple), and packageCategory (premium/budget).
3. INCLUSIONS & EXCLUSIONS & ADDITIONAL POINTS: You must analyze what things are mentioned under inclusions, exclusions, and additional points. Extract all three of them, grammatically correct them, and format them perfectly to meet word limits (short, punchy bullet points).
4. ITINERARY SECTION: This is the most important section. For EACH day, you must analyze what is happening and fill out the structure:
   - "location": Which destination-centric location is the day focused on?
   - "agenda": What is the agenda of the day? (Must be "arrival", "checkin", "travel-day", "exploration", or "checkout").
   - "travelFrom" and "travelTo": If it's a travel day, from which major destination to which major destination are we traveling?
   - "isDayTrip": If the night is at the same location from where we started (e.g. a round trip in one day), set this to true.
   - "hotelName" and "hotelStars": What's the hotel for the night?
   - "highlights": Analyze highlights mentioned in the package, extract them, grammatically correct them, and refactor them so they meet the word limit criteria (very short, 5-15 words max per highlight, max 5 highlights).

Return a valid JSON object with this EXACT structure:
{
  "category": "trip" or "trek",
  "packageInfo": {
    "name": "Package Name",
    "packageType": "individual" or "couple",
    "packageCategory": "premium" or "budget",
    "destination": "one of the valid destination values (e.g. kashmir, ladakh, etc.)",
    "days": number,
    "trekName": "name of trek (trek only)",
    "trekLevel": "easy" or "moderate" or "difficult" (trek only)
  },
  "aboutPackage": "Comprehensive overview of the whole package...",
  "pricingTiers": [
    { "minPeople": 1, "maxPeople": 2, "price": number, "discount": 0 }
  ],
  "pickupDropCities": [
    {
      "cityName": "City Name",
      "locations": [
        { "name": "Specific Location Name", "mapLink": "" }
      ]
    }
  ],
  "inclusivesList": ["Grammatically corrected inclusion 1", "Inclusion 2"],
  "exclusivesList": ["Grammatically corrected exclusion 1", "Exclusion 2"],
  "additionalPoints": ["Grammatically corrected additional point 1"],
  "termsAndConditions": ["Grammatically corrected term 1"],
  "itinerary": [
    {
      "day": 1,
      "location": "Destination-centric location",
      "agenda": "arrival" or "travel-day" or "exploration" or "checkout",
      "travelFrom": "Major destination origin (if travel day)",
      "travelTo": "Major destination arrival (if travel day)",
      "isDayTrip": boolean,
      "pickupTime": "",
      "checkinTime": "",
      "hotelName": "Hotel Name",
      "hotelStars": "3",
      "activities": ["Detailed description of what is happening on the day"],
      "highlights": ["Short refactored highlight 1", "Highlight 2", "Highlight 3"]
    }
  ]
}

IMPORTANT: Do not invent missing information. If a field is missing, use an empty string "" or []. Return ONLY the JSON object.`;

/* ─── Helper: Extract text from URL ────────────────────── */
async function extractTextFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/pdf')) {
      // If URL points to a PDF, get its buffer and parse
      const buffer = await response.arrayBuffer();
      const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(Buffer.from(buffer));
      return pdfData.text;
    }

    // Otherwise treat as HTML
    const html = await response.text();
    // Basic HTML-to-text conversion
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  } catch (err) {
    throw new Error(`Could not read the URL: ${err.message}`);
  }
}

/* ─── POST handler ─────────────────────────────────────── */
export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== 'provider' && user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const formData = await req.formData();
    const importType = formData.get('importType'); // 'pdf' or 'url'
    let contentText = '';

    if (importType === 'pdf') {
      const file = formData.get('file');
      if (!file) {
        return NextResponse.json(
          { success: false, message: 'No PDF file provided' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!file.type.includes('pdf')) {
        return NextResponse.json(
          { success: false, message: 'Only PDF files are accepted' },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'File size must be under 10MB' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(buffer);
      contentText = pdfData.text;

    } else if (importType === 'url') {
      const url = formData.get('url');
      if (!url) {
        return NextResponse.json(
          { success: false, message: 'No URL provided' },
          { status: 400 }
        );
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Invalid URL format' },
          { status: 400 }
        );
      }

      contentText = await extractTextFromUrl(url);

    } else if (importType === 'text') {
      const text = formData.get('text');
      if (!text || text.trim().length < 50) {
        return NextResponse.json(
          { success: false, message: 'Please provide at least 50 characters of package content' },
          { status: 400 }
        );
      }
      contentText = text.trim().slice(0, 30000);

    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid import type. Use "pdf", "url", or "text".' },
        { status: 400 }
      );
    }

    if (!contentText || contentText.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: 'Could not extract enough text content from the source. Please try a different file or URL.' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      `\n\nHere is the package content to analyze:\n\n${contentText}`
    ]);

    const responseText = result.response.text();

    // Parse the JSON from the response
    let extracted;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const rawJson = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      extracted = JSON.parse(rawJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response:', responseText.slice(0, 500));
      return NextResponse.json(
        { success: false, message: 'AI could not structure the package data properly. Please try again or use a clearer source document.' },
        { status: 422 }
      );
    }

    // ── Validate and sanitize the extracted data ────────
    if (!extracted.packageInfo?.name) {
      return NextResponse.json(
        { success: false, message: 'AI could not identify a package name from the content. Please try a more detailed source.' },
        { status: 422 }
      );
    }

    // Ensure all required fields exist with defaults
    const sanitized = {
      category: extracted.category || 'trip',
      packageInfo: {
        name: extracted.packageInfo?.name || 'Untitled Package',
        packageType: extracted.packageInfo?.packageType || 'individual',
        packageCategory: extracted.packageInfo?.packageCategory || 'budget',
        destination: extracted.packageInfo?.destination || '',
        days: parseInt(extracted.packageInfo?.days) || 3,
        trekName: extracted.packageInfo?.trekName || '',
        trekLevel: extracted.packageInfo?.trekLevel || '',
      },
      aboutPackage: extracted.aboutPackage || '',
      pricingTiers: (extracted.pricingTiers || []).map(t => ({
        minPeople: parseInt(t.minPeople) || 1,
        maxPeople: parseInt(t.maxPeople) || 2,
        price: parseFloat(t.price) || 0,
        discount: parseFloat(t.discount) || 0,
      })),
      pickupDropCities: (extracted.pickupDropCities || []).map(c => ({
        cityName: c.cityName || '',
        locations: (c.locations || []).map(l => ({
          name: l.name || '',
          mapLink: l.mapLink || '',
        }))
      })),
      inclusivesList: (extracted.inclusivesList || []).filter(i => i && i.trim()),
      exclusivesList: (extracted.exclusivesList || []).filter(e => e && e.trim()),
      additionalPoints: (extracted.additionalPoints || []).filter(a => a && a.trim()),
      termsAndConditions: (extracted.termsAndConditions || []).filter(t => t && t.trim()),
      itinerary: (extracted.itinerary || []).map((day, i) => ({
        day: day.day || i + 1,
        location: day.location || '',
        agenda: day.agenda || '',
        travelFrom: day.travelFrom || '',
        travelTo: day.travelTo || '',
        pickupTime: day.pickupTime || '',
        checkinTime: day.checkinTime || '',
        hotelName: day.hotelName || '',
        hotelStars: day.hotelStars || '3',
        activities: day.activities || [],
        highlights: (day.highlights || []).filter(h => h && h.trim()),
      })),
    };

    // Ensure at least one pricing tier
    if (sanitized.pricingTiers.length === 0) {
      sanitized.pricingTiers = [{ minPeople: 1, maxPeople: 2, price: 0, discount: 0 }];
    }

    return NextResponse.json({
      success: true,
      message: 'Package data extracted successfully',
      data: sanitized,
    });

  } catch (error) {
    console.error('Smart import error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process the import. Please try again.' },
      { status: 500 }
    );
  }
}
