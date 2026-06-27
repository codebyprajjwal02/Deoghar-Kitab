import { motion } from "framer-motion";
import { ChevronDown, Search, BookOpen, Users, TrendingDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "@/assets/hero-books.jpg";

const stats = [
  { icon: BookOpen, value: "2,500+", label: "Books Available" },
  { icon: Users,    value: "1,200+", label: "Happy Students" },
  { icon: TrendingDown, value: "70%",  label: "Average Savings" },
  { icon: Star,     value: "4.9★",   label: "Student Rating" },
];

const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const scrollToNext = () => {
    document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Layered Gradient Overlay */}
      <div className="absolute inset-0 z-10" style={{
        background: "linear-gradient(135deg, hsl(26 70% 8% / 0.92) 0%, hsl(26 50% 15% / 0.75) 50%, hsl(36 80% 20% / 0.4) 100%)"
      }} />

      {/* Decorative floating orbs */}
      <div className="absolute top-20 right-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl z-10 animate-float" />
      <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full bg-amber-300/8 blur-2xl z-10 animate-float-delayed" />

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 text-white flex flex-col items-center text-center pt-20 pb-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 backdrop-blur-sm px-4 py-2 rounded-full text-amber-300 text-sm font-medium mb-6"
        >
          <BookOpen className="w-4 h-4" />
          Deoghar's Premier Student Book Bank
        </motion.div>

        <motion.h1
          key={t.hero.headline}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t.hero.headline}
        </motion.h1>

        <motion.p
          key={t.hero.subtext}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl mb-10 text-white/80 max-w-2xl"
        >
          {t.hero.subtext}
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onSubmit={handleSearch}
          className="w-full max-w-2xl mb-8"
        >
          <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden shadow-2xl hover:bg-white/20 transition-colors">
            <Search className="w-5 h-5 text-white/70 ml-5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, subject..."
              className="flex-1 bg-transparent text-white placeholder-white/60 px-4 py-4 text-lg outline-none"
            />
            <Button
              type="submit"
              className="m-2 px-6 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all"
            >
              Search
            </Button>
          </div>
        </motion.form>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap gap-4 justify-center mb-16"
        >
          <Button
            size="lg"
            onClick={scrollToNext}
            className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-lg px-8 rounded-xl shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all"
          >
            {t.hero.browseBooksBtn}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-white/60 text-white hover:bg-white hover:text-amber-900 transition-all text-lg px-8 rounded-xl font-semibold"
            onClick={() => document.getElementById("sell")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t.hero.sellBookBtn}
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center hover:bg-white/15 transition-colors"
            >
              <stat.icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/70 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 0.5 },
          y: { repeat: Infinity, duration: 1.5 },
        }}
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/60 cursor-pointer hover:text-amber-400 transition-colors"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </section>
  );
};

export default Hero;