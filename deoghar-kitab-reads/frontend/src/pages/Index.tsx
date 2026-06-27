import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrowseBooks from "@/components/BrowseBooks";
import SellSection from "@/components/SellSection";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import LoadingAnimation from "@/components/LoadingAnimation";
import UserGreeting from "@/components/UserGreeting";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, userType: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for the page
    const timer = setTimeout(() => {
      // Check if user is logged in
      const userString = localStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        setIsLoggedIn(true);
        setUser(userData);
      } 
      // For development/testing purposes, create a test user if none exists
      else if (import.meta.env.DEV) {
        // Uncomment the following lines to create a test user during development
        /*
        const testUser = {
          name: "John Doe",
          email: "john.doe@example.com",
          userType: "user"
        };
        localStorage.setItem("user", JSON.stringify(testUser));
        setIsLoggedIn(true);
        setUser(testUser);
        */
      }
      setIsLoading(false);
    }, 1000); // 1 second loading time

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    // This is just a placeholder since we're already on the page
    console.log("Loading complete");
  };

  if (isLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Show personalized greeting for logged-in users */}
      {isLoggedIn && user?.name && (
        <UserGreeting name={user.name} />
      )}
      
      <BrowseBooks />
      <SellSection />
      <WhyChoose />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;