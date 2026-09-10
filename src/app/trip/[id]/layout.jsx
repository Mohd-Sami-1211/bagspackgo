const PACKAGE_HERO_IMAGES = [
  '/images/package-heroes/kashmir-dawn-lake.webp',
  '/images/package-heroes/kashmir-spring-valley.webp',
  '/images/package-heroes/kashmir-dal-dawn.webp',
  '/images/package-heroes/kashmir-winter-river.webp',
  '/images/package-heroes/kashmir-autumn-chinar.webp',
];

function packageHeroFor(packageId) {
  const key = String(packageId || 'bagspackgo');
  const hash = [...key].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  return PACKAGE_HERO_IMAGES[hash % PACKAGE_HERO_IMAGES.length];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const canonicalPath = `/trip/${id}`;
  const coverImage = packageHeroFor(id);

  return {
    title: 'Kashmir Trip Package',
    description: 'View itinerary, inclusions, pricing and booking details for this Kashmir trip package.',
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      title: 'Kashmir Trip Package | bagspackgo',
      description: 'View itinerary, inclusions, pricing and booking details for this Kashmir trip package.',
      images: [{ url: coverImage, width: 2048, height: 765, alt: 'Kashmir trip package' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kashmir Trip Package | bagspackgo',
      description: 'View itinerary, inclusions, pricing and booking details for this Kashmir trip package.',
      images: [coverImage],
    },
  };
}

export default function ShortTripLayout({ children }) {
  return <div className="min-h-screen w-full bg-[#f4f3ee]">{children}</div>;
}
