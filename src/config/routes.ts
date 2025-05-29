import strings from "../i18n/header.json";

export const ROUTES = {
  HOME: "/",
  INFO: "/info",
  LOGIA: "/logia",
  TRADE: "/trade",
  PREDICT: "/predict",
  DASHBOARD: "/dashboard",
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
