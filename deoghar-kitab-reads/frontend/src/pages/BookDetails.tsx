import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Heart, 
  ShoppingCart, 
  Star, 
  Check, 
  Shield, 
  Truck, 
  RotateCcw,
  ArrowLeft,
  Phone,
  Bookmark,
  Calendar,
  Building,
  Hash,
  User,
  Info,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { initialBooks } from "@/lib/booksData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

export interface ExtendedBook {
  id: number | string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: string;
  image: string;
  description: string;
  category: string;
  pages: number;
  publisher: string;
  publishedDate: string;
  isbn: string;
  seller: string;
  sellerEmail?: string;
  sellerId?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface SellerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  showPhone: boolean;
}

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
  sellerEmail?: string;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  Excellent: { label: "Excellent Condition", className: "badge-excellent" },
  Good:      { label: "Good Condition",      className: "badge-good" },
  Fair:      { label: "Fair Condition",      className: "badge-fair" },
};

const BookDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const { getAuthHeaders, user: authUser } = useAuth();
  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"));
    
    // Load favorites from wishlist
    const wl = localStorage.getItem("wishlist");
    if (wl) {
      setFavorites(JSON.parse(wl).map((item: WishlistItem) => item.id));
    }

    const fetchBookFromBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}`);
        if (response.ok) {
          const dbBook = await response.json();
          // Transform database book to match our ExtendedBook interface
          const transformedBook: ExtendedBook = {
            id: dbBook._id,
            title: dbBook.title,
            author: dbBook.author,
            price: dbBook.price,
            originalPrice: Math.round(dbBook.price * 1.4),
            condition: dbBook.condition,
            image: (dbBook.images && dbBook.images[0]) || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
            description: dbBook.description || "No description provided.",
            category: dbBook.category || "reference",
            pages: 300,
            publisher: "Unknown",
            publishedDate: "2023",
            isbn: "000-0-00-000000-0",
            seller: dbBook.sellerName || "Local Seller",
            sellerEmail: dbBook.contactInfo?.email || (dbBook.seller && dbBook.seller.email),
            sellerId: dbBook.seller?._id || dbBook.seller, // Store the seller's user ID!
            rating: 4.5,
            reviews: 5,
            inStock: dbBook.status === "available",
          };
          setBook(transformedBook);
          
          if (dbBook.seller && typeof dbBook.seller === 'object') {
            setSellerData({
              name: dbBook.sellerName || dbBook.seller.name || "Seller",
              email: dbBook.seller.email || "",
              phone: dbBook.contactInfo?.phone || "",
              location: "",
              bio: "",
              showPhone: !!dbBook.contactInfo?.phone
            });
          }
        }
      } catch (err) {
        console.error("Error fetching book from backend:", err);
      }
    };

    if (id && id.length === 24) {
      // It's a MongoDB ObjectId!
      fetchBookFromBackend();
    } else {
      const bookId = parseInt(id || "1");
      // Find in static books
      let foundBook = initialBooks.find(b => b.id === bookId);
      
      // If not found in static books, search in sellerBooks from localStorage
      if (!foundBook) {
        const sellerBooksString = localStorage.getItem("sellerBooks");
        if (sellerBooksString) {
          try {
            const sellerBooks = JSON.parse(sellerBooksString);
            const sellerBook = sellerBooks.find((b: any) => b.id === id || b.id === bookId);
            if (sellerBook) {
              foundBook = {
                id: sellerBook.id,
                title: sellerBook.title,
                author: sellerBook.author,
                price: sellerBook.price,
                originalPrice: sellerBook.price * 1.4,
                condition: sellerBook.condition,
                image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
                description: sellerBook.description || "No description provided by the seller.",
                category: sellerBook.category || "reference",
                pages: 300,
                publisher: "Unknown Publisher",
                publishedDate: "2023",
                isbn: "000-0-00-000000-0",
                seller: "Local Seller",
                sellerEmail: sellerBook.sellerEmail,
                rating: 4.5,
                reviews: 5,
                inStock: true,
              };
            }
          } catch (e) {
            console.error("Error loading seller book details:", e);
          }
        }
      }

      if (foundBook) {
        setBook({
          ...foundBook,
          id: foundBook.id
        });
        // Load seller profile data
        const sellerDataString = localStorage.getItem(`seller_${foundBook.sellerEmail}`);
        if (sellerDataString) {
          setSellerData(JSON.parse(sellerDataString));
        }
      } else {
        // Fallback: try loading from backend
        fetchBookFromBackend();
      }
    }
  }, [id, navigate]);

  const toggleFavorite = (id: number | string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add books to wishlist");
      return;
    }
    if (!book) return;

    const wl: WishlistItem[] = JSON.parse(localStorage.getItem("wishlist") ?? "[]");
    const idx = wl.findIndex((i) => String(i.id) === String(id));

    if (idx >= 0) {
      wl.splice(idx, 1);
      setFavorites(prev => prev.filter(fav => String(fav) !== String(id)));
      toast.success("Removed from wishlist");
    } else {
      wl.push({
        id: book.id as number,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image,
        condition: book.condition,
      });
      setFavorites(prev => [...prev, id as number]);
      toast.success("Added to wishlist!");
    }
    localStorage.setItem("wishlist", JSON.stringify(wl));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add books to cart");
      return;
    }
    if (!book) return;
    
    const existingCart = localStorage.getItem("cart");
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
    
    const existingItemIndex = cart.findIndex((item: CartItem) => String(item.id) === String(book.id));
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: book.id as number,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image,
        condition: book.condition,
        quantity: quantity,
        sellerEmail: book.sellerEmail
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    toast.success(`Added ${quantity} copy(ies) of "${book.title}" to cart!`);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to purchase books");
      return;
    }
    if (!book) return;
    
    handleAddToCart();
    navigate("/cart");
  };

  const handleCallSeller = () => {
    if (sellerData && sellerData.phone) {
      window.location.href = `tel:${sellerData.phone}`;
    }
  };

  const handleChatWithSeller = async () => {
    if (!isLoggedIn || !authUser) {
      toast.error("Please sign in to chat with the seller");
      navigate("/");
      return;
    }

    if (!book) return;

    let resolvedSellerId = book.sellerId;

    if (!resolvedSellerId) {
      const sellerEmail = book.sellerEmail || (book.contactInfo && book.contactInfo.email);
      if (!sellerEmail) {
        toast.error("Seller contact email not found for this book");
        return;
      }
      
      try {
        toast.loading("Connecting to seller...");
        const res = await fetch(`${API_BASE_URL}/api/chats/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            bookId: book.id,
            sellerEmail: sellerEmail
          })
        });
        toast.dismiss();
        if (res.ok) {
          const chat = await res.json();
          toast.success("Chat opened successfully!");
          navigate(`/chat/${chat._id}`);
          return;
        } else {
          const errorData = await res.json();
          toast.error(errorData.message || "Failed to start chat");
          return;
        }
      } catch (err) {
        toast.dismiss();
        console.error("Error starting chat:", err);
        toast.error("Failed to connect to the chat server");
        return;
      }
    }

    if (String(authUser.id || authUser._id) === String(resolvedSellerId)) {
      toast.error("You cannot chat with yourself (you are the seller of this book)");
      return;
    }

    try {
      toast.loading("Opening chat room...");
      const res = await fetch(`${API_BASE_URL}/api/chats/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          bookId: book.id,
          sellerId: resolvedSellerId
        })
      });
      toast.dismiss();
      if (res.ok) {
        const chat = await res.json();
        toast.success("Chat opened successfully!");
        navigate(`/chat/${chat._id}`);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to start chat");
      }
    } catch (err) {
      toast.dismiss();
      console.error("Error starting chat:", err);
      toast.error("Failed to connect to the chat server");
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleReserveBook = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to place a book hold reservation");
      return;
    }
    if (!book) return;

    // Create a local hold reservation record
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
    navigate("/reservations");
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-muted-foreground font-semibold">Loading book details...</p>
        </div>
      </div>
    );
  }

  const cond = conditionConfig[book.condition] ?? { label: book.condition, className: "badge-fair" };
  const savings = book.originalPrice ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;
  const isFavorite = favorites.includes(book.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back button / Breadcrumb */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground flex items-center gap-2 pl-0 hover:bg-transparent"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            {/* Left side: Images */}
            <div className="lg:col-span-5 space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-card border border-border/40 shadow-card"
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                
                {savings > 0 && (
                  <span className="savings-badge absolute top-4 left-4 text-sm px-3.5 py-1.5 shadow-md">
                    {savings}% OFF
                  </span>
                )}
                
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md shadow-lg transition-all ${
                    isFavorite 
                      ? "bg-rose-500 text-white hover:bg-rose-600" 
                      : "bg-white/90 text-gray-600 hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </motion.div>
              
              {/* Image Thumbnails */}
              <div className="flex gap-3 justify-center md:justify-start">
                {[0, 1, 2].map((index) => (
                  <button 
                    key={index}
                    className={`aspect-square w-20 overflow-hidden rounded-2xl cursor-pointer border-2 transition-all shadow-sm ${
                      selectedImage === index ? "border-amber-500 ring-2 ring-amber-100" : "border-border/40 hover:border-amber-300"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={book.image}
                      alt={`${book.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Core Book info & pricing */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className={`inline-block mb-3 ${cond.className}`}>{cond.label}</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {book.title}
                </h1>
                <p className="text-lg text-muted-foreground font-medium mb-4">by <span className="text-foreground">{book.author}</span></p>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(book.rating)
                            ? "fill-amber-500 text-amber-500 animate-pulse-scale"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground ml-1">
                    {book.rating} ({book.reviews} reviews)
                  </span>
                </div>
                
                <div className="bg-muted/40 border border-border/40 rounded-3xl p-6 mb-6">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span className="text-3xl font-extrabold text-primary">₹{book.price}</span>
                    {book.originalPrice && (
                      <span className="text-base text-muted-foreground line-through">₹{book.originalPrice}</span>
                    )}
                  </div>
                  {book.originalPrice && (
                    <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      You save ₹{book.originalPrice - book.price} ({savings}% savings)
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quantity Selection */}
              <div className="flex items-center gap-4 py-1.5 border-y border-border/40">
                <span className="font-semibold text-sm text-muted-foreground">Quantity:</span>
                <div className="flex items-center bg-muted border border-border/40 rounded-xl p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg" 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg" 
                    onClick={incrementQuantity}
                  >
                    +
                  </Button>
                </div>
                <div className="ml-auto font-bold text-lg text-foreground">
                  Total: <span className="text-primary font-extrabold">₹{book.price * quantity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={handleBuyNow}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl h-14 shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2.5"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleAddToCart}
                    className="flex-1 border-border/60 hover:bg-muted font-bold rounded-2xl h-14 transition-all flex items-center justify-center gap-2.5"
                  >
                    <Heart className="w-5 h-5 text-rose-500" />
                    Add to Cart
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    onClick={handleReserveBook}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl h-14 shadow-lg transition-all flex items-center justify-center gap-2.5"
                  >
                    <Bookmark className="w-5 h-5 text-amber-300" />
                    Reserve Free Hold (24h)
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleChatWithSeller}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl h-14 shadow-lg transition-all flex items-center justify-center gap-2.5"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat with Seller
                  </Button>
                </div>
              </div>

              {/* Seller Contact Card */}
              {sellerData && sellerData.showPhone && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-100 rounded-3xl p-5 mt-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 shadow-sm">
                        <Phone className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-900 text-sm">Direct Student Seller Contact</p>
                        <p className="text-xs text-amber-800/80 mb-0.5">{sellerData.name}</p>
                        <p className="text-sm font-bold text-amber-950">{sellerData.phone}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCallSeller} 
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl px-5 h-11 shadow-sm transition-all hover:scale-102 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Trust/Perk Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/40">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/20">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Free Campus Pick</p>
                    <p className="text-[10px] text-muted-foreground">Within 1-2 study days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/20">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Student Quality Check</p>
                    <p className="text-[10px] text-muted-foreground">7 Days return window</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/20">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">100% Student Safe</p>
                    <p className="text-[10px] text-muted-foreground">Verified buyer protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Cards section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            {/* Book Specs */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="rounded-3xl border border-border/40 shadow-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/30 px-6 py-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-500" />
                    Book Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3.5">
                  {[
                    { icon: Bookmark, label: "Category", value: book.category, class: "capitalize" },
                    { icon: BookOpen, label: "Pages", value: `${book.pages} Pages` },
                    { icon: Building, label: "Publisher", value: book.publisher },
                    { icon: Calendar, label: "Published Year", value: book.publishedDate },
                    { icon: Hash, label: "ISBN / Identifier", value: book.isbn },
                    { icon: User, label: "Seller Type", value: book.seller },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between items-center text-sm pb-2.5 border-b border-border/10 last:border-0 last:pb-0">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <spec.icon className="w-4 h-4 text-muted-foreground/75" />
                        {spec.label}
                      </span>
                      <span className={`font-semibold text-foreground ${spec.class || ""}`}>{spec.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Condition Check & Description */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-3xl border border-border/40 shadow-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/30 px-6 py-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Check className="w-4.5 h-4.5 text-emerald-500" />
                    Verified Condition Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mt-0.5 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">Pages are complete, clean, and fully readable</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mt-0.5 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">Binding is strong, robust, and secure</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mt-0.5 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">Cover holds minimal student pencil markings only</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mt-0.5 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">Perfect reference companion for exam prep</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border/40 shadow-card">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-base font-bold">Seller's Description</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookDetails;