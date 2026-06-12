/**
 * Server-side thumbnail generator using sharp.
 * Converts base64 image strings into tiny (~16px wide) blurred JPEG thumbnails
 * that can be embedded inline for instant blurred previews on the client.
 *
 * Each thumbnail is typically 200–600 bytes (vs 50–200KB for a full photo),
 * making them safe to bundle with the initial API response.
 */

let sharpLib = null;

async function getSharp() {
    if (!sharpLib) {
        sharpLib = (await import('sharp')).default;
    }
    return sharpLib;
}

/**
 * Convert a single base64 image string to a tiny blurred thumbnail.
 * @param {string} base64 - base64 encoded image (with or without data URI prefix)
 * @param {object} opts
 * @param {number} opts.width  - thumbnail width in pixels (default 20)
 * @param {number} opts.quality - JPEG quality 1–100 (default 30)
 * @returns {Promise<string|null>} base64 data URI of the thumbnail, or null on failure
 */
export async function generateThumbnail(base64, opts = {}) {
    if (!base64 || typeof base64 !== 'string') return null;

    const { width = 20, quality = 30 } = opts;

    try {
        const sharp = await getSharp();

        // Strip the data URI prefix if present (e.g. "data:image/jpeg;base64,")
        const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
        const buffer = Buffer.from(rawBase64, 'base64');

        const thumbBuffer = await sharp(buffer)
            .resize(width, null, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality, mozjpeg: false })
            .toBuffer();

        return `data:image/jpeg;base64,${thumbBuffer.toString('base64')}`;
    } catch (err) {
        // Don't crash the API if a thumbnail fails — just return null
        console.warn('[generateThumbnail] Failed to generate thumbnail:', err?.message);
        return null;
    }
}

/**
 * Batch-generate thumbnails for an array of base64 image strings.
 * Processes all in parallel for speed.
 * @param {string[]} base64Array
 * @param {object} opts - same as generateThumbnail opts
 * @returns {Promise<(string|null)[]>}
 */
export async function generateThumbnails(base64Array, opts = {}) {
    if (!Array.isArray(base64Array) || base64Array.length === 0) return [];
    return Promise.all(base64Array.map((b64) => generateThumbnail(b64, opts)));
}
