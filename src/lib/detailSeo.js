import { absoluteUrl, eventDate, eventHasEnded, eventRegistrationClosed, plainText } from './seo.js';
import { providerProfilePath } from './providerSlug.js';

const text = value => plainText(value || '', 5000);
const unique = values => [...new Map(values.map(text).filter(Boolean).map(value => [value.toLocaleLowerCase('en-IN'), value])).values()];
const sentence = value => value ? value.replace(/[.!?]+$/, '') + '.' : '';

function tripFacts(pkg) {
  const days = Number(pkg.days);
  const category = { budget: 'Budget', premium: 'Premium' }[pkg.packageCategory] || '';
  const duration = Number.isInteger(days) && days > 0 ? `${days}-Day` : '';
  const destination = text(pkg.destination);
  const activities = unique((pkg.activities || []).map(activity => activity.name));
  return { category, duration, destination, activities };
}

export function tripSearchMetadata(pkg) {
  const { category, duration, destination, activities } = tripFacts(pkg);
  const context = [duration, category, destination, 'Trip'].filter(Boolean).join(' ');
  const provider = text(pkg.provider?.companyname);
  return {
    title: `${text(pkg.name)} — ${context}`,
    description: [
      sentence(`${context}${provider ? ` with ${provider}` : ''}`),
      activities.length ? sentence(`Activities: ${activities.slice(0, 3).join(', ')}`) : '',
      text(pkg.aboutPackage) || 'View the itinerary, pricing, inclusions and booking details on Bagspackgo.',
    ].filter(Boolean).join(' '),
  };
}

export function tripStructuredData(pkg, { path, image }) {
  const url = absoluteUrl(path);
  const { activities } = tripFacts(pkg);
  const stops = (pkg.itinerary || [])
    .map(day => ({ name: text(day.location || day.travelTo), description: text(day.agenda) }))
    .filter(day => day.name);
  const providerUrl = absoluteUrl(providerProfilePath(pkg.provider.profileSlug || pkg.provider.companyname, pkg.provider._id));
  return {
    '@context': 'https://schema.org', '@type': 'TouristTrip', '@id': url + '#trip',
    name: text(pkg.name), url, mainEntityOfPage: url,
    description: text(pkg.aboutPackage)
      ? [text(pkg.aboutPackage), activities.length ? sentence(`Activities: ${activities.join(', ')}`) : ''].filter(Boolean).join(' ')
      : tripSearchMetadata(pkg).description,
    image: absoluteUrl(image),
    provider: { '@type': 'TravelAgency', '@id': providerUrl + '#provider', name: text(pkg.provider.companyname), url: providerUrl },
    ...(pkg.packageType ? { touristType: text(pkg.packageType) } : {}),
    ...(stops.length ? {
      itinerary: {
        '@type': 'ItemList', itemListOrder: 'https://schema.org/ItemListOrderAscending', numberOfItems: stops.length,
        itemListElement: stops.map((stop, index) => ({
          '@type': 'ListItem', position: index + 1,
          item: { '@type': 'Place', name: stop.name, ...(stop.description ? { description: stop.description } : {}) },
        })),
      },
    } : (text(pkg.destination) ? { itinerary: { '@type': 'Place', name: text(pkg.destination) } } : {})),
  };
}

export function offbeatSearchMetadata(item) {
  const places = unique([item.destination, item.region]);
  return {
    title: `${text(item.title)} — ${places.join(', ')} Offbeat Trip`,
    description: [sentence(places.join(', ')), text(item.shortDescription) || text(item.description)].filter(Boolean).join(' '),
  };
}

export function offbeatStructuredData(item, { path, image }) {
  const url = absoluteUrl(path);
  const destination = text(item.destination);
  const region = text(item.region);
  // The listing title identifies the attraction; destination is its locality,
  // not an alternative spelling of the attraction's name.
  const locality = destination && destination.toLocaleLowerCase('en-IN') !== region.toLocaleLowerCase('en-IN')
    ? { '@type': 'Place', name: destination, ...(region ? { containedInPlace: { '@type': 'Place', name: region } } : {}) }
    : region ? { '@type': 'Place', name: region } : undefined;
  return {
    '@context': 'https://schema.org', '@type': 'TouristDestination', '@id': url + '#destination',
    name: text(item.title) || destination, description: text(item.description || item.shortDescription),
    url, mainEntityOfPage: url, image: absoluteUrl(image),
    ...(locality ? { containedInPlace: locality } : {}),
  };
}

export function eventSearchMetadata(event, now = new Date()) {
  const date = eventDate(event.date);
  const dateLabel = date ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date(date + 'T12:00:00Z')) : '';
  const state = event.status === 'cancelled' ? 'Cancelled event' : eventHasEnded(event, now) ? 'Past event' : eventRegistrationClosed(event, now) ? 'Registration closed' : '';
  const activity = text(event.eventType);
  const location = text(event.location);
  const context = [activity, location ? `in ${location}` : ''].filter(Boolean).join(' ');
  const organizer = text(event.guideName);
  return {
    title: [text(event.name), [context, dateLabel, state].filter(Boolean).join(' · ')].filter(Boolean).join(' — '),
    description: [
      state ? sentence(state) : '',
      sentence(`${context}${dateLabel ? ` on ${dateLabel}` : ''}${organizer ? `, organized by ${organizer}` : ''}`),
      text(event.about),
    ].filter(Boolean).join(' '),
  };
}
