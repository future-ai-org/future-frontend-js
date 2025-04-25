import strings from "../i18n/header.json";
import { NAV_ITEMS, DASHBOARD } from "./routes";

export const HEADER_CONFIG = {
  title: strings.en.title,
  logo: {
    alt: "LILIT Logo",
    width: 30,
    height: 30,
  },
  navItems: NAV_ITEMS,
  dashboard: DASHBOARD,
};
