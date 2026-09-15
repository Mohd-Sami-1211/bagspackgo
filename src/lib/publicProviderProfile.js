import { unstable_cache } from 'next/cache';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';
import { Event } from '@/models/event.model';
import Review from '@/models/review.model';
import { toProviderSlug } from '@/lib/providerSlug';
import { packageHeroFor } from '@/lib/packageHero';

function companyNamePattern(slug) {
  const tokens = slug.split('_').filter(Boolean).map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return tokens.length ? new RegExp(`^${tokens.join('[\\s_\\-&]+')}$`, 'i') : null;
}

function asIso(value) {
  return value?.toISOString?.() || value || null;
}

async function resolveDetails(identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return GuideDetails.findOne({ guide: new mongoose.Types.ObjectId(identifier) })
      .select('guide companyname profileSlug bio destinationId speciality rating reviews totalTrips totalEvents pausedServices status updatedAt')
      .lean();
  }

  const slug = toProviderSlug(identifier);
  if (!slug) return null;

  let details = await GuideDetails.findOne({ profileSlug: slug })
    .select('guide companyname profileSlug bio destinationId speciality rating reviews totalTrips totalEvents pausedServices status updatedAt')
    .lean();

  if (!details) {
    const fallbackPattern = companyNamePattern(slug);
    if (fallbackPattern) {
      details = await GuideDetails.findOne({ companyname: fallbackPattern })
        .select('guide companyname profileSlug bio destinationId speciality rating reviews totalTrips totalEvents pausedServices status updatedAt')
        .lean();
    }
  }

  // Existing providers may predate profileSlug and can contain punctuation that
  // cannot be reconstructed reliably from a URL. This bounded fallback runs only
  // on an initial cache miss without changing provider records.
  if (!details) {
    const candidates = await GuideDetails.find({ profileSlug: { $in: [null, ''] } })
      .select('guide companyname profileSlug bio destinationId speciality rating reviews totalTrips totalEvents pausedServices status updatedAt')
      .limit(250)
      .lean();
    details = candidates.find((candidate) => toProviderSlug(candidate.companyname) === slug) || null;
  }

  return details;
}

async function queryPublicProviderProfile(identifier) {
  const normalizedIdentifier = String(identifier || '').trim();
  if (!normalizedIdentifier) return null;

  await dbConnect();
  const details = await resolveDetails(normalizedIdentifier);
  if (!details?.guide) return null;

  const providerId = details.guide.toString();
  const providerObjectId = new mongoose.Types.ObjectId(providerId);

  const [guide, packages, events, reviews] = await Promise.all([
    Guide.findById(providerObjectId).select('username applicationStatus isActive').lean(),
    Package.find({
      provider: providerObjectId,
      status: 'active',
      category: 'trip',
      ...(details.pausedServices?.trip ? { _id: null } : {}),
    })
      .select('name category packageType packageCategory destination days pricingTiers rating totalRatings createdAt')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    details.pausedServices?.event
      ? Promise.resolve([])
      : Event.find({ guide: providerObjectId, status: 'published', visibility: 'public' })
          .select('title eventType location destination date duration totalSlots bookedSlots reservedSlots pricePerSlot rating reviewCount createdAt')
          .sort({ date: 1 })
          .limit(30)
          .lean(),
    Review.find({ provider: providerObjectId })
      .select('name content rating createdAt')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
  ]);

  if (!guide || guide.isActive === false) return null;
  if (guide.applicationStatus !== 'approved' && details.status !== 'approved') return null;

  const slug = details.profileSlug || toProviderSlug(details.companyname || guide.username);
  const assetVersion = details.updatedAt ? new Date(details.updatedAt).getTime() : 0;

  return {
    success: true,
    provider: {
      _id: providerId,
      name: details.companyname || guide.username || 'Travel provider',
      slug,
      bio: details.bio || '',
      logo: `/api/public/provider/${providerId}/logo?v=${assetVersion}`,
      coverPhoto: `/api/public/provider/${providerId}/cover?v=${assetVersion}`,
      location: details.destinationId || '',
      speciality: details.speciality || '',
      rating: Number(details.rating || 0),
      reviews: Number(details.reviews || reviews.length || 0),
      totalTrips: Number(details.totalTrips || 0),
      totalEvents: Number(details.totalEvents || 0),
      isVerified: true,
    },
    packages: packages.map((pkg) => ({
      _id: pkg._id.toString(),
      name: pkg.name,
      category: pkg.category,
      packageType: pkg.packageType,
      packageCategory: pkg.packageCategory,
      destination: pkg.destination,
      days: Number(pkg.days || 1),
      pricingTiers: (pkg.pricingTiers || []).map((tier) => ({
        minPeople: Number(tier.minPeople || 1),
        maxPeople: Number(tier.maxPeople || 1),
        price: Number(tier.price || 0),
        discount: Number(tier.discount || 0),
      })),
      rating: Number(pkg.rating || 0),
      totalRatings: Number(pkg.totalRatings || 0),
      // Keep provider-profile cards visually identical to the corresponding
      // package detail hero. Both are derived from the same stable package ID.
      coverImage: packageHeroFor(pkg._id.toString()),
    })),
    events: events.map((event) => ({
      _id: event._id.toString(),
      title: event.title,
      eventType: event.eventType,
      location: event.location,
      destination: event.destination,
      date: asIso(event.date),
      duration: Number(event.duration || 1),
      totalSlots: Number(event.totalSlots || 0),
      bookedSlots: Number(event.bookedSlots || 0),
      reservedSlots: Number(event.reservedSlots || 0),
      slotsLeft: Math.max(0, Number(event.totalSlots || 0) - Number(event.bookedSlots || 0) - Number(event.reservedSlots || 0)),
      pricePerSlot: Number(event.pricePerSlot || 0),
      rating: Number(event.rating || 0),
      reviewCount: Number(event.reviewCount || 0),
      poster: `/api/events/${event._id.toString()}/poster`,
    })),
    feedbacks: reviews.map((review) => ({
      id: review._id.toString(),
      user: review.name || 'Traveler',
      rating: Number(review.rating || 0),
      comment: review.content || '',
      date: asIso(review.createdAt),
    })),
  };
}

export const getPublicProviderProfile = unstable_cache(
  queryPublicProviderProfile,
  ['public-provider-profile-v5'],
  { revalidate: 300, tags: ['public-provider-profile'] }
);
