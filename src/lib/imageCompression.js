/**
 * Compresses an image file to a smaller base64 string.
 * Non-image files (PDFs etc.) are converted to base64 without compression.
 *
 * @param {File} file - The file to compress/convert.
 * @param {object} options
 * @param {number} options.maxWidth - Maximum width in pixels (default 1200).
 * @param {number} options.quality - JPEG quality 0–1 (default 0.7).
 * @returns {Promise<string>} A data-URL base64 string.
 */
export const compressImage = (file, { maxWidth = 1200, quality = 0.7 } = {}) => {
    return new Promise((resolve, reject) => {
        // Non-image files (PDFs, etc.) — just convert to base64 as-is
        if (!file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if wider than maxWidth
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Always output as JPEG for smaller size
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = event.target.result;
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

/**
 * Wraps a fetch call with a timeout and optional automatic retry.
 *
 * @param {string} url
 * @param {RequestInit} options - Standard fetch options.
 * @param {object} config
 * @param {number} config.timeoutMs   - Per-attempt timeout in ms (default 60 000).
 * @param {number} config.maxRetries  - How many retries on network failure (default 2).
 * @returns {Promise<Response>}
 */
export const fetchWithRetry = async (url, options = {}, { timeoutMs = 60000, maxRetries = 2 } = {}) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timer);
            return response; // success — return regardless of HTTP status
        } catch (err) {
            clearTimeout(timer);
            lastError = err;

            // Only retry on genuine network / timeout errors, not user aborts
            const isNetworkError =
                err.name === 'AbortError' ||
                err.name === 'TypeError' ||
                err.message?.includes('network') ||
                err.message?.includes('Failed to fetch');

            if (!isNetworkError || attempt >= maxRetries) {
                throw err;
            }

            // Exponential back-off: 1s, 3s
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
            await new Promise((r) => setTimeout(r, delay));
        }
    }

    throw lastError;
};
