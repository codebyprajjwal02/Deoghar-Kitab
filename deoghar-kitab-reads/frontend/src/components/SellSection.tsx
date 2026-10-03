import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Upload, IndianRupee, Camera, BookOpen, User, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  userType: string;
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

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      setIsLoggedIn(true);
      setUser(userData);
    }
  }, []);

  const handleSellBooks = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to sell books");
      navigate("/");
      return;
    }
    navigate("/seller-dashboard");
  };

  const ctaLabel = isLoggedIn
    ? "Go to Seller Dashboard"
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
          <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            Sell Your Books
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 section-title">{t.sell.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.sell.subtitle}</p>

          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 rounded-xl px-5 py-3 text-sm font-medium"
            >
              <User className="w-4 h-4" />
              Sign in to start selling your books and earn money
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
            <p className="text-muted-foreground mb-5 text-sm leading-relaxed max-w-xs">
              {isLoggedIn
                ? "Your dashboard is ready. List books, set prices, and track study materials with ease."
                : "Join 1,200+ students already earning by selling old books."}
            </p>

            {/* Earnings teaser */}
            <div className="w-full bg-amber-50 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-500 flex-shrink-0" />
              Sellers earn an average of <strong>₹2,500/month</strong>
            </div>

            <Button
              onClick={handleSellBooks}
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl h-12 text-base transition-all hover:scale-105 hover:shadow-lg group"
            >
              {ctaLabel}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SellSection;