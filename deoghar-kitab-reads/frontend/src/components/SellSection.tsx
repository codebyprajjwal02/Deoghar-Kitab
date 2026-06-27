import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Upload, IndianRupee, Camera, BookOpen, User, AlertCircle, CheckCircle, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import SellerRegistrationForm from "@/components/SellerRegistrationForm";
import { toast } from "sonner";

interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  userType: string;
}

interface SellerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

const steps = [
  {
    icon: BookOpen,
    number: "01",
    title: "List Your Book",
    description: "Add details, photos, and set your price. Takes less than 2 minutes.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Camera,
    number: "02",
    title: "Reach Students",
    description: "Your book is instantly visible to thousands of students in Deoghar.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: IndianRupee,
    number: "03",
    title: "Get Paid Fast",
    description: "Receive payment directly after the buyer confirms receipt.",
    color: "from-green-500 to-emerald-600",
  },
];

const SellSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [userSellerStatus, setUserSellerStatus] = useState<'user' | 'pending' | 'seller' | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setIsLoggedIn(true);
      setUser(userData);
      const userId = userData.id || userData._id;
      if (userId) checkSellerStatus(userId);
    }
  }, []);

  const checkSellerStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3003/api/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.userType === 'seller') {
          setUserSellerStatus('seller');
        } else if (userData.sellerRequest?.requested && !userData.sellerRequest?.approved) {
          setUserSellerStatus('pending');
        } else {
          setUserSellerStatus('user');
        }
      }
    } catch {
      console.error('Error checking seller status');
    }
  };

  const handleSellBooks = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to sell books");
      navigate("/");
      return;
    }
    if (userSellerStatus === 'seller') {
      navigate("/seller");
    } else if (userSellerStatus === 'pending') {
      toast.info("Your seller request is pending approval.");
    } else {
      setShowSellerForm(true);
    }
  };

  const handleSellerFormSubmit = (_sellerData: SellerData) => {
    setShowSellerForm(false);
    toast.success("Seller request submitted! Await admin approval.");
    setUserSellerStatus('pending');
  };

  const handleCancelRequest = async () => {
    if (!window.confirm("Cancel your seller request?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3003/api/users/${user?.id || user?._id}/cancel-seller-request`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
        }
      );
      if (response.ok) {
        toast.success("Seller request cancelled.");
        setUserSellerStatus('user');
      } else {
        toast.error("Failed to cancel. Try again.");
      }
    } catch {
      toast.error("Error cancelling request.");
    }
  };

  const ctaLabel = isLoggedIn
    ? userSellerStatus === 'seller' ? "Go to Seller Dashboard"
    : userSellerStatus === 'pending' ? "Request Pending…"
    : "Become a Seller"
    : "Sign In to Sell Books";

  return (
    <section id="sell" className="py-24 relative overflow-hidden" style={{ background: "var(--gradient-section)" }}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-green-400/8 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            Sell Your Books
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 section-title">{t.sell.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.sell.subtitle}</p>

          {/* Status banners */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-5 py-3 text-sm font-medium"
            >
              <User className="w-4 h-4" />
              Sign in to start selling your books and earn money
            </motion.div>
          )}
          {isLoggedIn && userSellerStatus === 'pending' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 inline-flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-6 py-4 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Your seller request is pending admin approval. We'll notify you soon!
              </span>
              <Button variant="outline" size="sm" onClick={handleCancelRequest} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Cancel Request
              </Button>
            </motion.div>
          )}
          {isLoggedIn && userSellerStatus === 'seller' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-3 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              You're an approved seller! Head to your dashboard to manage listings.
            </motion.div>
          )}
        </motion.div>

        {/* Steps + CTA */}
        <div className="grid lg:grid-cols-2 gap-10 items-stretch max-w-5xl mx-auto">
          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="group flex gap-5 items-start bg-card rounded-2xl p-5 border border-border/60 hover:shadow-card transition-all duration-300"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-0.5">STEP {step.number}</div>
                  <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-card border border-border/60 rounded-3xl p-8 shadow-card flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Ready to Start?</h3>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed max-w-xs">
              {isLoggedIn
                ? userSellerStatus === 'seller'
                  ? "Your dashboard is ready. List books and track your earnings."
                  : userSellerStatus === 'pending'
                  ? "Your application is under review. Sit tight!"
                  : "Apply once — sell forever. No listing fees for students."
                : "Join 1,200+ students already earning by selling old books."}
            </p>

            {/* Earnings teaser */}
            <div className="w-full bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-500 flex-shrink-0" />
              Sellers earn an average of <strong>₹2,500/month</strong>
            </div>

            <Button
              onClick={handleSellBooks}
              size="lg"
              disabled={userSellerStatus === 'pending'}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl h-12 text-base transition-all hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {ctaLabel}
              {userSellerStatus !== 'pending' && (
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Seller Registration Modal */}
      {showSellerForm && user && (
        <SellerRegistrationForm
          onSubmit={handleSellerFormSubmit}
          onCancel={() => setShowSellerForm(false)}
        />
      )}
    </section>
  );
};

export default SellSection;