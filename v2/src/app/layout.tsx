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
    "bytedance-verification-code": "GwIaYhSS+DtGim2vvKYN",

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

// 头条搜索推送脚本
const toutiaoScript = `
  (function(){
    var el = document.createElement("script");
    el.src = "https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?321d6316bd0d2cf492112dd454e8ba4cdc0343fdf601123dc71a5d9b413d80bfbc434964556b7d7129e9b750ed197d397efd7b0c6c715c1701396e1af40cec962b8d7c8c6655c9b00211740aa8a98e2e";
    el.id = "ttzz";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(el, s);
  })(window)
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
        <script dangerouslySetInnerHTML={{ __html: toutiaoScript }} />
        {/* 头条搜索时间标签 */}
        <meta property="bytedance:published_time" content="2024-01-01T00:00:00+08:00" />
        <meta property="bytedance:lrDate_time" content="2025-01-16T00:00:00+08:00" />
        <meta property="bytedance:updated_time" content="2025-01-16T00:00:00+08:00" />
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
