import type { Metadata } from "next";
import { Noto_Serif_SC, Noto_Sans_SC, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// 衬线字体 - 用于标题
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 无衬线字体 - 用于正文
const notoSansSC = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// 英文辅助字体
const inter = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "贝军国画 | Beijun Chinese Painting",
    template: "%s | 贝军国画",
  },
  description: "贝军，当代国画艺术家。专注于传统水墨画创作，将东方美学与现代艺术融合。浏览作品集，了解艺术历程。",
  other: {
    "bytedance-verification-code": "ZH+AcLYsj6gW2AAa+mFD",
  },
  keywords: [
    "贝军",
    "国画",
    "水墨画",
    "中国画",
    "艺术家",
    "当代艺术",
    "传统艺术",
    "人物画",
    "山水画",
    "花鸟画",
    "Chinese painting",
    "Beijun",
    "ink painting",
  ],
  authors: [{ name: "贝军" }],
  creator: "贝军",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://stbeijun.art"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "贝军国画",
    title: "贝军国画 | 当代国画艺术家",
    description: "贝军，当代国画艺术家。专注于传统水墨画创作，将东方美学与现代艺术融合。",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "贝军国画",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "贝军国画 | 当代国画艺术家",
    description: "贝军，当代国画艺术家。专注于传统水墨画创作，将东方美学与现代艺术融合。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// 主题初始化脚本 - 防止闪烁
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${notoSerifSC.variable} ${notoSansSC.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
