import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* 印章/签名区域 */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="relative">
              {/* 模拟印章效果 */}
              <div className="w-16 h-16 border-2 border-primary rounded-sm flex items-center justify-center transform rotate-3">
                <span className="font-serif text-primary text-lg font-bold">
                  贝军
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              以笔墨记录时代
              <br />
              用水墨讲述故事
            </p>
          </div>

          {/* 导航链接 */}
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              首页
            </Link>
            <Link
              href="/gallery"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              作品
            </Link>
            <Link
              href="/artist"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              画家
            </Link>
          </nav>

          {/* 版权信息 */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {currentYear} 贝军国画
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
