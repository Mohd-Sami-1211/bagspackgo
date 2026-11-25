'use client';

const FALLBACK_POSTER = '/images/EventCover.webp';

export default function EventPosterImage({ event, loading = 'lazy' }) {
  return (
    <img
      src={event.image || FALLBACK_POSTER}
      alt={event.name}
      loading={loading}
      draggable={false}
      className="block h-full w-full object-contain"
      onError={({ currentTarget }) => {
        if (currentTarget.getAttribute('src') !== FALLBACK_POSTER) {
          currentTarget.src = FALLBACK_POSTER;
        }
      }}
    />
  );
}
