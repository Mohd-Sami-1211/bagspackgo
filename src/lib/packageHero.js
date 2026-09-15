export const PACKAGE_HERO_IMAGES = [
  '/images/package-heroes/kashmir-dawn-lake.webp',
  '/images/package-heroes/kashmir-spring-valley.webp',
  '/images/package-heroes/kashmir-dal-dawn.webp',
  '/images/package-heroes/kashmir-winter-river.webp',
  '/images/package-heroes/kashmir-autumn-chinar.webp',
];

export function packageHeroFor(packageId) {
  const key = String(packageId || 'bagspackgo');
  const hash = [...key].reduce(
    (value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0,
    0,
  );
  return PACKAGE_HERO_IMAGES[hash % PACKAGE_HERO_IMAGES.length];
}
