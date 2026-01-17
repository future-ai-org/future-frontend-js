import strings from "../i18n/header.json";

export const ASTRO_NOW_ENDPOINT = "/v1/now";

export const REQUEST_TIMEOUT = 10000; // 10 seconds in milliseconds
export const CACHE_DURATION = 300; // 5 minutes in seconds

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;
export const USER_AGENT = "Future/1.0";

export const ROUTES = {
  HOME: "/",
  INFO: "/info",
  LOGIA: "/logia",
  TRADE: "/trade",
  PREDICT: "/predict",
  DASHBOARD: "/dashboard",
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

export const API_ERRORS = {
  INTERNAL_SERVER_ERROR: "internal server error",
  MISSING_REQUIRED_FIELDS: "missing required fields",
} as const;
