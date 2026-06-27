import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingCart, ArrowLeft, Filter, Star, Tag,
  BookOpen, X, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { initialBooks, Book } from "@/lib/booksData";
import { toast } from "sonner";

interface SellerBook {
  id: number; title: string; author: string; price: number;
  condition: string; status: string; date: string; sales: number;
  revenue: number; sellerEmail: string; category?: string;
}
interface WishlistItem { id: number; title: string; author: string; price: number; image: string; condition: string; }
interface CartItem { id: number; title: string; author: string; price: number; image: string; condition: string; quantity: number; sellerEmail?: string; }

const conditionConfig: Record<string, { label: string; className: string }> = {
  Excellent: { label: "Excellent", className: "badge-excellent" },
  Good:      { label: "Good",      className: "badge-good" },
  Fair:      { label: "Fair",      className: "badge-fair" },
};

const CATEGORY_CHIPS = [
  { value: "all",         label: "All Books" },
  { value: "ncert",       label: "NCERT" },
  { value: "reference",   label: "Reference" },
  { value: "competitive", label: "Competitive" },
  { value: "government",  label: "Govt. Exams" },
  { value: "fiction",     label: "Fiction" },
  { value: "nonfiction",  label: "Non-Fiction" },
];

// ─── Book Card ─────────────────────────────────────────────────────────────
const BookCard = ({
  book, isFavorite, onToggleFavorite, onAddToCart, onView,
}: {
  book: Book; isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: (id: number) => void;
  onView: (id: number) => void;
}) => {
  const savings = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;
  const cond = conditionConfig[book.condition] ?? { label: book.condition, className: "badge-fair" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="book-card group flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-2xl aspect-[3/4]">
        <img
          src={book.image} alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onClick={() => onView(book.id)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
            className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all ${isFavorite ? "bg-rose-500 text-white" : "bg-white/90 text-gray-600 hover:bg-rose-500 hover:text-white"}`}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(book.id); }}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-lg text-gray-600 hover:bg-amber-500 hover:text-white transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        <span className={`absolute top-3 left-3 ${cond.className}`}>{cond.label}</span>
        {savings > 0 && (
          <span className="savings-badge absolute bottom-3 left-3">{savings}% OFF</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1" onClick={() => onView(book.id)}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Tag className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize font-medium">{book.category}</span>
        </div>
        <h3 className="text-sm font-bold line-clamp-2 mb-1 hover:text-primary transition-colors">{book.title}</h3>
        <p className="text-xs text-muted-foreground mb-2">{book.author}</p>

        {book.rating && (
          <div className="flex items-center gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(book.rating) ? "star-filled" : "text-muted-foreground/30"}`} fill={i < Math.round(book.rating) ? "currentColor" : "none"} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({book.reviews ?? 0})</span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-primary">₹{book.price}</span>
            {book.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{book.originalPrice}</span>
            )}
          </div>
          <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-xs">
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border/40">
    <div className="skeleton aspect-[3/4]" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-6 w-1/3 rounded mt-3" />
      <div className="skeleton h-8 w-full rounded-xl mt-2" />
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const BrowseBooksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [favorites, setFavorites]         = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [allBooks, setAllBooks]           = useState<Book[]>([]);
  const [searchTerm, setSearchTerm]       = useState(searchParams.get("search") ?? "");
  const [categoryFilter, setCategoryFilter]   = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"));

    const wl = localStorage.getItem("wishlist");
    if (wl) setFavorites(JSON.parse(wl).map((i: WishlistItem) => i.id));

    // Simulate short load
    const t = setTimeout(() => {
      loadBooks();
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const loadBooks = () => {
    const sbStr = localStorage.getItem("sellerBooks");
    if (sbStr) {
      try {
        const sb: SellerBook[] = JSON.parse(sbStr);
        const formatted: Book[] = sb
          .filter((b) => b.status === "Published")
          .map((b) => ({
            id: b.id, title: b.title, author: b.author,
            price: b.price, originalPrice: Math.round(b.price * 1.4),
            condition: b.condition,
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
            category: b.category || "reference",
            description: "No description provided.", pages: 300,
            publisher: "Unknown", publishedDate: "2023",
            isbn: "000-0-00-000000-0", seller: "Local Seller",
            sellerEmail: b.sellerEmail, rating: 4.5, reviews: 5, inStock: true,
          }));
        setAllBooks([...initialBooks, ...formatted]);
      } catch { setAllBooks(initialBooks); }
    } else {
      setAllBooks(initialBooks);
    }
  };

  const toggleFavorite = (id: number) => {
    if (!isLoggedIn) { toast.error("Sign in to save favourites"); return; }
    const book = allBooks.find((b) => b.id === id); if (!book) return;
    const wl: WishlistItem[] = JSON.parse(localStorage.getItem("wishlist") ?? "[]");
    const idx = wl.findIndex((i) => i.id === id);
    if (idx >= 0) {
      wl.splice(idx, 1);
      setFavorites((p) => p.filter((f) => f !== id));
      toast.success("Removed from wishlist");
    } else {
      wl.push({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image, condition: book.condition });
      setFavorites((p) => [...p, id]);
      toast.success("Added to wishlist!");
    }
    localStorage.setItem("wishlist", JSON.stringify(wl));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddToCart = (id: number) => {
    if (!isLoggedIn) { toast.error("Sign in to add to cart"); return; }
    const book = allBooks.find((b) => b.id === id); if (!book) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
    const idx = cart.findIndex((i) => i.id === id);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image, condition: book.condition, quantity: 1, sellerEmail: book.sellerEmail });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    toast.success(`"${book.title}" added to cart!`);
  };

  // Filter
  const filteredBooks = allBooks.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchCat    = categoryFilter === "all" || b.category === categoryFilter;
    const matchCond   = conditionFilter === "all" || b.condition.toLowerCase() === conditionFilter;
    let   matchPrice  = true;
    if (priceRangeFilter === "low")  matchPrice = b.price < 300;
    if (priceRangeFilter === "mid")  matchPrice = b.price >= 300 && b.price <= 600;
    if (priceRangeFilter === "high") matchPrice = b.price > 600;
    return matchSearch && matchCat && matchCond && matchPrice;
  });

  const activeFiltersCount = [
    categoryFilter !== "all", conditionFilter !== "all", priceRangeFilter !== "all", searchTerm !== "",
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearchTerm(""); setCategoryFilter("all"); setConditionFilter("all"); setPriceRangeFilter("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Hero */}
      <div className="pt-20" style={{ background: "var(--gradient-stats)" }}>
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <button
              onClick={() => navigate("/home")}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Browse Books
            </h1>
            <p className="text-white/70 text-lg">
              {allBooks.length}+ books available for students in Deoghar
            </p>
          </motion.div>
        </div>
      </div>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">

          {/* Search + Filter Bar */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-card p-4 mb-6 -mt-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title, author, subject…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop Selects */}
              <div className="hidden md:flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px] h-12 rounded-xl border-border/60">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="ncert">NCERT Books</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="competitive">Competitive</SelectItem>
                    <SelectItem value="government">Govt. Exams</SelectItem>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="nonfiction">Non-Fiction</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-[150px] h-12 rounded-xl border-border/60">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                  <SelectTrigger className="w-[150px] h-12 rounded-xl border-border/60">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="low">Under ₹300</SelectItem>
                    <SelectItem value="mid">₹300–₹600</SelectItem>
                    <SelectItem value="high">Above ₹600</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filter Button */}
              <button
                className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-xl text-sm font-medium border border-border/40 relative"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filters Panel */}
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-3 mt-3 pt-3 border-t border-border/40">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ncert">NCERT Books</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                        <SelectItem value="government">Govt. Exams</SelectItem>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="nonfiction">Non-Fiction</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={conditionFilter} onValueChange={setConditionFilter}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Condition" /></SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="all">All Conditions</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Price Range" /></SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="low">Under ₹300</SelectItem>
                        <SelectItem value="mid">₹300–₹600</SelectItem>
                        <SelectItem value="high">Above ₹600</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setCategoryFilter(chip.value)}
                className={`category-tab flex-shrink-0 ${categoryFilter === chip.value ? "category-tab-active" : "category-tab-inactive"}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Results Info Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading…" : (
                  <><span className="font-semibold text-foreground">{filteredBooks.length}</span> of {allBooks.length} books</>
                )}
              </p>
              {activeFiltersCount > 0 && (
                <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold border border-amber-200 rounded-full px-2.5 py-0.5 bg-amber-50 transition-colors">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Books Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredBooks.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              layout
            >
              <AnimatePresence>
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isFavorite={favorites.includes(book.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                    onView={(id) => navigate(`/book/${id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                We couldn't find any books matching your criteria. Try adjusting your search or filters.
              </p>
              <Button onClick={clearAll} className="bg-amber-500 hover:bg-amber-400 text-white rounded-xl px-6">
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseBooksPage;