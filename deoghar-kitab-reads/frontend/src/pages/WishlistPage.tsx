import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface WishlistItem {
  id: number;
  title: string;
  author: string;
  price: number;
  image: string;
  condition: string;
}

interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  image: string;
  condition: string;
  quantity: number;
}

import { BookCard } from "@/components/BookCard";
import { Book } from "@/lib/booksData";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const removeFromWishlist = (id: number) => {
    const item = wishlist.find(i => i.id === id);
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("storage"));
    if (item) {
      toast.success(`Removed "${item.title}" from wishlist`);
    }
  };

  const moveToCart = (item: WishlistItem) => {
    const existingCart = localStorage.getItem("cart");
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
    
    const existingItemIndex = cart.findIndex((cartItem: CartItem) => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: item.id,
        title: item.title,
        author: item.author,
        price: item.price,
        image: item.image,
        condition: item.condition,
        quantity: 1
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    
    removeFromWishlist(item.id);
    toast.success(`"${item.title}" moved to cart!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2 hover:bg-transparent hover:text-foreground text-muted-foreground pl-0"
            onClick={() => navigate("/browse")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Button>

          <AnimatePresence mode="wait">
            {wishlist.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto text-center py-16"
              >
                <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100/50">
                  <Heart className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Wishlist is Empty
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                  Start searching for textbooks or reference books and add them to your wishlist to buy them later.
                </p>
                <Button 
                  onClick={() => navigate("/browse")}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl px-6 h-12 shadow-md hover:shadow-amber-500/20 transition-all hover:scale-103"
                >
                  Browse Books
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="wishlist-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      My Wishlist
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Books you're tracking or saving for this term</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-bold text-amber-800 shadow-sm">
                    {wishlist.length} saved
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlist.map((item) => {
                    const bookItem: Book = {
                      id: item.id,
                      title: item.title,
                      author: item.author,
                      price: item.price,
                      originalPrice: Math.round(item.price * 1.4),
                      condition: item.condition,
                      image: item.image,
                      category: "Reference",
                      description: "Saved in wishlist.",
                      pages: 300,
                      publisher: "Unknown",
                      publishedDate: "2023",
                      isbn: "N/A",
                      seller: "Student Seller",
                      sellerEmail: "",
                      rating: 4.5,
                      reviews: 5,
                      inStock: true
                    };
                    return (
                      <BookCard
                        key={item.id}
                        book={bookItem}
                        isFavorite={true}
                        onToggleFavorite={() => removeFromWishlist(item.id)}
                        onAddToCart={() => moveToCart(item)}
                        onView={(id) => navigate(`/book/${id}`)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;