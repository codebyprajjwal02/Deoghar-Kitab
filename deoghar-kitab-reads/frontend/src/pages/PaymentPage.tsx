import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Lock, 
  CheckCircle,
  ArrowLeft,
  BookOpen,
  MapPin,
  ShieldCheck,
  Building,
  Truck,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { initialBooks, Book } from "@/lib/booksData";

interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  image: string;
  condition: string;
  quantity: number;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  Excellent: { label: "Excellent", className: "badge-excellent text-[10px]" },
  Good:      { label: "Good",      className: "badge-good text-[10px]" },
  Fair:      { label: "Fair",      className: "badge-fair text-[10px]" },
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [randomOrderId, setRandomOrderId] = useState("");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    address: "",
    city: "",
    zip: "",
  });

  useEffect(() => {
    const bookId = parseInt(id || "1");
    let foundBook = initialBooks.find(b => b.id === bookId);
    
    if (!foundBook) {
      const sellerBooksString = localStorage.getItem("sellerBooks");
      if (sellerBooksString) {
        try {
          const sellerBooks = JSON.parse(sellerBooksString);
          const sellerBook = sellerBooks.find((b: any) => b.id === bookId && b.status === "Published");
          if (sellerBook) {
            foundBook = {
              id: sellerBook.id,
              title: sellerBook.title,
              author: sellerBook.author,
              price: sellerBook.price,
              originalPrice: sellerBook.price * 1.4,
              condition: sellerBook.condition,
              image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
              description: "No description provided by the seller.",
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
      setBook(foundBook);
    } else {
      toast.error("Book not found");
      navigate("/home");
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setRandomOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
    setOrderPlaced(true);
    toast.success("Order placed successfully!");
    
    // Clear cart item since it's purchased
    if (book) {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
      const updatedCart = cart.filter(i => i.id !== book.id);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleContinueShopping = () => {
    navigate("/home");
  };

  const inputCls = "h-11 bg-white/80 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all rounded-xl text-sm";

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full px-4"
          >
            <Card className="text-center rounded-3xl border border-border/50 shadow-card p-6">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 animate-pulse-scale">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-extrabold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Order Confirmed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thank you for supporting student reuse! Your order has been placed and registered successfully.
                </p>
                <div className="bg-muted/50 border border-border/40 p-5 rounded-2xl space-y-2 text-sm text-left">
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Order Reference</span>
                    <span className="text-foreground">{randomOrderId}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Delivery Window</span>
                    <span className="text-emerald-700">1-3 Study Days (Campus)</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-4">
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl h-12 shadow-md hover:shadow-amber-500/20 transition-all" 
                  onClick={handleContinueShopping}
                >
                  Continue Browsing
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full hover:bg-muted font-semibold text-xs rounded-xl" 
                  onClick={() => navigate("/profile")}
                >
                  Go to Profile Dashboard
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-muted-foreground font-semibold">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const cond = conditionConfig[book.condition] ?? { label: book.condition, className: "badge-fair text-[10px]" };
  const subtotal = book.price;
  const tax = Math.round(book.price * 0.18);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2 hover:bg-transparent hover:text-foreground text-muted-foreground pl-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Secure Checkout
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Order Summary sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="rounded-3xl border border-border/50 shadow-card overflow-hidden">
                  <CardHeader className="px-6 py-4 bg-muted/20 border-b border-border/20">
                    <CardTitle className="text-sm font-bold text-muted-foreground">Order Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="aspect-[3/4] w-16 overflow-hidden rounded-xl border border-border/30 bg-muted flex-shrink-0">
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mb-1">by {book.author}</p>
                        <span className={cond.className}>{cond.label}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-border/20 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold text-foreground">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span className="font-semibold text-foreground">₹{tax}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-base pt-3 border-t border-border/20">
                        <span>Grand Total</span>
                        <span className="text-primary">₹{total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment Details Main Form */}
              <div className="lg:col-span-8">
                <Card className="rounded-3xl border border-border/50 shadow-card overflow-hidden">
                  <CardContent className="p-6">
                    <form onSubmit={handlePayment} className="space-y-6">
                      {/* Payment Method Selector */}
                      <div>
                        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
                          <CreditCard className="w-4.5 h-4.5 text-amber-500" />
                          Choose Payment Option
                        </h3>
                        <RadioGroup 
                          value={paymentMethod} 
                          onValueChange={setPaymentMethod} 
                          className="grid grid-cols-1 md:grid-cols-3 gap-3"
                        >
                          <div className={`flex items-center space-x-2 border rounded-2xl p-4 cursor-pointer transition-all ${
                            paymentMethod === "card" ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-100" : "border-border/60 hover:border-amber-300"
                          }`}>
                            <RadioGroupItem value="card" id="card" className="text-amber-500" />
                            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              Card
                            </Label>
                          </div>
                          <div className={`flex items-center space-x-2 border rounded-2xl p-4 cursor-pointer transition-all ${
                            paymentMethod === "upi" ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-100" : "border-border/60 hover:border-amber-300"
                          }`}>
                            <RadioGroupItem value="upi" id="upi" className="text-amber-500" />
                            <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                              <Smartphone className="w-4 h-4 text-muted-foreground" />
                              UPI
                            </Label>
                          </div>
                          <div className={`flex items-center space-x-2 border rounded-2xl p-4 cursor-pointer transition-all ${
                            paymentMethod === "wallet" ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-100" : "border-border/60 hover:border-amber-300"
                          }`}>
                            <RadioGroupItem value="wallet" id="wallet" className="text-amber-500" />
                            <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                              <Wallet className="w-4 h-4 text-muted-foreground" />
                              Wallet
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Payment Sub-Forms */}
                      {paymentMethod === "card" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="cardNumber" className="text-xs font-semibold text-gray-700">Card Number</Label>
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                className={inputCls}
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="cardName" className="text-xs font-semibold text-gray-700">Name on Card</Label>
                              <Input
                                id="cardName"
                                name="cardName"
                                placeholder="Prajjwal Singh"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                className={inputCls}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="expiry" className="text-xs font-semibold text-gray-700">Expiry Date</Label>
                              <Input
                                id="expiry"
                                name="expiry"
                                placeholder="MM/YY"
                                value={formData.expiry}
                                onChange={handleInputChange}
                                className={inputCls}
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="cvv" className="text-xs font-semibold text-gray-700">CVV</Label>
                              <Input
                                id="cvv"
                                name="cvv"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className={inputCls}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === "upi" && (
                        <div className="space-y-3 bg-muted/30 border border-border/30 p-4 rounded-2xl">
                          <div className="space-y-1.5">
                            <Label htmlFor="upiId" className="text-xs font-semibold text-gray-700">UPI ID</Label>
                            <Input
                              id="upiId"
                              placeholder="yourname@upi"
                              className={inputCls}
                              required
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            A payment notification will be pushed to your selected UPI handle or application immediately.
                          </p>
                        </div>
                      )}
                      
                      {paymentMethod === "wallet" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {["Paytm", "PhonePe", "Google Pay", "Amazon Pay"].map((wallet) => (
                              <div key={wallet} className="border border-border/60 hover:border-amber-300 rounded-xl p-3 text-center cursor-pointer hover:bg-amber-50/10 transition-all font-semibold text-xs text-foreground">
                                {wallet}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Shipping Details */}
                      <div className="pt-2 border-t border-border/20">
                        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
                          <MapPin className="w-4.5 h-4.5 text-amber-500" />
                          Delivery Coordinates
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-semibold text-gray-700">Delivery Address / Room / Hostels</Label>
                            <Input
                              id="address"
                              name="address"
                              placeholder="e.g. Room 402, Block B, Deoghar College Hostel"
                              value={formData.address}
                              onChange={handleInputChange}
                              className={inputCls}
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="city" className="text-xs font-semibold text-gray-700">City</Label>
                              <Input
                                id="city"
                                name="city"
                                placeholder="Deoghar"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={inputCls}
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="zip" className="text-xs font-semibold text-gray-700">ZIP / Pin Code</Label>
                              <Input
                                id="zip"
                                name="zip"
                                placeholder="814112"
                                value={formData.zip}
                                onChange={handleInputChange}
                                className={inputCls}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Encrypted Secure Stripe banner */}
                      <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-900">
                        <Lock className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
                        <span className="font-medium">Every transaction uses 256-bit secure sockets. Deoghar Student protection keeps pick-ups safe.</span>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl h-13 shadow-lg hover:shadow-amber-500/20 transition-all hover:scale-102 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Confirm & Pay ₹{total}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;