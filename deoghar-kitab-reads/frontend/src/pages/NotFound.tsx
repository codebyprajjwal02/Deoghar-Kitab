import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 w-28 h-28 bg-amber-200/50 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-amber-500 flex items-center justify-center shadow-xl">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-orange-600 border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-md">
            ?
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold text-amber-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-800">
            This chapter seems missing...
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            The page you are looking for doesn't exist or has been moved to another section.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => navigate("/home")}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl h-12 shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Button>
          <Button
            onClick={() => navigate("/browse")}
            variant="outline"
            className="flex-1 border-gray-200 hover:bg-gray-50 font-bold rounded-xl h-12 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-gray-400" />
            Browse Books
          </Button>
        </div>

        <p className="text-xs text-gray-400">
          Deoghar Kitab Student Platform
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
