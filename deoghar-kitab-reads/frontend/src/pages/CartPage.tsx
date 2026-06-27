import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  AlertCircle,
  HelpCircle,
  Tag,
  Truck,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

interface SellerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  showPhone: boolean;
}

const conditionConfig: Record<string, { label: string; className: string }> = {
  Excellent: { label: "Excellent", className: "badge-excellent text-[10px] px-2 py-0.5" },
  Good:      { label: "Good",      className: "badge-good text-[10px] px-2 py-0.5" },
  Fair:      { label: "Fair",      className: "badge-fair text-[10px] px-2 py-0.5" },
};

const CartPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [sameSellerError, setSameSellerError] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart: CartItem[] = JSON.parse(savedCart);
      setCart(parsedCart);
      calculateTotal(parsedCart);
      checkSameSeller(parsedCart);
    }
  }, []);

  const checkSameSeller = (cartItems: CartItem[]) => {
    if (cartItems.length === 0) {
      setSameSellerError(false);
      setSellerData(null);
      return;
    }
    
    const firstSellerEmail = cartItems[0].sellerEmail;
    const allSameSeller = cartItems.every(item => item.sellerEmail === firstSellerEmail);
    
    if (allSameSeller && firstSellerEmail) {
      setSameSellerError(false);
      const sellerDataString = localStorage.getItem(`seller_${firstSellerEmail}`);
      if (sellerDataString) {
        setSellerData(JSON.parse(sellerDataString));
      }
    } else {
      setSameSellerError(true);
      setSellerData(null);
    }
  };

  const calculateTotal = (cartItems: CartItem[]) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
    checkSameSeller(updatedCart);
    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (id: number) => {
    const item = cart.find(i => i.id === id);
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
    checkSameSeller(updatedCart);
    window.dispatchEvent(new Event("storage"));
    if (item) {
      toast.success(`Removed "${item.title}" from cart`);
    }
  };

  const handleCallSeller = () => {
    if (sellerData && sellerData.phone) {
      window.location.href = `tel:${sellerData.phone}`;
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigate(`/payment/${cart[0].id}`);
    }
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
            Continue Shopping
          </Button>

          <AnimatePresence mode="wait">
            {cart.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto text-center py-16"
              >
                <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100/50">
                  <ShoppingCart className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Shopping Cart is Empty
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                  Looks like you haven't chosen any textbooks yet. Save up to 60% on your classes today!
                </p>
                <Button 
                  onClick={() => navigate("/browse")}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl px-6 h-12 shadow-md hover:shadow-amber-500/20 transition-all hover:scale-103"
                >
                  Browse Student Book Bank
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="cart-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-3xl font-extrabold text-foreground mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Shopping Cart
                </h1>
                
                {/* Same Seller Error Alert */}
                {sameSellerError && (
                  <Alert variant="destructive" className="mb-6 rounded-2xl border-red-200 bg-red-50 text-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="font-bold">Transaction Limit</AlertTitle>
                    <AlertDescription className="text-xs">
                      You can only purchase books from the same seller in one transaction. 
                      Please remove items from other sellers or complete separate purchases.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Cart Items List */}
                  <div className="lg:col-span-8 space-y-4">
                    <Card className="rounded-3xl border border-border/40 shadow-card overflow-hidden">
                      <CardHeader className="px-6 py-4 bg-muted/20 border-b border-border/20">
                        <CardTitle className="text-sm font-bold text-muted-foreground flex items-center justify-between">
                          <span>Your Book Selection</span>
                          <span>{cart.length} items</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 divide-y divide-border/20">
                        {cart.map((item, i) => {
                          const cond = conditionConfig[item.condition] ?? { label: item.condition, className: "badge-fair text-[10px]" };
                          return (
                            <div 
                              key={item.id} 
                              className={`flex gap-4 items-start py-5 first:pt-0 last:pb-0`}
                            >
                              <div className="aspect-[3/4] w-20 overflow-hidden rounded-xl border border-border/30 bg-muted flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="flex-grow min-w-0">
                                <h3 className="font-bold text-sm text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/book/${item.id}`)}>{item.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">by {item.author}</p>
                                <span className={cond.className}>{cond.label}</span>
                                
                                <div className="flex items-center justify-between mt-4">
                                  {/* Quantity selector widget */}
                                  <div className="flex items-center bg-muted border border-border/40 rounded-xl p-0.5">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card text-muted-foreground disabled:opacity-30 transition-colors"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card text-muted-foreground transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <span className="font-bold text-base text-foreground">₹{item.price * item.quantity}</span>
                                    <button 
                                      onClick={() => removeItem(item.id)}
                                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Summary Block */}
                  <div className="lg:col-span-4 space-y-4">
                    <Card className="rounded-3xl border border-border/40 shadow-card sticky top-24">
                      <CardHeader>
                        <CardTitle className="text-base font-bold">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pb-4">
                        <div className="space-y-3 pb-4 border-b border-border/20 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold text-foreground">₹{totalPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> FREE</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">GST (18%)</span>
                            <span className="font-semibold text-foreground">₹{Math.round(totalPrice * 0.18)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between font-extrabold text-lg">
                          <span>Estimated Total</span>
                          <span className="text-primary font-extrabold">₹{totalPrice + Math.round(totalPrice * 0.18)}</span>
                        </div>
                        
                        {/* Contact Seller Info Widget */}
                        {sellerData && sellerData.showPhone && !sameSellerError && (
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-bold text-amber-900 text-xs">Direct Seller</p>
                                <p className="text-[11px] text-amber-850 truncate">{sellerData.name}</p>
                              </div>
                              <Button 
                                onClick={handleCallSeller} 
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl px-3 h-8 text-[11px] shadow-sm flex items-center gap-1 flex-shrink-0"
                              >
                                <Phone className="w-3.5 h-3.5" /> Call Now
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-muted/40 border border-border/20 rounded-2xl p-3.5 text-xs text-muted-foreground flex gap-2">
                          <Tag className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>Complete your purchase to coordinate delivery directly with your student seller.</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-2.5 p-6 pt-0">
                        <Button 
                          className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl h-13 shadow-lg hover:shadow-amber-500/20 transition-all hover:scale-102 flex items-center justify-center gap-2" 
                          onClick={handleCheckout}
                          disabled={sameSellerError || cart.length === 0}
                        >
                          Proceed to Checkout
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full hover:bg-muted text-xs font-semibold rounded-xl"
                          onClick={() => navigate("/browse")}
                        >
                          Add More Books
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Checkout Trust Banner */}
                    <div className="p-4 bg-muted/15 border border-border/30 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">Verified student protection. Safe exchanges.</span>
                    </div>
                  </div>
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

export default CartPage;