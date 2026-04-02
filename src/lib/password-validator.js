/**
 * Password Security Validator
 * Centralized password rules used by both frontend and backend.
 *
 * Rules:
 *  - Minimum 8 characters
 *  - At least 1 uppercase letter (A-Z)
 *  - At least 1 lowercase letter (a-z)
 *  - At least 1 digit (0-9)
 *  - At least 1 special character (!@#$%^&*()_+-=[]{}|;:'",.<>?/`~)
 *  - No spaces allowed
 *  - Not a commonly breached password
 */

// Top 50 most common/breached passwords
const COMMON_PASSWORDS = [
    "password", "12345678", "123456789", "1234567890", "qwerty123",
    "password1", "iloveyou", "abcdefgh", "abc12345", "qwertyui",
    "password123", "admin123", "letmein1", "welcome1", "monkey12",
    "dragon12", "master12", "football", "baseball", "trustno1",
    "sunshine", "princess", "starwars", "superman", "asdfghjk",
    "zxcvbnm1", "00000000", "11111111", "22222222", "99999999",
    "testtest", "passw0rd", "p@ssword", "p@ssw0rd", "12341234",
    "abcd1234", "qwer1234", "pass1234", "test1234", "user1234",
    "1q2w3e4r", "q1w2e3r4", "asd12345", "zaq12wsx", "1qaz2wsx",
    "changeme", "computer", "internet", "security", "whatever",
];

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[], strength: number }}
 *   strength: 0 = very weak, 1 = weak, 2 = fair, 3 = strong, 4 = very strong
 */
export function validatePassword(password) {
    const errors = [];
    let strength = 0;

    if (!password) {
        return { isValid: false, errors: ["Password is required"], strength: 0 };
    }

    // Length check
    if (password.length < 8) {
        errors.push("Must be at least 8 characters");
    } else {
        strength += 1;
        if (password.length >= 12) strength += 1; // Bonus for long passwords
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push("Must contain at least 1 uppercase letter");
    } else {
        strength += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push("Must contain at least 1 lowercase letter");
    } else {
        strength += 1;
    }

    // Digit check
    if (!/\d/.test(password)) {
        errors.push("Must contain at least 1 number");
    } else {
        strength += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]/.test(password)) {
        errors.push("Must contain at least 1 special character (!@#$%^&*...)");
    } else {
        strength += 1;
    }

    // No spaces
    if (/\s/.test(password)) {
        errors.push("Must not contain spaces");
    }

    // Common password check
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        errors.push("This password is too common. Please choose a stronger one.");
        strength = 0;
    }

    // Repeating characters (e.g., "aaaa" or "1111")
    if (/(.)\1{3,}/.test(password)) {
        errors.push("Must not contain 4 or more repeating characters");
        strength = Math.max(0, strength - 1);
    }

    // Sequential characters (e.g., "abcd" or "1234")
    if (/(?:abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz|0123|1234|2345|3456|4567|5678|6789)/i.test(password)) {
        errors.push("Must not contain sequential characters (e.g., abcd, 1234)");
        strength = Math.max(0, strength - 1);
    }

    // Normalize strength to 0-4 scale
    const normalizedStrength = Math.min(4, Math.max(0, Math.floor(strength * 4 / 6)));

    return {
        isValid: errors.length === 0,
        errors,
        strength: normalizedStrength,
    };
}

/**
 * Get strength label
 * @param {number} strength 0-4
 * @returns {{ label: string, color: string }}
 */
export function getStrengthInfo(strength) {
    const levels = [
        { label: "Very Weak", color: "#ef4444" },   // red
        { label: "Weak", color: "#f97316" },         // orange
        { label: "Fair", color: "#eab308" },         // yellow
        { label: "Strong", color: "#22c55e" },       // green
        { label: "Very Strong", color: "#16a34a" },  // dark green
    ];
    return levels[strength] || levels[0];
}
