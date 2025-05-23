import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { ThemeProvider } from "../utils/themeContext";
import { Web3Provider } from "../utils/web3ModalContext";
import strings from "../i18n/header.json";
import { Quicksand, Satisfy } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-satisfy",
});

const Header = dynamic(() => import("../components/Header"), { ssr: false });
const Footer = dynamic(
  () => import("../components/Footer").then((mod) => ({ default: mod.Footer })),
  { ssr: false },
);

export const metadata: Metadata = {
  title: strings.en.browserTitle,
  description: strings.en.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${satisfy.variable}`}>
      <body>
        <ThemeProvider>
          <Web3Provider>
            <Header />
            <div className="main-content-wrapper logia-page">{children}</div>
            <Footer />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
