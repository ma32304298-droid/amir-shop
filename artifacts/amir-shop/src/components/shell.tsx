import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Gamepad2, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Shell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    document.documentElement.classList.add('dark'); // Force dark mode
  }, [i18n.language, isRTL]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/orders', label: t('nav.myOrders') },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Gamepad2 className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
            <span className="font-bold text-xl tracking-wider text-glow text-white">
              AMIR<span className="text-primary">SHOP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? 'text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-4 border-l border-white/10 pl-4 ml-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
              >
                {i18n.language === 'ar' ? '🇺🇸 EN' : '🇸🇦 AR'}
              </button>
              <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors" title={t('nav.admin')}>
                <User className="w-5 h-5" />
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/10 bg-background/95 backdrop-blur-md"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-lg font-medium py-2 ${
                      location === link.href ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      toggleLanguage();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10"
                  >
                    {i18n.language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                  </button>
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-muted-foreground p-2">
                    <User className="w-6 h-6" />
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-background/50 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-wider text-white">
              AMIR<span className="text-primary">SHOP</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Amir Shop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
