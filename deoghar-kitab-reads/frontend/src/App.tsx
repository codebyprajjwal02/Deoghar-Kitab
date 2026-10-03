import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import ModernAuth from "@/pages/ModernAuth";
import UnifiedAuthPage from "@/pages/UnifiedAuthPage";
import ForgotPassword from "@/pages/ForgotPassword";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import ChatList from "@/pages/ChatList";
import ChatCreate from "@/pages/ChatCreate";
import ChatRoom from "@/pages/ChatRoom";
import BookDetails from "@/pages/BookDetails";
import PaymentPage from "@/pages/PaymentPage";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import BrowseBooksPage from "@/pages/BrowseBooksPage";
import NearbySearch from "@/pages/NearbySearch";
import BookReservations from "@/pages/BookReservations";
import InventoryManager from "@/pages/InventoryManager";
import ShopkeeperInsights from "@/pages/ShopkeeperInsights";
import BookRequests from "@/pages/BookRequests";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<UnifiedAuthPage />} />
                  <Route path="/classic-auth" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller-dashboard" 
                    element={
                      <ProtectedRoute>
                        <SellerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/create"
                    element={
                      <ProtectedRoute>
                        <ChatCreate />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/:id"
                    element={
                      <ProtectedRoute>
                        <ChatRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/cart" 
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/wishlist" 
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/payment/:id" 
                    element={
                      <ProtectedRoute>
                        <PaymentPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/nearby-search" 
                    element={
                      <ProtectedRoute>
                        <NearbySearch />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reservations" 
                    element={
                      <ProtectedRoute>
                        <BookReservations />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/inventory-manager" 
                    element={
                      <ProtectedRoute>
                        <InventoryManager />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/shopkeeper-insights" 
                    element={
                      <ProtectedRoute>
                        <ShopkeeperInsights />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/requests" 
                    element={
                      <ProtectedRoute>
                        <BookRequests />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Public Content Routes */}
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route path="/browse" element={<BrowseBooksPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;