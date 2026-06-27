import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Plus, 
  Book,  
  User, 
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Upload,
  Search,
  Filter,
  Phone,
  Settings,
  Sparkles,
  Info,
  Calendar,
  Lock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SellerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  showPhone: boolean;
}

interface SellerBook {
  id: number | string;
  title: string;
  author: string;
  price: number;
  condition: string;
  status: string;
  date: string;
  sales: number;
  revenue: number;
  sellerEmail: string;
  category?: string;
  description?: string;
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getAuthHeaders, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"add" | "manage" | "inquiries" | "analytics" | "profile">("add");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  const fetchInquiries = async () => {
    if (!authUser) return;
    setInquiriesLoading(true);
    try {
      const response = await fetch("http://localhost:3003/api/chats", {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setInquiries(await response.json());
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inquiries") {
      fetchInquiries();
    }
  }, [activeTab]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    condition: "good",
    description: "",
    category: "ncert",
  });
  const [bookImages, setBookImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [sellerBooks, setSellerBooks] = useState<SellerBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      const sellerDataString = localStorage.getItem(`seller_${authUser.email}`);
      if (sellerDataString) {
        const parsedSellerData = JSON.parse(sellerDataString);
        if (parsedSellerData.showPhone === undefined) {
          parsedSellerData.showPhone = false;
        }
        setSellerData(parsedSellerData);
      }
      checkSellerStatus(authUser.id || authUser._id);
    } else {
      toast.error("Please sign in to view seller dashboard");
      navigate("/");
    }
  }, [authUser, navigate]);

  const checkSellerStatus = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3003/api/users/${userId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.userType === 'seller') {
          fetchSellerBooks(userId);
        } else if (userData.sellerRequest && userData.sellerRequest.requested && !userData.sellerRequest.approved) {
          toast.warning("Your seller application is pending approval");
          navigate('/');
        } else {
          toast.error("Access denied. Verified sellers only");
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error checking seller status:', error);
    }
  };

  const fetchSellerBooks = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3003/api/books/seller/${userId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const books = await response.json();
        const transformedBooks = books.map((book: any) => ({
          id: book._id,
          title: book.title,
          author: book.author,
          price: book.price,
          condition: book.condition,
          status: book.status === "available" ? "Published" : "Pending",
          date: book.createdAt ? new Date(book.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          sales: 0,
          revenue: 0,
          sellerEmail: authUser?.email || "",
          category: book.category,
          description: book.description,
        }));
        setSellerBooks(transformedBooks);
      }
    } catch (error) {
      console.error("Error fetching seller books:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBookImages(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setIsLoading(true);
    
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: parseInt(formData.price),
        category: formData.category,
        condition: formData.condition,
        seller: authUser.id || authUser._id,
        sellerName: authUser.name || "Unknown Seller",
        contactInfo: {
          phone: sellerData?.phone || "",
          email: authUser.email
        },
        status: "available"
      };
      
      const response = await fetch("http://localhost:3003/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(bookData),
      });
      
      if (response.ok) {
        const newBook = await response.json();
        
        const updatedBooks: SellerBook[] = [...sellerBooks, {
          id: newBook._id,
          title: newBook.title,
          author: newBook.author,
          price: newBook.price,
          condition: newBook.condition,
          status: "Published",
          date: new Date().toISOString().split('T')[0],
          sales: 0,
          revenue: 0,
          sellerEmail: authUser?.email || "",
          category: newBook.category,
          description: newBook.description,
        }];
        setSellerBooks(updatedBooks);
        
        setFormData({
          title: "",
          author: "",
          price: "",
          condition: "good",
          description: "",
          category: "ncert",
        });
        setBookImages([]);
        setImagePreviews([]);
        
        toast.success("Textbook listed successfully!");
        setActiveTab("manage");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to list textbook");
      }
    } catch (error) {
      toast.error("An error occurred listing this book");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBook = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    try {
      const response = await fetch(`http://localhost:3003/api/books/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setSellerBooks(prev => prev.filter(b => b.id !== id));
        toast.success("Listing removed successfully");
      } else {
        toast.error("Failed to remove listing");
      }
    } catch (e) {
      toast.error("Error deleting book");
    }
  };

  const handlePhoneVisibilityChange = (checked: boolean) => {
    if (sellerData) {
      const updatedSellerData = { ...sellerData, showPhone: checked };
      setSellerData(updatedSellerData);
      localStorage.setItem(`seller_${sellerData.email}`, JSON.stringify(updatedSellerData));
      toast.success(checked ? "Phone number is now visible to buyers" : "Phone number hidden from listings");
    }
  };

  const filteredBooks = sellerBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || book.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { title: "Active Listings", value: sellerBooks.length.toString(), icon: Book, bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    { title: "Status Published", value: sellerBooks.filter(b => b.status === "Published").length.toString(), icon: BookOpen, bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    { title: "Earned Revenue", value: `₹${sellerBooks.reduce((sum, book) => sum + book.revenue, 0)}`, icon: DollarSign, bg: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  ];

  const inputCls = "h-11 bg-white/80 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all rounded-xl text-sm";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Welcome Seller Header */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-card mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse-scale" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Seller Hub
                </h1>
                <p className="text-xs text-muted-foreground">Manage your second-hand books & student listings</p>
              </div>
            </div>
            <div className="text-right sm:text-left self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-800">
                <User className="w-3.5 h-3.5 text-emerald-600" /> {sellerData?.name || "Verified Student Seller"}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className={`border rounded-2xl p-5 shadow-sm flex items-center justify-between bg-card border-border/40`}>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Navigation */}
          <div className="flex rounded-2xl bg-muted/60 border border-border/40 p-1 mb-8 max-w-xl">
            {[
              { id: "add", label: "List Textbook" },
              { id: "manage", label: "Manage Books" },
              { id: "inquiries", label: "Buyer Inquiries" },
              { id: "analytics", label: "Analytics" },
              { id: "profile", label: "Profile" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-card shadow-sm text-amber-600 border border-border/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-3xl border border-border/40 shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">List textbook for sale</CardTitle>
                    <CardDescription>Fill in your textbook details to post it immediately</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label htmlFor="title" className="text-xs font-semibold text-gray-700">Book Title</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Physics Concepts Vol 1"
                            className={inputCls}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="author" className="text-xs font-semibold text-gray-700">Author</Label>
                          <Input
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            placeholder="e.g. H.C. Verma"
                            className={inputCls}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="price" className="text-xs font-semibold text-gray-700">Price (₹)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="e.g. 150"
                            className={inputCls}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="condition" className="text-xs font-semibold text-gray-700">Condition</Label>
                          <Select 
                            name="condition" 
                            value={formData.condition} 
                            onValueChange={(val) => handleSelectChange("condition", val)}
                          >
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Excellent">Excellent (Like New)</SelectItem>
                              <SelectItem value="Good">Good (Minor wear)</SelectItem>
                              <SelectItem value="Fair">Fair (Readable/Marked)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label htmlFor="category" className="text-xs font-semibold text-gray-700">Syllabus / Category</Label>
                          <Select 
                            name="category" 
                            value={formData.category} 
                            onValueChange={(val) => handleSelectChange("category", val)}
                          >
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ncert">NCERT Books</SelectItem>
                              <SelectItem value="reference">Reference Books</SelectItem>
                              <SelectItem value="competitive">Competitive Exams</SelectItem>
                              <SelectItem value="government">Government Exams</SelectItem>
                              <SelectItem value="fiction">Fiction</SelectItem>
                              <SelectItem value="nonfiction">Non-Fiction</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label htmlFor="description" className="text-xs font-semibold text-gray-700">Textbook Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe markings, highlights, missing pages, or semesters..."
                            className="rounded-xl border border-gray-200"
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* Photo Upload Container */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-700">Book Photo Upload</Label>
                        <div className="border-2 border-dashed border-border/60 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-all">
                          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs font-bold text-foreground">Upload clear book snapshots</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Helps buyers inspect condition instantly</p>
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-4 max-w-xs mx-auto text-xs"
                          />
                        </div>
                        
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                            {imagePreviews.map((preview, idx) => (
                              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border/40 shadow-sm">
                                <img
                                  src={preview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                    setBookImages(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-red-500/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl h-13 shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        {isLoading ? "Posting textbook..." : "Post Textbook Listing"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "manage" && (
              <motion.div
                key="manage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-3xl border border-border/40 shadow-card overflow-hidden">
                  <CardHeader className="bg-muted/20 border-b border-border/20 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-base font-bold">Manage Listed Books</CardTitle>
                        <CardDescription className="text-xs">Update status or remove items</CardDescription>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search by title..."
                            className="pl-9 h-9 text-xs rounded-xl bg-card"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredBooks.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-sm">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        No textbooks found matching your search.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/10">
                            <TableRow>
                              <TableHead className="text-xs font-bold text-muted-foreground">Title</TableHead>
                              <TableHead className="text-xs font-bold text-muted-foreground">Author</TableHead>
                              <TableHead className="text-xs font-bold text-muted-foreground">Price</TableHead>
                              <TableHead className="text-xs font-bold text-muted-foreground">Condition</TableHead>
                              <TableHead className="text-xs font-bold text-muted-foreground">Status</TableHead>
                              <TableHead className="text-xs font-bold text-muted-foreground">Listed Date</TableHead>
                              <TableHead className="text-xs font-bold text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBooks.map((book) => (
                              <TableRow key={book.id}>
                                <TableCell className="font-bold text-sm text-foreground">{book.title}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{book.author}</TableCell>
                                <TableCell className="font-bold text-sm">₹{book.price}</TableCell>
                                <TableCell className="text-xs capitalize">{book.condition}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      book.status === "Published" 
                                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px]" 
                                        : "bg-amber-50 border border-amber-200 text-amber-800 text-[10px]"
                                    }
                                  >
                                    {book.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{book.date}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => navigate(`/book/${book.id}`)}
                                      className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => deleteBook(book.id)}
                                      className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center px-6 py-4 border-t border-border/20 text-xs">
                    <span className="text-muted-foreground">Showing {filteredBooks.length} listings</span>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {activeTab === "inquiries" && (
              <motion.div
                key="inquiries"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-3xl border border-border/40 shadow-card overflow-hidden">
                  <CardHeader className="bg-muted/20 border-b border-border/20 px-6 py-4">
                    <div>
                      <CardTitle className="text-base font-bold">Buyer Inquiries</CardTitle>
                      <CardDescription className="text-xs">Chat directly with students interested in your listed textbooks</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {inquiriesLoading ? (
                      <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                        <p className="text-xs">Loading customer inquiries...</p>
                      </div>
                    ) : inquiries.length === 0 ? (
                      <div className="py-16 text-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                        <h4 className="font-bold text-sm text-foreground mb-1">No inquiries yet</h4>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Inquiries will show up here once students click "Chat with Seller" on your textbook listings.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {inquiries.map((inquiry: any) => {
                          const buyerParticipant = inquiry.participants.find((p: any) => String(p._id) !== String(authUser?.id || authUser?._id));
                          const buyerName = buyerParticipant?.name || buyerParticipant?.email || "Student Buyer";
                          const buyerInitials = buyerName.substring(0, 2).toUpperCase();
                          const lastMsg = inquiry.messages?.length ? inquiry.messages[inquiry.messages.length - 1].text : "No messages yet";
                          const unreadCount = inquiry.unreadCount || 0;
                          
                          return (
                            <div 
                              key={inquiry._id}
                              onClick={() => navigate(`/chat/${inquiry._id}`)}
                              className="flex items-center gap-4 p-4 border border-border/40 hover:border-amber-500/50 rounded-2xl cursor-pointer bg-card hover:shadow-sm transition-all group"
                            >
                              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {buyerInitials}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-bold text-xs text-foreground truncate group-hover:text-amber-600 transition-colors">
                                    {buyerName}
                                  </h4>
                                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                    {new Date(inquiry.lastUpdated).toLocaleDateString()}
                                  </span>
                                </div>
                                {inquiry.book && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-lg text-[9px] text-amber-800 font-semibold mb-1">
                                    <BookOpen className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                                    <span className="truncate max-w-[200px]">{inquiry.book.title}</span>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground truncate">{lastMsg}</p>
                              </div>
                              <div className="flex-shrink-0 pl-2">
                                {unreadCount > 0 ? (
                                  <span className="bg-amber-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                                    {unreadCount}
                                  </span>
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="md:col-span-2 rounded-3xl border border-border/40 shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Earnings & Engagement</CardTitle>
                    <CardDescription>Visual tracker for semester earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex flex-col items-center justify-center bg-muted/20 border border-border/20 rounded-2xl p-4 text-center">
                      <TrendingUp className="w-10 h-10 text-amber-500 mb-2 animate-pulse-scale" />
                      <p className="font-bold text-sm text-foreground">Sales Tracker</p>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1">Earnings show once orders are approved and verified during campus pick-ups.</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="rounded-3xl border border-border/40 shadow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-muted-foreground">Most Visited Listings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sellerBooks.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No active listings to show</p>
                      ) : (
                        sellerBooks.slice(0, 3).map((b, i) => (
                          <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-border/10 last:border-0 last:pb-0">
                            <span className="font-bold text-foreground truncate max-w-[120px]">{b.title}</span>
                            <Badge variant="secondary" className="text-[10px]">Active</Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="rounded-3xl border border-border/40 shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Seller Information</CardTitle>
                    <CardDescription>Manage contact preferences shown to other students</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Reveal Phone to Campus Buyers</p>
                          <p className="text-[10px] text-muted-foreground">
                            Let other students call you directly to secure the textbook
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={sellerData?.showPhone || false}
                        onCheckedChange={handlePhoneVisibilityChange}
                      />
                    </div>
                    
                    {sellerData && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Seller Name</label>
                          <Input value={sellerData.name} className="h-11 rounded-xl" disabled />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">University Email</label>
                          <Input value={sellerData.email} className="h-11 rounded-xl" disabled />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                          <Input value={sellerData.phone} className="h-11 rounded-xl" disabled />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Campus Location</label>
                          <Input value={sellerData.location} className="h-11 rounded-xl" disabled />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground">Bio Description</label>
                          <Textarea value={sellerData.bio} className="rounded-xl" disabled rows={3} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;