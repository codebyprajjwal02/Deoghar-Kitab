import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Upload, Barcode, AlertTriangle, Layers, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface BookItem {
  title: string;
  author: string;
  price: number;
  condition: string;
  category: string;
  stock: number;
  barcode: string;
}

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState<"upload" | "scanner">("upload");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedBook, setScannedBook] = useState<BookItem | null>(null);
  
  // CSV upload state
  const [csvContent, setCsvContent] = useState("");
  const [previewBooks, setPreviewBooks] = useState<BookItem[]>([]);
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyInventory();
  }, []);

  const fetchMyInventory = async () => {
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const sellerId = user.id || user._id;
      if (!sellerId) return;

      const response = await fetch(`${API_BASE_URL}/api/books/seller/${sellerId}`);
      if (!response.ok) throw new Error("API fail");
      const data = await response.json();
      setMyBooks(data);
    } catch (err) {
      console.warn("Offline mock list for inventory dashboard");
      setMyBooks([
        { _id: "inv-1", title: "NCERT Physics Class 12", author: "NCERT", price: 150, stock: 2, barcode: "9788174505663" },
        { _id: "inv-2", title: "HC Verma Physics", author: "HC Verma", price: 320, stock: 0, barcode: "9788177091877" }
      ]);
    }
  };

  const handleBarcodeLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/barcode/${barcodeInput.trim()}`);
      if (!response.ok) throw new Error("Barcode not found");
      const data = await response.json();
      setScannedBook({
        title: data.title,
        author: data.author,
        price: data.price,
        condition: data.condition || "Good",
        category: data.category || "NCERT",
        stock: data.stock || 1,
        barcode: data.barcode
      });
      toast.success("Barcode match found!");
    } catch (err) {
      // Offline fallback lookup simulation
      const mockDatabase: Record<string, BookItem> = {
        "9788174505663": { title: "NCERT Physics Part I Class 12", author: "NCERT Group", price: 150, condition: "Good", category: "ncert", stock: 1, barcode: "9788174505663" },
        "9788174505120": { title: "Concepts of Physics Vol 1", author: "H.C. Verma", price: 340, condition: "New", category: "reference", stock: 1, barcode: "9788174505120" }
      };

      const match = mockDatabase[barcodeInput.trim()];
      if (match) {
        setScannedBook(match);
        toast.success("Barcode match found (Offline DB)!");
      } else {
        toast.error("Barcode not in system. Try entering title manually.");
        setScannedBook({
          title: "Unknown Book Spec",
          author: "Scan Result",
          price: 250,
          condition: "Like New",
          category: "reference",
          stock: 1,
          barcode: barcodeInput
        });
      }
    }
  };

  const parseCsv = () => {
    if (!csvContent) {
      toast.error("Please paste CSV data first");
      return;
    }

    try {
      const lines = csvContent.split("\n");
      const parsed: BookItem[] = [];
      
      // Skip header line, format: title,author,price,category,stock,barcode
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [title, author, price, category, stock, barcode] = line.split(",");
        
        parsed.push({
          title: title?.replace(/"/g, "") || "Untitled Bulk Book",
          author: author?.replace(/"/g, "") || "Unknown",
          price: Number(price) || 200,
          category: category || "reference",
          condition: "Good",
          stock: Number(stock) || 1,
          barcode: barcode || ""
        });
      }

      setPreviewBooks(parsed);
      toast.success(`Successfully parsed ${parsed.length} books for preview!`);
    } catch (err) {
      toast.error("Invalid CSV formatting.");
    }
  };

  const handleBulkUploadSubmit = async () => {
    if (previewBooks.length === 0) return;
    setLoading(true);

    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) throw new Error("Access token missing");

      const response = await fetch(`${API_BASE_URL}/api/books/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ books: previewBooks })
      });

      if (!response.ok) throw new Error("Bulk upload failed");
      toast.success("Successfully uploaded inventory in bulk!");
      setPreviewBooks([]);
      setCsvContent("");
      fetchMyInventory();
    } catch (err) {
      console.warn("Bulk upload simulation offline");
      // Simulate local upload update
      const existingOffline = JSON.parse(localStorage.getItem("sellerBooks") || "[]");
      const formatted = previewBooks.map((b, idx) => ({
        id: Math.floor(Math.random() * 10000) + idx,
        title: b.title,
        author: b.author,
        price: b.price,
        condition: b.condition,
        sales: 0,
        revenue: 0,
        status: "Published",
        date: new Date().toISOString().split("T")[0],
        category: b.category,
        stock: b.stock,
        barcode: b.barcode
      }));

      localStorage.setItem("sellerBooks", JSON.stringify([...existingOffline, ...formatted]));
      toast.success(`Bulk uploaded ${previewBooks.length} books (Offline Simulation)!`);
      setPreviewBooks([]);
      setCsvContent("");
      fetchMyInventory();
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
            <h1 className="text-4xl font-extrabold tracking-tight">Smart Inventory Hub</h1>
            <p className="text-muted-foreground mt-1">Scanner lookups, spreadsheet bulk loaders, and dynamic stock alarms.</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> Resv-Sync Online
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-muted/40 p-1.5 rounded-2xl max-w-md border border-border/40 mb-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition-all ${
              activeTab === "upload" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bulk Spreadsheet Upload
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 py-3 text-center rounded-xl text-sm font-semibold transition-all ${
              activeTab === "scanner" ? "bg-card text-card-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Barcode Scanner Lookup
          </button>
        </div>

        {activeTab === "upload" ? (
          /* CSV Upload Segment */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="font-bold text-2xl">CSV Bulk Importer</h3>
                  <p className="text-muted-foreground text-sm mt-1">Paste CSV inventory logs to populate listings in one click.</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-xl font-mono text-xs text-muted-foreground space-y-1">
                  <p className="font-bold">Required CSV Layout Headers:</p>
                  <p>title,author,price,category,stock,barcode</p>
                  <p className="text-slate-400 mt-2">Example Row:</p>
                  <p>RD Sharma Maths,RD Sharma,399,reference,5,9788174505120</p>
                </div>

                <textarea
                  className="w-full h-44 rounded-xl border border-border/60 p-4 font-mono text-sm bg-background/50 focus:ring-primary"
                  placeholder='title,author,price,category,stock,barcode&#10;"Wren English Grammar","Wren",199,"reference",2,"9788174505663"'
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                />

                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-xl flex-1" onClick={() => setCsvContent("")}>
                    Clear Content
                  </Button>
                  <Button className="rounded-xl flex-1" onClick={parseCsv}>
                    Parse Spreadsheet
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Preview */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Importer Queue Preview ({previewBooks.length})
              </h3>
              
              {previewBooks.length > 0 ? (
                <div className="space-y-4">
                  <div className="max-h-80 overflow-y-auto space-y-2 border border-border/40 rounded-2xl p-4 bg-card/40">
                    {previewBooks.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-card/80 p-3 rounded-xl border border-border/20">
                        <div>
                          <h4 className="font-bold text-sm line-clamp-1">{b.title}</h4>
                          <p className="text-xs text-muted-foreground">{b.author} • {b.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary">₹{b.price}</p>
                          <p className="text-xs text-muted-foreground">Qty: {b.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleBulkUploadSubmit} 
                    disabled={loading}
                    className="w-full rounded-xl py-6 bg-gradient-to-r from-primary to-indigo-600"
                  >
                    Commit Upload Queue
                  </Button>
                </div>
              ) : (
                <div className="text-center py-20 bg-card/25 rounded-3xl border border-dashed border-border/60">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2 animate-bounce" />
                  <p className="text-muted-foreground">Preview empty. Paste and parse CSV code to load items.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Barcode Scanner Desk */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="font-bold text-2xl">ISBN Scanner / Input</h3>
                  <p className="text-muted-foreground text-sm mt-1">Provide an ISBN number to pull details instantly from database.</p>
                </div>

                <form onSubmit={handleBarcodeLookup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Scan Barcode / Enter ISBN</label>
                    <div className="relative">
                      <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g. 9788174505663"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        className="pl-12 rounded-xl border-border/60"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setBarcodeInput("9788174505663");
                        toast.info("Simulated ISBN-13 barcode scanned.");
                      }}
                      className="rounded-xl flex-grow"
                    >
                      Simulate Scan
                    </Button>
                    <Button type="submit" className="rounded-xl flex-grow bg-primary">
                      Lookup Code
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Scanned Card Results */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl">Scanned Book Output</h3>
              {scannedBook ? (
                <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-widest">{scannedBook.category}</span>
                      <h4 className="font-bold text-xl text-foreground mt-1">{scannedBook.title}</h4>
                      <p className="text-sm text-muted-foreground">Author: {scannedBook.author}</p>
                    </div>
                    <Barcode className="w-10 h-10 text-primary" />
                  </div>

                  <div className="p-4 bg-muted/40 rounded-2xl flex justify-between items-center text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Standard Price</span>
                      <p className="text-xl font-bold">₹{scannedBook.price}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Condition</span>
                      <p className="font-semibold text-primary">{scannedBook.condition}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Initial Qty</span>
                      <p className="font-semibold">{scannedBook.stock}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setScannedBook(null)}>
                      Discard
                    </Button>
                    <Button 
                      onClick={() => {
                        // Add scan result to preview list
                        setPreviewBooks([...previewBooks, scannedBook]);
                        toast.success("Scanned item added to upload queue.");
                        setScannedBook(null);
                        setBarcodeInput("");
                      }}
                      className="flex-1 rounded-xl"
                    >
                      Accept Book
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-card/25 rounded-3xl border border-dashed border-border/60">
                  <Barcode className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-muted-foreground">Provide scanner inputs to review catalog matches.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing Inventory & Low Stock Alarms */}
        <div className="mt-12 space-y-4">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Active Inventory & Stock Alerts
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBooks.map((b) => (
              <div 
                key={b._id} 
                className={`rounded-3xl border p-5 bg-card/65 flex flex-col justify-between ${
                  b.stock === 0 ? "border-rose-500/40 bg-rose-500/5" : "border-border/40"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-muted-foreground">Barcode: {b.barcode || "N/A"}</span>
                    {b.stock < 3 && (
                      <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-foreground line-clamp-1">{b.title}</h4>
                  <p className="text-xs text-muted-foreground">Author: {b.author}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center">
                  <span className="font-black text-lg text-primary">₹{b.price}</span>
                  <span className="text-sm font-semibold">Available Stock: {b.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
