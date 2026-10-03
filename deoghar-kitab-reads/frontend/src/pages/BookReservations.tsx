import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, QrCode, CheckCircle2, AlertTriangle, Clock, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface Reservation {
  _id: string;
  reservationId: string;
  book: {
    _id: string;
    title: string;
    author: string;
    price: number;
    locationName: string;
  } | null;
  buyer: {
    name: string;
    email: string;
  };
  seller: {
    name: string;
    email: string;
  };
  status: "pending" | "completed" | "expired" | "cancelled";
  expiresAt: string;
  reservedAt: string;
  price: number;
}

export default function BookReservations() {
  const [activeTab, setActiveTab] = useState<"student" | "merchant">("student");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [selectedQR, setSelectedQR] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No token found");

      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      console.warn("Using offline fallback for reservations listing:", err);
      // Load offline simulated reservations from localStorage
      const offline = JSON.parse(localStorage.getItem("offline_reservations") || "[]");
      setReservations(offline);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No token found");

      const response = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });

      if (!response.ok) throw new Error("Cancel failed");
      toast.success("Reservation cancelled and stock restored.");
      fetchReservations();
    } catch (err) {
      console.warn("Cancelling local reservation offline:", err);
      // Update local storage
      const offline = JSON.parse(localStorage.getItem("offline_reservations") || "[]");
      const updated = offline.map((r: any) => r._id === id || r.reservationId === id ? { ...r, status: "cancelled" } : r);
      localStorage.setItem("offline_reservations", JSON.stringify(updated));
      setReservations(updated);
      toast.success("Reservation cancelled (Offline Mode).");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyId) return;

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No token found");

      const response = await fetch(`${API_BASE_URL}/api/reservations/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ reservationId: verifyId.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Verification failed");
      }

      toast.success("Reservation verified! Book marked as collected.");
      setVerifyId("");
      fetchReservations();
    } catch (err: any) {
      console.warn("Verifying offline reservation:", err.message);
      // Simulate verification on localStorage
      const offline = JSON.parse(localStorage.getItem("offline_reservations") || "[]");
      const matchIdx = offline.findIndex((r: any) => r.reservationId === verifyId.trim());
      if (matchIdx >= 0) {
        offline[matchIdx].status = "completed";
        localStorage.setItem("offline_reservations", JSON.stringify(offline));
        setReservations(offline);
        toast.success(`Verified "${offline[matchIdx].book?.title}" pickup!`);
        setVerifyId("");
      } else {
        toast.error("Invalid reservation ID or not found in local offline storage.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending Hold</span>;
      case "completed":
        return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>;
      case "cancelled":
        return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20 flex items-center gap-1"><XCircle className="w-3 h-3"/> Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Expired</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 max-w-6xl mx-auto w-full">
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Reservations Portal</h1>
            <p className="text-muted-foreground mt-1">Manage active holds, pickup confirmations, and scanner verifications.</p>
          </div>
          <Button variant="outline" onClick={fetchReservations} className="flex gap-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Refresh Portal
          </Button>
        </div>

        {/* Tabs Control */}
        <div className="flex bg-muted/40 p-1.5 rounded-2xl max-w-md border border-border/40 mb-8">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition-all ${
              activeTab === "student" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Reservations (Buyer)
          </button>
          <button
            onClick={() => setActiveTab("merchant")}
            className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition-all ${
              activeTab === "merchant" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Merchant Verify (Seller)
          </button>
        </div>

        {activeTab === "student" ? (
          /* Student active reservations */
          <div className="space-y-6">
            {loading ? (
              <div className="h-40 rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
            ) : reservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reservations.map((resv) => (
                  <div
                    key={resv._id || resv.reservationId}
                    className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-6 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-mono text-primary font-bold">ID: {resv.reservationId}</span>
                        {getStatusBadge(resv.status)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl">{resv.book ? resv.book.title : "Book"}</h3>
                        <p className="text-sm text-muted-foreground">Author: {resv.book ? resv.book.author : "Unknown"}</p>
                      </div>
                      <div className="pt-3 border-t border-border/20 space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Seller / Store:</span>
                          <span className="font-semibold text-foreground">{resv.seller.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expires At:</span>
                          <span className="font-semibold text-rose-500">
                            {new Date(resv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(resv.expiresAt).toLocaleDateString()})
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-black text-foreground">₹{resv.price}</span>
                        </div>
                      </div>
                    </div>

                    {resv.status === "pending" && (
                      <div className="mt-6 flex gap-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedQR(resv)}
                          className="flex-1 rounded-xl flex gap-2 border-border/60 hover:bg-muted"
                        >
                          <QrCode className="w-4 h-4" /> View QR Code
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancel(resv._id || resv.reservationId)}
                          className="flex-1 rounded-xl"
                        >
                          Cancel Hold
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/60">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground/60 mb-4" />
                <h3 className="text-2xl font-bold">No reservations found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  You haven't reserved any books yet. Go to Nearby Search to find and hold local inventory!
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Merchant Verification Desk */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="font-bold text-2xl">QR / ID Pickup Desk</h3>
                  <p className="text-muted-foreground text-sm mt-1">Scan or type reservation code to issue the book.</p>
                </div>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Reservation ID</label>
                    <Input
                      type="text"
                      placeholder="e.g. DK-RES-87AB2"
                      value={verifyId}
                      onChange={(e) => setVerifyId(e.target.value)}
                      className="rounded-xl border-border/60 uppercase"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl py-6 bg-gradient-to-r from-primary to-indigo-600">
                    Verify & Release Book
                  </Button>
                </form>
              </div>
            </div>

            {/* List of bookings received */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xl">Incoming Hold Orders</h3>
              {loading ? (
                <div className="h-40 rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
              ) : reservations.filter(r => r.status === "pending").length > 0 ? (
                <div className="space-y-4">
                  {reservations.filter(r => r.status === "pending").map((resv) => (
                    <div
                      key={resv._id || resv.reservationId}
                      className="rounded-2xl border border-border/40 bg-card/45 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary text-sm font-bold">{resv.reservationId}</span>
                          <span className="text-xs text-muted-foreground">• Reserved by {resv.buyer.name}</span>
                        </div>
                        <h4 className="font-bold text-lg text-foreground">{resv.book?.title}</h4>
                        <p className="text-xs text-rose-500 font-semibold">
                          Hold Expires: {new Date(resv.expiresAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <span className="font-black text-xl">₹{resv.price}</span>
                        <Button 
                          onClick={() => {
                            setVerifyId(resv.reservationId);
                            toast.info(`ID loaded to verification desk.`);
                          }}
                          variant="outline" 
                          className="rounded-xl"
                        >
                          Select Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/20 rounded-3xl border border-dashed border-border/60">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-muted-foreground">No pending holds received from students.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* QR Code Popup */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold">Hold Ticket</h2>
              <p className="text-muted-foreground text-sm">Present this QR code to the bookstore vendor.</p>
            </div>

            {/* QR Mock Render */}
            <div className="w-56 h-56 mx-auto bg-white p-4 rounded-3xl border border-border/60 flex flex-col items-center justify-center space-y-3">
              <QrCode className="w-36 h-36 text-slate-800" />
              <span className="font-mono font-bold text-slate-900 tracking-wider text-sm">{selectedQR.reservationId}</span>
            </div>

            <p className="text-sm font-semibold text-primary">{selectedQR.book?.title}</p>

            <Button className="w-full rounded-xl" onClick={() => setSelectedQR(null)}>
              Close Ticket
            </Button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
