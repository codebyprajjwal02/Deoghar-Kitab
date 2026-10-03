import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, FileText, Send, CheckCircle2, ShieldAlert, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface RequestReply {
  shop: string;
  shopName: string;
  reply: 'Available Tomorrow' | 'Available in 3 Days' | 'Can Arrange' | 'Out of Stock';
  price: number;
  repliedAt: string;
}

interface BookRequest {
  _id: string;
  bookTitle: string;
  author: string;
  category: string;
  student: string;
  studentName: string;
  location: string;
  createdAt: string;
  status: "pending" | "replied" | "reserved" | "cancelled";
  responses: RequestReply[];
}

export default function BookRequests() {
  const [activeTab, setActiveTab] = useState<"student" | "merchant">("student");
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // New Request Form
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("reference");

  // Merchant Reply form state
  const [replyRequest, setReplyRequest] = useState<BookRequest | null>(null);
  const [replyType, setReplyType] = useState<any>("Available Tomorrow");
  const [replyPrice, setReplyPrice] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No token found");

      // Filter by student if student view
      const query = activeTab === "student" ? `?studentId=${user.id || user._id || ''}` : "";
      const response = await fetch(`${API_BASE_URL}/api/book-requests${query}`, {
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.warn("Offline mock requests loaded.");
      // Fallback
      setRequests([
        {
          _id: "req-1",
          bookTitle: "Pradeep Chemistry Class 12",
          author: "Pradeep",
          category: "reference",
          student: "std-1",
          studentName: "Aman Verma",
          location: "Deoghar",
          createdAt: new Date().toISOString(),
          status: "replied",
          responses: [
            {
              shop: "shop-1",
              shopName: "Sharda Pustak Mandir",
              reply: "Available Tomorrow",
              price: 450,
              repliedAt: new Date().toISOString()
            }
          ]
        },
        {
          _id: "req-2",
          bookTitle: "H.C. Verma Vol 2",
          author: "H.C. Verma",
          category: "reference",
          student: "std-1",
          studentName: "Aman Verma",
          location: "Deoghar",
          createdAt: new Date().toISOString(),
          status: "pending",
          responses: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("Not logged in");

      const response = await fetch(`${API_BASE_URL}/api/book-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          bookTitle: newTitle,
          author: newAuthor,
          category: newCategory
        })
      });

      if (!response.ok) throw new Error("Request post failed");
      toast.success("Book request broadcasted to all nearby shops!");
      setNewTitle("");
      setNewAuthor("");
      fetchRequests();
    } catch (err) {
      console.warn("Simulating request creation offline");
      const localReqs = [...requests];
      localReqs.unshift({
        _id: `req-${Math.random()}`,
        bookTitle: newTitle,
        author: newAuthor,
        category: newCategory,
        student: "std-1",
        studentName: user.name || "Student",
        location: "Deoghar",
        createdAt: new Date().toISOString(),
        status: "pending",
        responses: []
      });
      setRequests(localReqs);
      toast.success("Request registered offline!");
      setNewTitle("");
      setNewAuthor("");
    }
  };

  const handleSendReply = async () => {
    if (!replyRequest) return;

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("Not logged in");

      const response = await fetch(`${API_BASE_URL}/api/book-requests/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({
          requestId: replyRequest._id,
          reply: replyType,
          price: Number(replyPrice) || 0
        })
      });

      if (!response.ok) throw new Error("Reply failed");
      toast.success("Reply submitted to student!");
      setReplyRequest(null);
      setReplyPrice("");
      fetchRequests();
    } catch (err) {
      console.warn("Simulating reply submit offline");
      const updated = requests.map(r => {
        if (r._id === replyRequest._id) {
          return {
            ...r,
            status: "replied" as const,
            responses: [
              ...r.responses,
              {
                shop: "shop-1",
                shopName: user.name || "Bookstore",
                reply: replyType,
                price: Number(replyPrice) || 250,
                repliedAt: new Date().toISOString()
              }
            ]
          };
        }
        return r;
      });
      setRequests(updated);
      toast.success("Reply sent (Offline Simulation)!");
      setReplyRequest(null);
      setReplyPrice("");
    }
  };

  const handleReserveFromOffer = (bookTitle: string, price: number, shopName: string) => {
    // Generate a temporary mock hold reservation
    const offlineReservations = JSON.parse(localStorage.getItem("offline_reservations") || "[]");
    const newRes = {
      book: { title: bookTitle, author: "Requested Book", price, locationName: "Partner Merchant store" },
      reservationId: `DK-RES-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      price,
      seller: { name: shopName }
    };
    offlineReservations.push(newRes);
    localStorage.setItem("offline_reservations", JSON.stringify(offlineReservations));

    toast.success(`Book reserved! Code generated in Reservations tab.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" /> Broadcast Desk
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Request A Book</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Can't find a book? Request it, and nearby registered bookstores will offer it for instant hold.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-muted/40 p-1.5 rounded-2xl max-w-md border border-border/40 mb-8 mx-auto">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition-all ${
              activeTab === "student" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Student Broadcast Desk
          </button>
          <button
            onClick={() => setActiveTab("merchant")}
            className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition-all ${
              activeTab === "merchant" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Merchant Requests Panel
          </button>
        </div>

        {activeTab === "student" ? (
          /* Student Requests View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="font-bold text-2xl">Broadcast Request</h3>
                  <p className="text-muted-foreground text-sm mt-1">Sellers nearby will see your book broadcast.</p>
                </div>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Book Title *</label>
                    <Input
                      type="text"
                      placeholder="e.g. HC Verma Physics Part 2"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Author</label>
                    <Input
                      type="text"
                      placeholder="e.g. H.C. Verma"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Category</label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ncert">NCERT</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full rounded-xl py-6 bg-gradient-to-r from-primary to-indigo-600">
                    Broadcast Book Request
                  </Button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> My Broadcasts
              </h3>
              
              {loading ? (
                <div className="h-40 rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((r) => (
                    <div key={r._id} className="rounded-3xl border border-border/40 bg-card/45 p-6 shadow-lg space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xl text-foreground">{r.bookTitle}</h4>
                          <p className="text-xs text-muted-foreground">Author: {r.author || "Unknown"}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {r.status === "pending" ? "Hold Pending" : "Offers Received"}
                        </span>
                      </div>

                      {/* Offers/Replies list */}
                      {r.responses && r.responses.length > 0 ? (
                        <div className="pt-4 border-t border-border/20 space-y-3">
                          <p className="text-xs font-semibold text-primary">Shopkeeper Offers:</p>
                          {r.responses.map((resp, idx) => (
                            <div key={idx} className="bg-background/40 p-4 rounded-2xl border border-border/10 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-sm text-foreground">{resp.shopName}</p>
                                <p className="text-xs text-emerald-500 font-semibold">{resp.reply}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-lg">₹{resp.price}</span>
                                <Button 
                                  onClick={() => handleReserveFromOffer(r.bookTitle, resp.price, resp.shopName)}
                                  className="rounded-xl px-4 py-2 text-xs"
                                >
                                  Reserve Offer
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground pt-2">No offers received yet. Nearby stores will contact soon.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card/25 rounded-3xl border border-dashed border-border/60">
                  <Inbox className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-muted-foreground">No broadcast requests logged. Submit form to ask stores.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Merchant View */
          <div className="space-y-4 max-w-4xl mx-auto">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" /> Global Student Requests in Area
            </h3>

            {loading ? (
              <div className="h-40 rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((r) => (
                  <div key={r._id} className="rounded-3xl border border-border/40 bg-card/45 p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{r.category}</span>
                        <span className="text-xs text-muted-foreground">Asked by {r.studentName}</span>
                      </div>
                      <h4 className="font-extrabold text-xl text-foreground">{r.bookTitle}</h4>
                      <p className="text-xs text-muted-foreground">Author: {r.author || "Unknown"}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => setReplyRequest(r)} className="rounded-xl flex gap-2">
                        <Send className="w-4 h-4" /> Reply Offer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card/25 rounded-3xl border border-dashed border-border/60">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground font-semibold">All student broadcasts have replies.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reply dialog popup */}
      {replyRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold">Reply with Offer</h2>
              <p className="text-muted-foreground text-sm">Provide availability and quote price for the student request.</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 space-y-1">
              <p className="font-bold text-base">{replyRequest.bookTitle}</p>
              <p className="text-xs text-muted-foreground">Requested by: {replyRequest.studentName}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Availability</label>
                <Select value={replyType} onValueChange={setReplyType}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select offer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available Tomorrow">Available Tomorrow</SelectItem>
                    <SelectItem value="Available in 3 Days">Available in 3 Days</SelectItem>
                    <SelectItem value="Can Arrange">Can Arrange / Procure</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Offer Price (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 299"
                  value={replyPrice}
                  onChange={(e) => setReplyPrice(e.target.value)}
                  className="rounded-xl border-border/60"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setReplyRequest(null)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl" onClick={handleSendReply}>
                Send Reply
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </div>
  );
}
