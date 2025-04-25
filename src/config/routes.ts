import strings from "../i18n/header.json";

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

export const isValidRoute = (path: string): path is Route => {
  return Object.values(ROUTES).some(route => route === path);
};
