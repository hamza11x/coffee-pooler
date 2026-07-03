import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "ARNADA POOL | Play. Compete. Dominate.",
    template: "%s | ARNADA POOL"
  },
  description: "Experience luxury billiards like never before. Book tables, join tournaments, track stats, and compete at ARNADA POOL — the premier billiards cafe.",
  keywords: ["billiards", "pool cafe", "tournaments", "ARNADA", "luxury gaming", "pool table booking", "billiards stats"],
  authors: [{ name: "ARNADA POOL" }],
  creator: "ARNADA POOL",
  publisher: "ARNADA POOL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "ARNADA POOL | Luxury Billiards Cafe",
    description: "The elite arena for billiards. Compete in tournaments and track your legacy.",
    url: "/",
    siteName: "ARNADA POOL",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARNADA POOL | Play. Compete. Dominate.",
    description: "The elite arena for luxury billiards. Join the competition.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <CustomCursor />
            <Navbar />
            <LoadingScreen>
              {children}
            </LoadingScreen>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
