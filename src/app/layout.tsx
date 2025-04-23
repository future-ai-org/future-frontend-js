import type { Metadata } from "next";
import "../styles/global.css";
import dynamic from "next/dynamic";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Web3Provider } from "../contexts/Web3ModalContext";
import strings from "../i18n/header.json";

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
    <html lang="en">
      <body>
        <ThemeProvider>
          <Web3Provider>
            <Header />
            <div className="main-content-wrapper">{children}</div>
            <Footer />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
