import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, BookOpen, Star, Clock, Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  condition: string;
  category: string;
  sellerName: string;
  distance: number;
  rating: number;
  pickupTime: string;
  stock: number;
  locationName: string;
  shopType: string;
}

export default function NearbySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("distance");
  const [shopType, setShopType] = useState("all");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [reservationBook, setReservationBook] = useState<Book | null>(null);
  const [resDuration, setResDuration] = useState("24");

  // Fetch coordinates on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocating(false);
        toast.success("Location locked successfully!");
      },
      (error) => {
        console.error("Location error:", error);
        // Fallback to Deoghar coordinates
        setCoords({ latitude: 24.4822, longitude: 86.7003 });
        setLocating(false);
        toast.info("Using default campus location (Deoghar).");
      }
    );
  };

  // Fetch nearby books
  useEffect(() => {
    if (coords) {
      fetchNearbyBooks();
    }
  }, [coords, sortBy, shopType, searchTerm]);

  const fetchNearbyBooks = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }

      const queryParams = new URLSearchParams({
        latitude: coords?.latitude.toString() || "24.4822",
        longitude: coords?.longitude.toString() || "86.7003",
        query: searchTerm,
        sortBy,
        shopType
      });

      const response = await fetch(`${API_BASE_URL}/api/books/nearby?${queryParams.toString()}`, {
        headers
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.warn("Fallback to client simulation for Nearby Books:", err);
      // Fallback offline mock books
      const mockNearby: Book[] = [
        {
          _id: "mock-book-1",
          title: "NCERT Class 12 Physics Part 1",
          author: "NCERT Editorial",
          price: 150,
          condition: "Good",
          category: "ncert",
          sellerName: "Sharda Pustak Mandir",
          distance: 1.2,
          rating: 4.8,
          pickupTime: "Instant",
          stock: 4,
          locationName: "Tower Chowk, Deoghar",
          shopType: "bookstore"
        },
        {
          _id: "mock-book-2",
          title: "H.C. Verma Concepts of Physics",
          author: "H.C. Verma",
          price: 320,
          condition: "Like New",
          category: "reference",
          sellerName: "Modern Book Depot",
          distance: 2.5,
          rating: 4.9,
          pickupTime: "1-2 Hours",
          stock: 2,
          locationName: "College Road, Deoghar",
          shopType: "bookstore"
        },
        {
          _id: "mock-book-3",
          title: "RD Sharma Class 10 Mathematics",
          author: "R.D. Sharma",
          price: 280,
          condition: "Fair",
          category: "reference",
          sellerName: "Raju Bookstore",
          distance: 0.8,
          rating: 4.2,
          pickupTime: "Same Day",
          stock: 1,
          locationName: "Baidyanathdham, Deoghar",
          shopType: "bookstore"
        },
        {
          _id: "mock-book-4",
          title: "Wren & Martin English Grammar",
          author: "Wren & Martin",
          price: 180,
          condition: "New",
          category: "reference",
          sellerName: "Deepak Library",
          distance: 3.1,
          rating: 4.6,
          pickupTime: "Next Day",
          stock: 5,
          locationName: "Castairs Town, Deoghar",
          shopType: "library"
        }
      ].filter(b => {
        const matchesQuery = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesShop = shopType === "all" || b.shopType === shopType;
        return matchesQuery && matchesShop;
      });

      // Sort mocks manually
      if (sortBy === "distance") mockNearby.sort((a, b) => a.distance - b.distance);
      else if (sortBy === "price") mockNearby.sort((a, b) => a.price - b.price);
      else if (sortBy === "rating") mockNearby.sort((a, b) => b.rating - a.rating);

      setBooks(mockNearby);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!reservationBook) return;

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        toast.error("Please log in to reserve this book");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          bookId: reservationBook._id,
          durationHours: resDuration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Reservation failed");
      }

      toast.success(`Book reserved! QR code generated inside Dashboard.`);
      setReservationBook(null);
      fetchNearbyBooks();
    } catch (err: any) {
      console.warn("Simulating offline reservation:", err.message);
      // Simulate local state reservation
      const offlineReservations = JSON.parse(localStorage.getItem("offline_reservations") || "[]");
      const newRes = {
        book: reservationBook,
        reservationId: `DK-RES-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
        status: "pending",
        expiresAt: new Date(Date.now() + Number(resDuration) * 60 * 60 * 1000).toISOString(),
        price: reservationBook.price
      };
      offlineReservations.push(newRes);
      localStorage.setItem("offline_reservations", JSON.stringify(offlineReservations));

      toast.success(`Reserved "${reservationBook.title}" (Simulated Offline)!`);
      setReservationBook(null);
    }
  };

  const handleRequestRedirect = () => {
    window.location.href = "/requests";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 max-w-7xl mx-auto w-full">
        {/* Header Block */}
        <div className="text-center space-y-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Smart Local Search
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Nearby Book Search
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Discover books from bookstores, libraries, and fellow students closest to you in Deoghar.
          </motion.p>
        </div>

        {/* Search controls card */}
        <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search titles, authors, or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 rounded-2xl border-border/60 bg-background/50 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={detectLocation}
                disabled={locating}
                className="py-6 px-4 rounded-2xl flex gap-2 border-border/60 hover:bg-muted"
              >
                <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                {coords ? "Relocate" : "Locate Me"}
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl border border-border/60">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              <Select value={shopType} onValueChange={setShopType}>
                <SelectTrigger className="w-[180px] h-12 rounded-2xl border border-border/60">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Partner Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Sellers</SelectItem>
                  <SelectItem value="bookstore">Bookstores</SelectItem>
                  <SelectItem value="library">Libraries</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {coords && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <MapPin className="w-4 h-4" />
              <span>Location coordinates: Lat {coords.latitude.toFixed(4)}, Lng {coords.longitude.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-60 rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {books.map((book) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-border/40 bg-card/45 backdrop-blur-md p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                        {book.shopType}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{book.rating}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <div className="pt-2 space-y-2 text-sm text-muted-foreground border-t border-border/20">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1">{book.locationName} ({book.distance.toFixed(1)} km away)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Pickup: {book.pickupTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Price</span>
                      <p className="text-2xl font-black text-primary">₹{book.price}</p>
                    </div>
                    <Button 
                      onClick={() => setReservationBook(book)}
                      className="rounded-2xl px-6 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95"
                    >
                      Reserve Book
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/60">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/60 mb-4" />
            <h3 className="text-2xl font-bold">No books found nearby</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
              We couldn't find matches. Would you like to request this book from nearby shops?
            </p>
            <Button onClick={handleRequestRedirect} className="rounded-2xl px-8">
              Request This Book
            </Button>
          </div>
        )}
      </main>

      {/* Reservation Dialog Modal */}
      {reservationBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold">Lock Book Reservation</h2>
              <p className="text-muted-foreground text-sm">Lock inventory instantly. Collect it from store.</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 space-y-2">
              <p className="font-bold text-lg">{reservationBook.title}</p>
              <p className="text-sm text-muted-foreground">Seller: {reservationBook.sellerName}</p>
              <p className="text-primary font-bold">Price: ₹{reservationBook.price}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Hold Duration</label>
              <Select value={resDuration} onValueChange={setResDuration}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Hold time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hours (Express)</SelectItem>
                  <SelectItem value="24">24 Hours (Standard)</SelectItem>
                  <SelectItem value="48">48 Hours (Extended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setReservationBook(null)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl" onClick={handleReserve}>
                Confirm Hold
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </div>
  );
}
