import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Heart, ShoppingCart, Star, BookOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { initialBooks, Book } from "@/lib/booksData";
import { toast } from "sonner";

interface SellerBook {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  status: string;
  date: string;
  sales: number;
  revenue: number;
  sellerEmail: string;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  Excellent: { label: "Excellent", className: "badge-excellent" },
  Good:      { label: "Good",      className: "badge-good" },
  Fair:      { label: "Fair",      className: "badge-fair" },
};

const BookCard = ({
  book,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: (id: number) => void;
}) => {
  const savings = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;
  const condition = conditionConfig[book.condition] ?? { label: book.condition, className: "badge-fair" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="book-card group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] rounded-t-2xl">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onToggleFavorite(book.id)}
            className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all duration-200 ${
              isFavorite
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-gray-600 hover:bg-rose-500 hover:text-white"
            }`}
            title="Add to wishlist"
          >
            <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => onAddToCart(book.id)}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-lg text-gray-600 hover:bg-amber-500 hover:text-white transition-all duration-200"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Condition badge */}
        <span className={`absolute top-3 left-3 ${condition.className}`}>
          {condition.label}
        </span>

        {/* Savings badge */}
        {savings > 0 && (
          <span className="savings-badge absolute bottom-3 left-3">
            {savings}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <div className="flex items-center gap-1.5 mb-2">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize font-medium">{book.category}</span>
        </div>

        <a href={`/book/${book.id}`} className="block mb-1 hover:text-primary transition-colors">
          <h3 className="text-base font-bold line-clamp-2 leading-snug">{book.title}</h3>
        </a>
        <p className="text-sm text-muted-foreground mb-3">{book.author}</p>

        {/* Rating */}
        {book.rating && (
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(book.rating) ? "star-filled" : "text-muted-foreground/30"}`}
                fill={i < Math.round(book.rating) ? "currentColor" : "none"}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({book.reviews ?? 0})</span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-primary">₹{book.price}</span>
            {book.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{book.originalPrice}</span>
            )}
          </div>

          <a href={`/book/${book.id}`} className="block w-full">
            <Button
              size="sm"
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all hover:shadow-lg"
            >
              View Details
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const BrowseBooks = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    setIsLoggedIn(!!userString);

    // Load wishlist
    const wishlist = localStorage.getItem("wishlist");
    if (wishlist) {
      const items = JSON.parse(wishlist);
      setFavorites(items.map((i: { id: number }) => i.id));
    }

    loadBooks();
  }, []);

  const loadBooks = () => {
    const sellerBooksString = localStorage.getItem("sellerBooks");
    if (sellerBooksString) {
      try {
        const sellerBooks: SellerBook[] = JSON.parse(sellerBooksString);
        const publishedBooks = sellerBooks.filter((b) => b.status === "Published");
        const formatted: Book[] = publishedBooks.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          price: b.price,
          originalPrice: Math.round(b.price * 1.4),
          condition: b.condition,
          image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
          category: "reference",
          description: "No description provided by the seller.",
          pages: 300,
          publisher: "Unknown Publisher",
          publishedDate: "2023",
          isbn: "000-0-00-000000-0",
          seller: "Local Seller",
          sellerEmail: b.sellerEmail,
          rating: 4.5,
          reviews: 5,
          inStock: true,
        }));
        setBooks([...initialBooks, ...formatted]);
      } catch {
        setBooks(initialBooks);
      }
    }
  };

  interface WishlistItem { id: number; title: string; author: string; price: number; image: string; condition: string; }
  interface CartItem { id: number; title: string; author: string; price: number; image: string; condition: string; quantity: number; sellerEmail?: string; }

  const toggleFavorite = (id: number) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add books to favourites");
      return;
    }
    const book = books.find((b) => b.id === id);
    if (!book) return;
    const existing = localStorage.getItem("wishlist");
    const wishlist: WishlistItem[] = existing ? JSON.parse(existing) : [];
    const idx = wishlist.findIndex((i) => i.id === book.id);
    if (idx >= 0) {
      wishlist.splice(idx, 1);
      setFavorites((prev) => prev.filter((f) => f !== id));
      toast.success("Removed from wishlist");
    } else {
      wishlist.push({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image, condition: book.condition });
      setFavorites((prev) => [...prev, id]);
      toast.success("Added to wishlist!");
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddToCart = (id: number) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add books to cart");
      return;
    }
    const book = books.find((b) => b.id === id);
    if (!book) return;
    const existing = localStorage.getItem("cart");
    const cart: CartItem[] = existing ? JSON.parse(existing) : [];
    const idx = cart.findIndex((i) => i.id === book.id);
    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ id: book.id, title: book.title, author: book.author, price: book.price, image: book.image, condition: book.condition, quantity: 1, sellerEmail: book.sellerEmail });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    toast.success(`"${book.title}" added to cart!`);
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchSearch = searchTerm === "" || b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = selectedGenre === "all" || b.category === selectedGenre;
    const matchCondition = selectedCondition === "all" || b.condition.toLowerCase() === selectedCondition.toLowerCase();
    return matchSearch && matchGenre && matchCondition;
  }).slice(0, 6);

  return (
    <section id="browse" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <BookOpen className="w-4 h-4" />
            Featured Books
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 section-title">
            {t.browse.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.browse.subtitle}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col md:flex-row gap-4 items-stretch"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t.browse.searchPlaceholder}
              className="pl-12 h-12 rounded-xl border-border/60 focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="md:w-[180px] h-12 rounded-xl border-border/60">
              <SelectValue placeholder={t.browse.genre} />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ncert">{t.browse.ncert}</SelectItem>
              <SelectItem value="reference">{t.browse.reference}</SelectItem>
              <SelectItem value="competitive">{t.browse.competitive}</SelectItem>
              <SelectItem value="government">{t.browse.government}</SelectItem>
              <SelectItem value="fiction">{t.browse.fiction}</SelectItem>
              <SelectItem value="nonfiction">{t.browse.nonfiction}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCondition} onValueChange={setSelectedCondition}>
            <SelectTrigger className="md:w-[180px] h-12 rounded-xl border-border/60">
              <SelectValue placeholder={t.browse.condition} />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="excellent">{t.browse.excellent}</SelectItem>
              <SelectItem value="good">{t.browse.good}</SelectItem>
              <SelectItem value="fair">{t.browse.fair}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No books found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <BookCard
                  book={book}
                  isFavorite={favorites.includes(book.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* View More */}
        <div className="text-center mt-14">
          <a href="/browse">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-400 text-white px-10 py-3 text-lg font-semibold rounded-2xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
            >
              {t.browse.viewMoreBooks} →
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default BrowseBooks;