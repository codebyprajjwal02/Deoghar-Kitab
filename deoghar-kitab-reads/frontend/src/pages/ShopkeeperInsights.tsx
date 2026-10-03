import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertCircle, Sparkles, Inbox, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

interface InsightData {
  lowStock: any[];
  trending: { query: string; count: number }[];
  recommendations: { query: string; count: number }[];
  requests: any[];
  forecasts: { category: string; message: string }[];
}

export default function ShopkeeperInsights() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("No auth token");

      const response = await fetch(`${API_BASE_URL}/api/analytics/shopkeeper`, {
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.warn("Offline mock insights for analytics page");
      setInsights({
        lowStock: [
          { _id: "1", title: "H.C. Verma Concepts of Physics Vol 1", stock: 1, price: 320 },
          { _id: "2", title: "Class 10 NCERT Science Textbook", stock: 0, price: 120 }
        ],
        trending: [
          { query: "class 10 ncert science", count: 42 },
          { query: "jee main past papers", count: 35 },
          { query: "rd sharma class 11", count: 28 },
          { query: "wren and martin grammar", count: 22 }
        ],
        recommendations: [
          { query: "neet biology guide 2026", count: 18 },
          { query: "class 12 chemistry pradeep", count: 14 },
          { query: "lucents general knowledge", count: 12 }
        ],
        requests: [
          { _id: "req-1", bookTitle: "NEET Objective Biology", studentName: "Rohan Kumar", createdAt: new Date().toISOString() },
          { _id: "req-2", bookTitle: "RS Aggarwal Class 9 Math", studentName: "Pooja Kumari", createdAt: new Date().toISOString() }
        ],
        forecasts: [
          { category: "NCERT", message: "Class 10 NCERT Science books are projected to spike 25% due to upcoming mid-terms." },
          { category: "Competitive", message: "JEE Reference books are seeing 15% higher local searches compared to last month." },
          { category: "Fiction", message: "Fiction titles see consistent weekend demand. Consider running weekend bundles." }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 max-w-6xl mx-auto w-full">
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" /> Shopkeeper Insights
            </h1>
            <p className="text-muted-foreground mt-1">Real-time demand forecasting, stock metrics, and purchase recommendations.</p>
          </div>
          <Button variant="outline" onClick={fetchInsights} disabled={loading} className="flex gap-2 rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Analytics
          </Button>
        </div>

        {loading || !insights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-muted/40 animate-pulse border border-border/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demand Forecast AI Card */}
            <div className="rounded-3xl border border-border/40 bg-gradient-to-br from-indigo-500/10 to-primary/5 p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/20 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-2xl">Demand Forecast (AI Engine)</h3>
              </div>
              <div className="space-y-4">
                {insights.forecasts.map((f, idx) => (
                  <div key={idx} className="bg-card/70 p-4 rounded-2xl border border-border/20 space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                      {f.category}
                    </span>
                    <p className="text-sm text-foreground mt-1">{f.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Local Searches Card */}
            <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-2xl">Top Search Queries (30 Days)</h3>
              </div>
              <div className="space-y-3">
                {insights.trending.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/40 p-3.5 rounded-2xl border border-border/10">
                    <span className="font-medium text-foreground text-sm truncate capitalize">{t.query}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                      {t.count} Searches
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Alerts (Low & Out of stock) */}
            <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-2xl">Low Stock Alarms</h3>
              </div>
              {insights.lowStock.length > 0 ? (
                <div className="space-y-3">
                  {insights.lowStock.map((b) => (
                    <div key={b._id} className="flex justify-between items-center bg-rose-500/5 p-3.5 rounded-2xl border border-rose-500/20">
                      <div className="truncate max-w-[70%]">
                        <h4 className="font-bold text-sm text-foreground truncate">{b.title}</h4>
                        <p className="text-xs text-muted-foreground">Price: ₹{b.price}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                        {b.stock === 0 ? "Out of Stock" : `${b.stock} Left`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                  <p className="text-muted-foreground text-sm">All inventory is safely stocked!</p>
                </div>
              )}
            </div>

            {/* Recommended Catalog Extensions */}
            <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-2xl">Recommended Inventory</h3>
              </div>
              <p className="text-xs text-muted-foreground">These items were searched locally by students but are not present in any seller catalogs. Stocking these will maximize store sales.</p>
              <div className="space-y-3">
                {insights.recommendations.map((r, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-amber-500/5 p-3.5 rounded-2xl border border-amber-500/20">
                    <span className="font-medium text-foreground text-sm truncate capitalize">{r.query}</span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                      High Demand
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending student requests in area */}
            <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500">
                  <Inbox className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-2xl">Active Book Requests from Local Students</h3>
              </div>
              {insights.requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.requests.map((r) => (
                    <div key={r._id} className="bg-background/50 p-4 rounded-2xl border border-border/20 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-base text-foreground">{r.bookTitle}</h4>
                        <p className="text-xs text-muted-foreground">Requested by {r.studentName}</p>
                      </div>
                      <Button onClick={() => window.location.href = "/requests"} className="rounded-xl px-4 py-2 text-xs">
                        Respond Now
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                  <p className="text-muted-foreground text-sm">No out-of-stock student requests pending.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
