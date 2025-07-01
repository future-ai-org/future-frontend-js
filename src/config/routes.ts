import strings from "../i18n/header.json";

export const ASTRO_NOW_ENDPOINT = "/v1/now";

// API Configuration
export const REQUEST_TIMEOUT = 10000; // 10 seconds in milliseconds
export const CACHE_DURATION = 300; // 5 minutes in seconds

// Security Headers
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

// User Agent
export const USER_AGENT = "Lilit/1.0";

export const ROUTES = {
  HOME: "/",
  INFO: "/info",
  LOGIA: "/logia",
  TRADE: "/trade",
  PREDICT: "/predict",
  DASHBOARD: "/avatar",
  PROFILE: "/profile",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

export const NAV_ITEMS = [
  { path: ROUTES.INFO, label: strings.en.nav.info },
  { path: ROUTES.LOGIA, label: strings.en.nav.logia },
  { path: ROUTES.TRADE, label: strings.en.nav.trade },
  { path: ROUTES.PREDICT, label: strings.en.nav.predict },
] as const;

export const DASHBOARD = {
  path: ROUTES.DASHBOARD,
  label: strings.en.nav.dashboard,
} as const;

export const isValidRoute = (path: string): path is Route => {
  // Check if the path is an exact match
  if (Object.values(ROUTES).some((route) => route === path)) {
    return true;
  }

  // Check if the path starts with any of the base routes
  return Object.values(ROUTES).some((route) => {
    if (route === "/") return false; // Don't match root for nested routes
    return path.startsWith(route);
  });
};
