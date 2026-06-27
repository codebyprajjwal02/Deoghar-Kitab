import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, BookOpen, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LoadingAnimation from "@/components/LoadingAnimation";

const UnifiedAuthPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  // State management
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  // Floating books data
  const floatingBooks = [
    { title: "NCERT Physics", color: "from-blue-400 to-blue-600", top: "10%", left: "5%" },
    { title: "JEE Chemistry", color: "from-green-400 to-emerald-600", top: "60%", right: "8%" },
    { title: "Maths Guide", color: "from-orange-400 to-amber-600", bottom: "15%", left: "10%" },
  ];

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3003/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const userData = await response.json();

      if (response.ok) {
        login(userData, userData.token);
        setShowLoadingAnimation(true);
        // Redirect based on role and approval status
        setTimeout(() => {
          if (userData.userType === 'admin') return navigate('/admin');
          if (userData.userType === 'seller' && userData.isSellerApproved) return navigate('/seller');
          return navigate('/home');
        }, 1200);
      } else {
        setError(userData.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        userType: "user",
      };

      const response = await fetch("http://localhost:3003/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();

      if (response.ok) {
        login(responseData, responseData.token);
        setSuccessMessage("Account created successfully! Redirecting...");
        // Redirect according to role (sellers will typically be pending approval)
        setTimeout(() => {
          if (responseData.userType === 'admin') return navigate('/admin');
          if (responseData.userType === 'seller' && responseData.isSellerApproved) return navigate('/seller');
          return navigate('/home');
        }, 1200);
      } else {
        setError(responseData.message || "Registration failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred during registration");
      setIsLoading(false);
    }
  };

  if (showLoadingAnimation) {
    return <LoadingAnimation onComplete={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-cream-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating books background */}
      <AnimatePresence>
        {floatingBooks.map((book, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1, y: [0, 20, 0] }}
            transition={{ delay: idx * 0.2, duration: 4, repeat: Infinity }}
            style={{
              position: "absolute",
              top: book.top || "auto",
              bottom: book.bottom || "auto",
              left: book.left || "auto",
              right: book.right || "auto",
            }}
            className="pointer-events-none"
          >
            <div className={`bg-gradient-to-br ${book.color} rounded-2xl p-4 text-white shadow-lg w-32 h-24 flex items-center justify-center text-center text-sm font-bold`}>
              {book.title}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-4xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
            {/* Left Section - Changes based on mode */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                // Login: Branding on left
                <motion.div
                  key="login-branding"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-12 text-white relative overflow-hidden"
                >
                  {/* Decorative circles */}
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative z-10 mb-6"
                  >
                    <img src="/favicon.ico" alt="Deoghar Kitab" className="w-24 h-24 mb-4" />
                  </motion.div>

                  <h2 className="text-4xl font-bold mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Deoghar Kitab
                  </h2>
                  <p className="text-white/90 text-center mb-8 text-sm leading-relaxed">
                    Your trusted marketplace for buying and selling second-hand books. Join thousands of students saving money and building sustainable reading habits.
                  </p>

                  <div className="space-y-4 w-full">
                    {[
                      { icon: "📚", text: "2,500+ Books Available" },
                      { icon: "💚", text: "Sustainable Reading" },
                      { icon: "⚡", text: "Instant Transactions" },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="flex items-center gap-3 text-white/95"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // Signup: Form on left, branding on right
                null
              )}
            </AnimatePresence>

            {/* Right Section - Form */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col justify-center p-8 md:p-12"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">Welcome Back!</h1>
                    <p className="text-gray-500 text-center mb-8">Sign in to access your book collection</p>
                  </motion.div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2"
                      >
                        <span>⚠️</span> {error}
                      </motion.div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) => {
                            setLoginData({ ...loginData, email: e.target.value });
                            if (error) setError("");
                          }}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => {
                            setLoginData({ ...loginData, password: e.target.value });
                            if (error) setError("");
                          }}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl mt-6 transition-all shadow-md hover:shadow-lg"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  {/* Switch to Signup */}
                  <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                    <p className="text-gray-600 mb-3">
                      New to Deoghar Kitab?{" "}
                      <button
                        onClick={() => {
                          setMode("signup");
                          setError("");
                          setLoginData({ email: "", password: "" });
                        }}
                        className="text-amber-600 font-semibold hover:text-orange-600 transition-colors"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Signup Form
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col justify-center p-8 md:p-12"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">Join Our Community</h1>
                    <p className="text-gray-500 text-center mb-8">Start buying and selling books today</p>
                  </motion.div>

                  <form onSubmit={handleSignup} className="space-y-3">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2"
                      >
                        <span>⚠️</span> {error}
                      </motion.div>
                    )}

                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> {successMessage}
                      </motion.div>
                    )}

                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          className="pl-12 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="pl-12 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="pl-12 pr-12 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          className="pl-12 pr-12 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl mt-4 transition-all shadow-md hover:shadow-lg text-sm"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>

                  {/* Switch to Login */}
                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-600 text-sm mb-2">
                      Already have an account?{" "}
                      <button
                        onClick={() => {
                          setMode("login");
                          setError("");
                          setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
                        }}
                        className="text-emerald-600 font-semibold hover:text-green-600 transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Section - Branding (Signup Mode) */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="signup-branding"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4 }}
                  className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-emerald-400 via-green-400 to-teal-500 p-12 text-white relative overflow-hidden"
                >
                  {/* Decorative circles */}
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                  <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative z-10 mb-6"
                  >
                    <div className="text-6xl">📚</div>
                  </motion.div>

                  <h2 className="text-4xl font-bold mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Start Selling
                  </h2>
                  <p className="text-white/90 text-center mb-8 text-sm leading-relaxed">
                    List your books in minutes. Reach thousands of students looking for affordable, quality reads.
                  </p>

                  <div className="space-y-4 w-full">
                    {[
                      { icon: "💰", text: "Earn Extra Money" },
                      { icon: "🌱", text: "Help the Environment" },
                      { icon: "⭐", text: "Build Your Reputation" },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="flex items-center gap-3 text-white/95"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Floating student illustration (emoji) */}
                  <motion.div
                    animate={{ y: [0, 30, 0], x: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="text-8xl mt-8 opacity-30"
                  >
                    👨‍🎓
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Mobile Info - Only on small screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="md:hidden fixed bottom-4 left-4 right-4 text-center text-sm text-gray-600 bg-white/80 backdrop-blur p-3 rounded-lg border border-gray-200"
      >
        <p>💡 Join thousands of students saving money on books</p>
      </motion.div>
    </div>
  );
};

export default UnifiedAuthPage;
