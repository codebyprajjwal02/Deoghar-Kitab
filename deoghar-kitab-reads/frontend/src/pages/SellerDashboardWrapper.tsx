import { useNavigate } from "react-router-dom";
import SellerDashboard from "@/pages/SellerDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const SellerDashboardWrapper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <SellerDashboard />;
};

export default SellerDashboardWrapper;