import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, BookOpen, User, Lock, Mail, Shield, ArrowRight, Star, Users, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useAuth } from "@/contexts/AuthContext";

// Decorative floating book cards
const FloatingCard = ({
  title, subject, color, position, delay,
}: {
  title: string; subject: string; color: string; position: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    className={`absolute ${position} bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/60 hidden lg:flex items-center gap-3 z-10`}
    style={{ minWidth: "160px" }}
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <BookOpen className="w-5 h-5 text-white" />
    </div>
    <div>
      <div className="text-xs font-bold text-gray-800 leading-tight">{title}</div>
      <div className="text-xs text-gray-500">{subject}</div>
    </div>
  </motion.div>
);

const testimonials = [
  { name: "Priya S.", text: "Saved ₹1,200 on NCERT books!", avatar: "P" },
  { name: "Rohit K.", text: "Sold 8 books in a week!", avatar: "R" },
  { name: "Anita D.", text: "Best platform for students!", avatar: "A" },
];

const ModernAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [userType, setUserType] = useState<"user" | "admin">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedEmail.includes("@") && savedPassword) {
      setLoginData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === "admin") { navigate("/admin/login"); return; }
    setIsLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:3003/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });
      const data = await res.json();
      if (res.ok) { login(data, data.token, rememberMe); setShowLoading(true); }
      else { setError(data.message || "Invalid email or password."); setIsLoading(false); }
    } catch {
      setError("Cannot connect to server. Please check your connection.");
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setIsLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:3003/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupData.name, email: signupData.email, password: signupData.password, userType: "user" }),
      });
      const data = await res.json();
      if (res.ok) { login(data, data.token); setShowLoading(true); }
      else { setError(data.message || "Registration failed."); setIsLoading(false); }
    } catch {
      setError("Cannot connect to server. Please check your connection.");
      setIsLoading(false);
    }
  };

  if (showLoading) return <LoadingAnimation onComplete={() => navigate("/home")} />;

  const inputClass = "pl-12 h-12 bg-white/80 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all rounded-xl text-sm";

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Brand / Info ── */}
      <div
        className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(26 60% 12%) 0%, hsl(36 80% 22%) 60%, hsl(36 90% 30%) 100%)" }}
      >
        {/* Decorative floating book cards */}
        <FloatingCard title="NCERT Physics" subject="Class 12" color="bg-amber-500" position="top-24 left-8" delay={0} />
        <FloatingCard title="JEE Chemistry" subject="Competitive" color="bg-blue-500" position="top-48 right-6" delay={1} />
        <FloatingCard title="History Notes" subject="UPSC Prep" color="bg-green-500" position="bottom-40 left-10" delay={2} />
        <FloatingCard title="Maths Guide" subject="Reference" color="bg-purple-500" position="bottom-24 right-8" delay={0.5} />

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white max-w-sm"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500 shadow-2xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Deoghar Kitab
          </h1>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Deoghar's trusted student Book Bank — buy, sell & exchange books effortlessly.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: BookMarked, value: "2,500+", label: "Books" },
              { icon: Users,      value: "1,200+", label: "Students" },
              { icon: Star,       value: "4.9★",   label: "Rating" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center border border-white/20">
                <s.icon className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="font-bold text-white text-lg leading-none">{s.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rotating testimonials */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {testimonials[testimonialIdx].avatar}
                </div>
                <div className="text-left">
                  <div className="flex mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/90 text-sm italic">"{testimonials[testimonialIdx].text}"</p>
                  <p className="text-white/60 text-xs mt-1 font-medium">— {testimonials[testimonialIdx].name}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel — Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                Deoghar Kitab
              </span>
            </div>
            <p className="text-gray-500 text-sm">Student Book Bank</p>
          </div>

          {/* Title */}
          <div className="mb-7">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              {authMode === "signin" ? "Welcome back 👋" : "Create account 📚"}
            </h2>
            <p className="text-gray-500 text-sm">
              {authMode === "signin"
                ? "Sign in to continue your book journey"
                : "Join thousands of students saving on books"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7">
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2"
                >
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0">⚠</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Type Toggle */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              <button
                type="button"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  userType === "user"
                    ? "bg-white shadow-sm text-amber-600 border border-amber-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setUserType("user")}
              >
                <User className="w-4 h-4" /> Student
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  userType === "admin"
                    ? "bg-white shadow-sm text-amber-600 border border-amber-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setUserType("admin");
                  if (authMode === "signin") setTimeout(() => navigate("/admin/login"), 300);
                }}
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
            </div>

            {/* Tab Switch */}
            <div className="flex rounded-xl border border-gray-200 p-0.5 mb-6">
              {(["signin", "signup"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setAuthMode(mode); setError(""); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    authMode === mode
                      ? "bg-amber-500 text-white shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {authMode === "signin" ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="login-email" name="email" type="email" placeholder="you@example.com" value={loginData.email} onChange={handleLoginChange} className={inputClass} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} className={`${inputClass} pr-12`} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-amber-600 hover:text-amber-700 font-semibold">
                      Forgot password?
                    </button>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-base transition-all hover:shadow-lg group mt-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing In…
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="signup-name" name="name" type="text" placeholder="Your full name" value={signupData.name} onChange={handleSignupChange} className={inputClass} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="signup-email" name="email" type="email" placeholder="you@example.com" value={signupData.email} onChange={handleSignupChange} className={inputClass} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="signup-password" name="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={signupData.password} onChange={handleSignupChange} className={`${inputClass} pr-12`} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="signup-confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat your password" value={signupData.confirmPassword} onChange={handleSignupChange} className={`${inputClass} pr-12`} required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <input id="terms" type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" required />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-amber-600 font-semibold hover:underline">Terms</a> and{" "}
                      <a href="#" className="text-amber-600 font-semibold hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-base transition-all hover:shadow-lg group mt-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account…
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            © 2025 Deoghar Kitab Reads · Built for students 📚
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernAuth;