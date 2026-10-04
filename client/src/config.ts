//export const API_BASE_URL = 'http://localhost:3001/api';
export const API_BASE_URL = '/api';
export const DEFAULT_TIMEOUT_MS = 8000;

// Why plain /api wouldn't have worked in your Node tests

// When you ran npx tsx client/src/index.ts, there was no web page, 
// no "current URL" to be relative to. If API_BASE_URL had been /api back then, 
// fetch("/api" + "/login") would have tried to fetch the literal path /api/login 
// with no host at all, and Node's fetch would have thrown an error immediately, 
// since it has no concept of "relative to the current page.
// " That's exactly why I had you temporarily hardcode the full http://localhost:3001/api 
// for those tests, Node needs an absolute URL, always.