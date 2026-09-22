export const ACCESS_SECRET = "dev_secret_key_for_short_lived_access_tokens_987654321_abc";
export const REFRESH_SECRET = "dev_secret_key_for_long_lived_refresh_cookies_123456789_xyz";

export const ACCESS_TTL_SECONDS = 15; 
export const REFRESH_EXPIRY = "7d";
export const REFRESH_DELAY_MS = 300;

// Cookie max-age expects absolute milliseconds
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

// In-memory state tracking for your mock API testing
export const state = {
    refreshCalls: 0,
    rejectRefresh: false,
};
