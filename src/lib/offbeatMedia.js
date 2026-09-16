// Preserve stored images while keeping embedded image bytes out of page HTML.
export function offbeatCoverUrl(item) {
  const cover = item?.coverPhoto;
  if (typeof cover !== 'string' || !/^data:image\//i.test(cover.trim())) return cover;
  const id = String(item._id || item.id || '');
  if (!/^[a-f\d]{24}$/i.test(id)) return cover;
  const modified = item.updatedAt ? new Date(item.updatedAt).getTime() : NaN;
  return `/api/public/offbeats/${id}/cover${Number.isFinite(modified) ? `?v=${modified}` : ''}`;
}

export function parseImageDataUrl(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^data:(image\/[a-z\d.+-]+);base64,([a-z\d+/=\s]+)$/i);
  if (!match) return null;
  const base64 = match[2].replace(/\s/g, '');
  if (!base64 || base64.length % 4 === 1) return null;
  return { contentType: match[1].toLowerCase(), base64 };
}

export function offbeatCoverRedirect(value, origin) {
  if (typeof value !== 'string') return null;
  const cover = value.trim();
  if (!/^https?:\/\//i.test(cover) && !/^\/(?!\/)/.test(cover)) return null;
  try {
    const url = new URL(cover, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
