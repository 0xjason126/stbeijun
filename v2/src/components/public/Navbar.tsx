"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 滚动检测
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 主题初始化
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ?? (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const navLinks = [
    { href: "/", label: "首页", en: "Home" },
    { href: "/gallery", label: "作品", en: "Works" },
    { href: "/artist", label: "画家", en: "Artist" },
  ];

  const useTransparent = transparent && !isScrolled;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50",
            useTransparent
              ? "bg-transparent"
              : "bg-background/80 backdrop-blur-2xl border-b border-border/30"
          )}
        >
          {/* 顶部装饰线 */}
          <div className={cn(
            "h-[1px] w-full",
            useTransparent
              ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          )} />

          <nav className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-24 lg:h-28">

              {/* Logo */}
              <Link
                href="/"
                className="group relative"
              >
                <motion.span
                  className={cn(
                    "font-serif text-2xl lg:text-3xl font-light tracking-[0.08em] transition-colors duration-500",
                    useTransparent ? "text-white" : "text-foreground"
                  )}
                  whileHover={{ letterSpacing: "0.12em" }}
                  transition={{ duration: 0.4 }}
                >
                  贝军国画
                </motion.span>
                <span className={cn(
                  "absolute -bottom-2 left-0 w-full h-px origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100",
                  useTransparent ? "bg-white/50" : "bg-primary/50"
                )} />
              </Link>

              {/* Desktop Navigation - 大字体 + 序号 */}
              <div className="hidden md:flex items-center gap-16 lg:gap-20">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group relative"
                    >
                      {/* 序号 */}
                      <span className={cn(
                        "absolute -left-4 -top-3 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        useTransparent ? "text-white/40" : "text-muted-foreground/40"
                      )}>
                        0{index + 1}
                      </span>

                      {/* 主文字 */}
                      <motion.span
                        className={cn(
                          "relative font-serif text-2xl lg:text-3xl tracking-[0.15em] transition-colors duration-300",
                          useTransparent
                            ? isActive ? "text-white" : "text-white/60 group-hover:text-white"
                            : isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {link.label}

                        {/* 活跃/悬停指示器 - 底部横线 */}
                        <motion.span
                          className={cn(
                            "absolute -bottom-2 left-0 h-[2px]",
                            useTransparent ? "bg-white" : "bg-primary"
                          )}
                          initial={{ width: "0%", left: "50%", x: "-50%" }}
                          animate={{
                            width: isActive ? "100%" : "0%",
                            left: isActive ? "0%" : "50%",
                            x: isActive ? "0%" : "-50%"
                          }}
                          whileHover={{ width: "100%", left: "0%", x: "0%" }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </motion.span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                {/* Theme Toggle - 极简图标 */}
                <motion.button
                  onClick={toggleTheme}
                  className={cn(
                    "relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300",
                    useTransparent
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
                >
                  <AnimatePresence mode="wait">
                    {theme === "light" ? (
                      <motion.svg
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </motion.svg>
                    ) : (
                      <motion.svg
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={cn(
                    "md:hidden relative w-10 h-10 flex items-center justify-center",
                    useTransparent ? "text-white" : "text-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                  aria-label="菜单"
                >
                  <div className="relative w-6 h-4 flex flex-col justify-between">
                    <motion.span
                      className={cn("w-full h-[1.5px]", useTransparent ? "bg-white" : "bg-foreground")}
                      animate={{
                        rotate: isMobileMenuOpen ? 45 : 0,
                        y: isMobileMenuOpen ? 7 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.span
                      className={cn("w-full h-[1.5px]", useTransparent ? "bg-white" : "bg-foreground")}
                      animate={{
                        opacity: isMobileMenuOpen ? 0 : 1,
                        scaleX: isMobileMenuOpen ? 0 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className={cn("w-full h-[1.5px]", useTransparent ? "bg-white" : "bg-foreground")}
                      animate={{
                        rotate: isMobileMenuOpen ? -45 : 0,
                        y: isMobileMenuOpen ? -7 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu - 全屏极简 */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden fixed inset-0 top-[97px] bg-background/98 backdrop-blur-3xl"
              >
                <div className="flex flex-col items-center justify-center h-full -mt-20">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="group relative block py-6"
                        >
                          {/* 序号 */}
                          <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/40">
                            0{index + 1}
                          </span>

                          {/* 主文字 */}
                          <span className={cn(
                            "font-serif text-5xl tracking-[0.2em] transition-colors duration-300",
                            isActive ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {link.label}
                          </span>

                          {/* 英文 */}
                          <span className="absolute -bottom-1 left-0 text-xs font-mono text-muted-foreground/40 tracking-widest uppercase">
                            {link.en}
                          </span>

                          {/* 活跃指示器 */}
                          {isActive && (
                            <motion.span
                              layoutId="mobile-nav-indicator"
                              className="absolute -left-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
