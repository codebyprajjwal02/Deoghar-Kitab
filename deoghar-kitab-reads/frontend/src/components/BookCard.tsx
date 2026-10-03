import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Star, Tag, MapPin, User, Eye, ShieldCheck, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Book } from "@/lib/booksData";
import { toast } from "sonner";

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onAddToCart: (id: number) => void;
  onView?: (id: number) => void;
  onReserve?: (book: Book) => void;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  Excellent: { label: "Excellent", className: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400" },
  Good:      { label: "Good",      className: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400" },
  Fair:      { label: "Fair",      className: "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400" },
};

export const BookCard = ({
  book,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onView,
  onReserve,
}: BookCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const savings = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  const condition = conditionConfig[book.condition] ?? {
    label: book.condition,
    className: "bg-slate-500/10 text-slate-600 border border-slate-500/20"
  };

  const handleCardClick = () => {
    if (onView) {
      onView(book.id);
    }
  };

  const handleQuickReserve = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReserve) {
      onReserve(book);
      return;
    }

    // Mock flow if no custom handler is provided
    const offlineReservations = JSON.parse(localStorage.getItem("offline_reservations") || "[]");
    const newRes = {
      book: { title: book.title, author: book.author, price: book.price, locationName: "Campus Book Store" },
      reservationId: `DK-RES-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      price: book.price,
      seller: { name: book.seller || "Student Seller" }
    };
    offlineReservations.push(newRes);
    localStorage.setItem("offline_reservations", JSON.stringify(offlineReservations));
    toast.success(`Book reserved! Code generated in Reservations Desk.`);
  };

  // Generate a random local distance for realistic feel
  const mockDistance = (book.id * 1.3 % 4 + 0.4).toFixed(1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="group relative flex flex-col bg-card/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-[24px] border border-border/40 shadow-sm hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 overflow-hidden h-full"
      >
        {/* Cover Image Container */}
        <div className="relative overflow-hidden aspect-[3/4] w-full bg-muted/20">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onClick={handleCardClick}
          />
          
          {/* Soft Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

          {/* Action buttons (top right overlay) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(book.id);
              }}
              className={`p-2.5 rounded-2xl backdrop-blur-md shadow-lg transition-all duration-300 border ${
                isFavorite
                  ? "bg-rose-500 border-rose-600 text-white"
                  : "bg-white/90 border-gray-200/50 text-gray-700 hover:bg-rose-500 hover:text-white dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300"
              }`}
              title="Add to Wishlist"
            >
              <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="p-2.5 rounded-2xl bg-white/90 border border-gray-200/50 backdrop-blur-md shadow-lg text-gray-700 hover:bg-amber-500 hover:text-white dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300 transition-all duration-300"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Condition Badge (top left) */}
          <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-sm z-10 ${condition.className}`}>
            {condition.label}
          </span>

          {/* Price Badge (bottom right) */}
          <div className="absolute bottom-3 right-3 bg-amber-500/90 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md z-10">
            ₹{book.price}
          </div>

          {/* Savings Badge (bottom left) */}
          {savings > 0 && (
            <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wide uppercase px-2 py-1 rounded-xl shadow-md z-10">
              {savings}% OFF
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 flex flex-col flex-1 cursor-pointer" onClick={handleCardClick}>
          {/* Category & Location Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-lg">
              <Tag className="w-2.5 h-2.5 text-amber-500" />
              {book.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-lg">
              <MapPin className="w-2.5 h-2.5 text-emerald-500" />
              {mockDistance} km away
            </span>
          </div>

          {/* Book Title & Author */}
          <h3 className="font-bold text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-1 leading-snug">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 font-medium">by {book.author}</p>

          {/* Ratings & Reviews */}
          {book.rating && (
            <div className="flex items-center gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(book.rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
                />
              ))}
              <span className="text-[10px] font-bold text-muted-foreground ml-1.5">({book.reviews ?? 0})</span>
            </div>
          )}

          {/* Seller details & Dynamic buttons */}
          <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground truncate" title={book.seller || "Student Seller"}>
                {book.seller?.split(" ")[0] || "Seller"}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={handleQuickReserve}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-[10px] h-8 px-2.5 transition-all shadow-sm flex items-center gap-1"
                title="Hold book for offline pickup"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                Hold
              </Button>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(book.id);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-[10px] h-8 px-2.5 transition-all shadow-sm hover:shadow-amber-500/20 flex items-center gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-2xl rounded-3xl overflow-hidden border border-border/40 shadow-2xl bg-card p-0 gap-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Image section */}
            <div className="md:col-span-5 relative aspect-[3/4] bg-muted/30 md:h-full">
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-xl shadow-sm ${condition.className}`}>
                {condition.label}
              </span>
              {savings > 0 && (
                <span className="absolute bottom-4 left-4 bg-emerald-500 text-white text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-xl shadow-md">
                  {savings}% OFF
                </span>
              )}
            </div>

            {/* Book info section */}
            <div className="md:col-span-7 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-lg">
                    <Tag className="w-3 h-3 text-amber-500" />
                    {book.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" /> {mockDistance} km away
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-foreground leading-snug mb-1">
                  {book.title}
                </h2>
                <p className="text-sm text-muted-foreground font-semibold mb-3">by {book.author}</p>

                {book.rating && (
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(book.rating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1.5">({book.reviews ?? 0} reviews)</span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground line-clamp-4 leading-relaxed mb-4">
                  {book.description || "No description provided."}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-muted/40 p-3 rounded-2xl border border-border/20">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Publisher</span>
                    <p className="text-xs font-bold truncate">{book.publisher || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">ISBN</span>
                    <p className="text-xs font-bold truncate">{book.isbn || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-primary">₹{book.price}</span>
                      {book.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">₹{book.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Seller</span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      {book.seller || "Student Seller"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsQuickViewOpen(false);
                      onAddToCart(book.id);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl h-11 transition-all"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      setIsQuickViewOpen(false);
                      handleQuickReserve(e);
                    }}
                    className="border-border/60 hover:bg-muted font-bold rounded-2xl h-11 px-4"
                  >
                    Reserve Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
