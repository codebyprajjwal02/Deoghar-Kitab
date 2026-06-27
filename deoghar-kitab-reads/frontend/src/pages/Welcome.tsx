import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, User, Shield, Lightbulb, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();
  const [lampState, setLampState] = useState<"closed" | "opening" | "open">("closed");
  const [showPerson, setShowPerson] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);

  useEffect(() => {
    // Start the lamp opening sequence after a delay
    const lampTimer = setTimeout(() => {
      setLampState("opening");
    }, 1000);
    
    // Show the person after the lamp starts opening
    const personTimer = setTimeout(() => {
      setShowPerson(true);
    }, 1500);
    
    // Show signup options after the person appears
    const optionsTimer = setTimeout(() => {
      setLampState("open");
      setShowSignupOptions(true);
    }, 2500);
    
    return () => {
      clearTimeout(lampTimer);
      clearTimeout(personTimer);
      clearTimeout(optionsTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-secondary/10 blur-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 z-10"
      >
        <div className="flex justify-center mb-6">
          <BookOpen className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Deoghar Kitab
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your trusted marketplace for buying and selling second-hand books
        </p>
      </motion.div>

      {/* Lamp and Person Animation Container */}
      <div className="relative w-full max-w-2xl h-96 mb-12 flex items-center justify-center">
        {/* Ceiling */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-4 bg-gray-800 rounded-b-lg"></div>
        
        {/* Lamp Chain */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gray-600"></div>
        
        {/* Lamp */}
        <AnimatePresence>
          {lampState !== "closed" && (
            <motion.div
              initial={{ rotate: -15 }}
              animate={{ 
                rotate: lampState === "opening" ? 0 : 0,
                y: lampState === "opening" ? [0, -20, 0] : 0
              }}
              transition={{ 
                duration: 1.5,
                y: { duration: 0.5, times: [0, 0.5, 1] }
              }}
              className="absolute top-20"
            >
              <div className="relative">
                {/* Lamp Shade */}
                <div className="w-32 h-24 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full rounded-b-none shadow-lg"></div>
                
                {/* Lamp Light Cone */}
                <motion.div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-48 origin-top"
                  initial={{ 
                    scaleY: 0,
                    background: "linear-gradient(to bottom, rgba(255,255,200,0.8), transparent)"
                  }}
                  animate={{ 
                    scaleY: lampState === "open" ? 1 : 0,
                    opacity: lampState === "open" ? 1 : 0
                  }}
                  transition={{ duration: 1 }}
                >
                  <div className="w-64 h-48 bg-gradient-to-b from-yellow-100/30 to-transparent rounded-b-full"></div>
                </motion.div>
                
                {/* Lamp Bulb */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-yellow-300 rounded-full shadow-inner"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Person */}
        <AnimatePresence>
          {showPerson && (
            <motion.div
              initial={{ x: 200, y: 50, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute bottom-0"
            >
              <div className="relative">
                {/* Person Body */}
                <div className="w-16 h-24 bg-blue-600 rounded-t-full"></div>
                {/* Person Head */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-300 rounded-full"></div>
                {/* Person Arms */}
                <div className="absolute top-4 -left-4 w-8 h-2 bg-blue-600 rounded-full origin-right"
                     style={{ transform: 'rotate(30deg)' }}></div>
                <div className="absolute top-4 -right-4 w-8 h-2 bg-blue-600 rounded-full origin-left"
                     style={{ transform: 'rotate(-30deg)' }}></div>
                {/* Person Legs */}
                <div className="absolute bottom-0 left-2 w-2 h-8 bg-blue-800 rounded-full"></div>
                <div className="absolute bottom-0 right-2 w-2 h-8 bg-blue-800 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signup Options */}
      <AnimatePresence>
        {showSignupOptions && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 z-10"
          >
            <motion.div
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="h-24 w-48 flex flex-col gap-3 px-6 py-4 bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/signup")}
              >
                <User className="w-8 h-8" />
                <span className="text-lg font-semibold">User Signup</span>
                <span className="text-xs opacity-80">Buy or Sell Books</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="h-24 w-48 flex flex-col gap-3 px-6 py-4 border-2 hover:bg-foreground/5 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/admin/signup")}
              >
                <Shield className="w-8 h-8" />
                <span className="text-lg font-semibold">Admin Signup</span>
                <span className="text-xs opacity-80">Manage Platform</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Option */}
      <AnimatePresence>
        {showSignupOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-center z-10"
          >
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Welcome;