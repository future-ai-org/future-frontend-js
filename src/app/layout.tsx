import type { Metadata } from "next";
import "./globals.css";
import "../styles/logia.css";
import { ThemeProvider } from "../utils/themeContext";
import { Web3Provider } from "../utils/web3ModalContext";
import strings from "../i18n/header.json";
import { Quicksand, Satisfy, Noto_Sans_Symbols } from "next/font/google";
import Header from "../components/Header";
import { Footer } from "../components/Footer";

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

const notoSansSymbols = Noto_Sans_Symbols({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-symbols",
});

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
    <html
      lang="en"
      className={`${quicksand.variable} ${satisfy.variable} ${notoSansSymbols.variable}`}
    >
      <body>
        <ThemeProvider>
          <Web3Provider>
            <div className="app-container">
              <Header />
              <main className="main-content-wrapper">{children}</main>
              <Footer />
            </div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
