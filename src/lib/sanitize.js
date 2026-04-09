/**
 * Input Sanitization & Validation Utilities
 * Protects against XSS, NoSQL injection, and other attack vectors.
 */

/**
 * Sanitize a string to prevent XSS attacks
 * Strips HTML tags and encodes special characters
 */
export function sanitizeString(input) {
    if (typeof input !== "string") return "";
    return input
        .trim()
        .replace(/[<>]/g, "") // Strip angle brackets (HTML tags)
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+=/gi, "") // Remove event handlers (onclick=, onerror=, etc.)
        .replace(/\$/g, "") // Remove $ to prevent NoSQL injection operators
        .slice(0, 5000); // Hard limit input length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input) {
    if (typeof input !== "string") return "";
    return input
        .trim()
        .toLowerCase()
        .replace(/[<>$]/g, "")
        .slice(0, 254); // Max email length per RFC
}

/**
 * Sanitize phone input — only allow digits
 */
export function sanitizePhone(input) {
    if (typeof input !== "string") return "";
    return input.replace(/\D/g, "").slice(0, 10);
}

/**
 * Validate and sanitize all signup data
 */
export function sanitizeSignupData(data) {
    return {
        identifier: data.identifier ? sanitizeString(data.identifier) : "",
        identifierType: ["phone", "email"].includes(data.identifierType) ? data.identifierType : "",
        role: ["user", "provider"].includes(data.role) ? data.role : "",
        name: data.name ? sanitizeString(data.name) : "",
        email: data.email ? sanitizeEmail(data.email) : "",
        phone: data.phone ? sanitizePhone(data.phone) : "",
        dob: data.dob || "",
        password: data.password || "", // Don't sanitize passwords — users need special chars
    };
}
