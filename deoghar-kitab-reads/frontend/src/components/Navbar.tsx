import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Moon, Sun, Languages, User as UserIcon,
  LogOut, ShoppingCart, Heart, Search, ChevronDown,
  Bell, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout, getAuthHeaders } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Transparent only at top of /home page
  const isHomePage = location.pathname === "/home";
  const isTransparent = isHomePage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        const items = JSON.parse(cart);
        setCartItemCount(items.reduce((t: number, i: { quantity: number }) => t + i.quantity, 0));
      } else setCartItemCount(0);
    };
    updateCartCount();
    const handler = (e: StorageEvent) => { if (e.key === "cart") updateCartCount(); };
    window.addEventListener("storage", handler);
    // Also catch same-tab dispatched events
    window.addEventListener("storage", updateCartCount as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("storage", updateCartCount as EventListener);
    };
  }, []);

  // Wishlist count
  useEffect(() => {
    const updateWishlistCount = () => {
      const wl = localStorage.getItem("wishlist");
      setWishlistItemCount(wl ? JSON.parse(wl).length : 0);
    };
    updateWishlistCount();
    const handler = (e: StorageEvent) => { if (e.key === "wishlist") updateWishlistCount(); };
    window.addEventListener("storage", handler);
    window.addEventListener("storage", updateWishlistCount as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("storage", updateWishlistCount as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        setUnreadNotifications(0);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) return;

        const data = await response.json();
        const unread = Array.isArray(data) ? data.filter((notification) => !notification.read).length : 0;
        setUnreadNotifications(unread);
      } catch (error) {
        console.error("Failed to load notifications count", error);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: t.navbar.browseBooks, href: "/browse" },
    { label: t.navbar.sellBook, href: "#sell" },
    { label: t.navbar.whyUs, href: "#why" },
    { label: t.navbar.reviews, href: "#testimonials" },
  ];

  const textCls = isTransparent ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-primary";
  const iconCls = isTransparent ? "text-white/90 hover:text-white" : "text-foreground/70 hover:text-primary";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/96 backdrop-blur-xl shadow-soft py-3 border-b border-border/40"
          : isHomePage ? "bg-transparent py-5" : "bg-card/96 backdrop-blur-xl py-3 border-b border-border/40"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Link to="/home" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden">
              <img src="/favicon.ico" alt="Deoghar Kitab" loading="eager" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hidden sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>
              Deoghar Kitab
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/browse"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
            >
              Browse
              <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/nearby-search"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
                >
                  Nearby Books
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
                <Link
                  to="/reservations"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
                >
                  Hold Desk
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
                <Link
                  to="/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
                >
                  Request Desk
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
                <Link
                  to="/inventory-manager"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
                >
                  Inventory Mgr
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
                <Link
                  to="/shopkeeper-insights"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
                >
                  Insights
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
                <Link
                  to="/seller-dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${textCls}`}
                >
                  Seller Dashboard
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-amber-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              </>
            )}
          </div>

          {/* ── Right Controls ── */}
          <div className="hidden md:flex items-center gap-1">
            {/* Search toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2.5 rounded-xl transition-colors hover:bg-primary/10 ${iconCls}`}
              title="Search books"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className={`relative p-2.5 rounded-xl transition-colors hover:bg-primary/10 ${iconCls}`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Chat */}
            {isAuthenticated && (
              <Link
                to="/chat"
                className={`p-2.5 rounded-xl transition-colors hover:bg-primary/10 ${iconCls}`}
                title="Open chats"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            )}

            {/* Language */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className={`p-2.5 rounded-xl transition-colors hover:bg-primary/10 flex items-center gap-1 ${iconCls}`}
              title={language === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold">{language.toUpperCase()}</span>
            </motion.button>

            {/* Theme */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2.5 rounded-xl transition-colors hover:bg-primary/10 ${iconCls}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Wishlist */}
            <Link to="/wishlist" className={`relative p-2.5 rounded-xl transition-colors hover:bg-primary/10 ${iconCls}`}>
              <Heart className="w-5 h-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-4.5 w-4.5 min-w-[1.1rem] flex items-center justify-center font-bold text-[10px] px-0.5">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className={`relative p-2.5 rounded-xl transition-colors hover:bg-primary/10 ${iconCls}`}>
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4.5 w-4.5 min-w-[1.1rem] flex items-center justify-center font-bold text-[10px] px-0.5">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() ?? <UserIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-medium hidden lg:block ${isTransparent ? "text-white/90" : "text-foreground/80"}`}>
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 hidden lg:block ${iconCls}`} />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className={`rounded-xl border-border/60 flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all ${isTransparent ? "border-white/30 text-white/80 hover:bg-white/10 hover:text-white" : ""}`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/")}
                  className={`rounded-xl ${isTransparent ? "border-white/40 text-white/90 hover:bg-white/10" : "border-border/60"}`}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/")}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold shadow-md hover:shadow-amber-500/30 transition-all"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* ── Mobile Right ── */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className={`relative p-2 ${iconCls}`}>
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              className={`p-2 rounded-lg ${iconCls}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Search Bar (desktop) ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSearch} className="pt-3 pb-1">
                <div className="flex items-center bg-card border border-border/60 rounded-2xl overflow-hidden shadow-soft">
                  <Search className="w-5 h-5 text-muted-foreground ml-4 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books by title, author, subject…"
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground px-3 py-3 outline-none text-sm"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="m-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl px-4">
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border/40 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="flex items-center bg-muted rounded-xl overflow-hidden border border-border/40">
                  <Search className="w-4 h-4 text-muted-foreground ml-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground px-3 py-2.5 outline-none"
                  />
                  <button type="submit" className="px-3 py-2.5 bg-amber-500 text-white text-sm font-medium">Go</button>
                </div>
              </form>

              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/notifications" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Notifications
                  </Link>
                  <Link to="/chat" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Chat
                  </Link>
                  <Link to="/nearby-search" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Nearby Books
                  </Link>
                  <Link to="/reservations" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Hold Desk
                  </Link>
                  <Link to="/requests" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Request Desk
                  </Link>
                  <Link to="/inventory-manager" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Inventory Mgr
                  </Link>
                  <Link to="/shopkeeper-insights" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Insights
                  </Link>
                  <Link to="/seller-dashboard" className="text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Seller Dashboard
                  </Link>
                </>
              )}

              <div className="flex gap-3 pt-2 border-t border-border/40 mt-1">
                <button onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-muted hover:bg-primary/10 text-sm font-medium transition-colors">
                  <Languages className="w-4 h-4 text-primary" />
                  {language === "en" ? "हिंदी" : "English"}
                </button>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-muted hover:bg-primary/10 text-sm font-medium transition-colors">
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>

              <Link to="/wishlist" className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> Wishlist</div>
                {wishlistItemCount > 0 && <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-semibold">{wishlistItemCount}</span>}
              </Link>

              {isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-border/40 mt-1">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </Link>
                  <Button variant="outline" className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-border/40 mt-1">
                  <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold" onClick={() => { navigate("/"); setIsMobileMenuOpen(false); }}>
                    Sign In / Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;