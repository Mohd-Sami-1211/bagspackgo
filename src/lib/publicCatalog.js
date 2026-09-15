import { unstable_cache } from 'next/cache';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';
import { OffBeat } from '@/models/offbeat.model';
import { Event } from '@/models/event.model';
import { isPublicProvider } from '@/lib/seo';

const serialize = (value) => JSON.parse(JSON.stringify(value));

export const getPublicProviders = unstable_cache(async () => {
  await dbConnect();
  const [accounts, details] = await Promise.all([
    Guide.find({ isActive: { $ne: false } }).select('_id username applicationStatus isActive updatedAt').lean(),
    GuideDetails.find({}).select('guide companyname profileSlug bio destinationId speciality status pausedServices rating reviews languages totalTrips totalTreks updatedAt').lean(),
  ]);
  const byId = new Map(accounts.map(account => [String(account._id), account]));
  return serialize(details.filter(item => isPublicProvider(byId.get(String(item.guide)), item))
    .map(item => ({ ...item, name: item.companyname || byId.get(String(item.guide)).username })));
}, ['seo-public-providers-v1'], { revalidate: 300, tags: ['public-provider-profile'] });

export const getPublicCatalog = unstable_cache(async () => {
  const providers = await getPublicProviders();
  await dbConnect();
  const tripIds = providers.filter(p => !p.pausedServices?.trip).map(p => new mongoose.Types.ObjectId(p.guide));
  const trekIds = providers.filter(p => !p.pausedServices?.trek).map(p => new mongoose.Types.ObjectId(p.guide));
  const eventIds = providers.filter(p => !p.pausedServices?.event).map(p => new mongoose.Types.ObjectId(p.guide));
  const [packages, offbeats, events] = await Promise.all([
    Package.find({ status: 'active', $or: [{ category: 'trip', provider: { $in: tripIds } }, { category: 'trek', provider: { $in: trekIds } }] })
      .select('name destination category days trekName trekLevel aboutPackage updatedAt provider').sort({ updatedAt: -1 }).lean(),
    OffBeat.find({ status: 'published' }).select('title destination region shortDescription updatedAt').sort({ title: 1 }).lean(),
    Event.find({ status: { $in: ['published', 'completed', 'cancelled'] }, visibility: 'public', guide: { $in: eventIds } })
      .select('title location destination date duration status updatedAt').sort({ date: -1 }).lean(),
  ]);
  return serialize({ providers, packages, offbeats, events });
}, ['seo-public-catalog-v1'], { revalidate: 300 });

export const getPublicPackage = unstable_cache(async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const pkg = await Package.findOne({ _id: id, status: 'active' })
    .select('-packagePhotos -photos -itinerary.hotelPhotos -itinerary.destinationPhotos').lean();
  if (!pkg) return null;
  const providers = await getPublicProviders();
  const provider = providers.find(p => p.guide === String(pkg.provider));
  if (!provider || provider.pausedServices?.[pkg.category]) return null;
  if (pkg.category === 'trek') {
    const [media] = await Package.aggregate([{ $match: { _id: pkg._id } }, { $project: { count: { $size: { $ifNull: ['$photos', []] } } } }]);
    pkg.photos = Array.from({ length: media?.count || 0 }, (_, index) => '/api/public/treks/' + pkg._id + '/photos/' + index);
  }
  return serialize({ ...pkg, provider: {
    _id: provider.guide, username: provider.name, companyname: provider.name,
    companyName: provider.name, profileSlug: provider.profileSlug,
    bio: provider.bio || '', rating: provider.rating, reviews: provider.reviews, languages: provider.languages, totalTrips: provider.totalTrips, totalTreks: provider.totalTreks, logo: '/api/public/provider/' + provider.guide + '/logo',
  } });
}, ['seo-public-package-v1'], { revalidate: 300 });

export const getPublicOffbeat = unstable_cache(async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const item = await OffBeat.findOne({ _id: id, status: 'published' }).select('-photographs -videos').lean();
  return item ? serialize(item) : null;
}, ['seo-public-offbeat-v1'], { revalidate: 300 });

export function tripGuideFromPackage(pkg) {
  const tiers = [...(pkg.pricingTiers || [])].sort((a, b) => a.minPeople - b.minPeople);
  const price = { individual: Number(tiers[0]?.price || 0), couple: Number(tiers[0]?.price || 0) * 2 };
  return {
    id: pkg.provider._id, providerId: pkg.provider._id, name: pkg.provider.companyname,
    companyName: pkg.provider.companyname, bio: pkg.provider.bio, logo: pkg.provider.logo,
    image: pkg.provider.logo, location: pkg.destination, price, rating: pkg.provider.rating || 0, reviews: pkg.provider.reviews || 0, languages: pkg.provider.languages || [], touristsHandled: Number(pkg.provider.totalTrips || 0) + Number(pkg.provider.totalTreks || 0),
    packages: [{ ...pkg, id: pkg._id, label: pkg.name, type: pkg.packageCategory, price, packagePhotos: [] }],
  };
}

