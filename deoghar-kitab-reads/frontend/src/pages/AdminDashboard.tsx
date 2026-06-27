import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Book,
  User,
  Package,
  DollarSign,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Bell,
  TrendingUp,
  TrendingDown,
  Database,
  Server,
  HardDrive,
  Shield,
  Key,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the book type
interface AdminBook {
  id: number | string;
  title: string;
  author: string;
  price: number;
  condition: string;
  status: string;
  seller: string;
  date: string;
  sales?: number;
  revenue?: number;
  sellerEmail?: string;
}

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  orders: number;
}

interface Order {
  id: number;
  book: string;
  buyer: string;
  seller: string;
  amount: number;
  status: string;
  date: string;
}

interface UserData {
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  orders: number;
}

interface ProfileData {
  name: string;
  email: string;
}

// Define the seller type for the global list
interface SellerData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface RegisteredSeller extends SellerData {
  email: string;
  status: string;
  registeredDate: string;
}

// Define interfaces for better type safety
interface ExportData {
  books: AdminBook[];
  users: User[];
  orders: Order[];
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [adminEmail, setAdminEmail] = useState("");

  // State for admin profile management
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load data from backend
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  // State for pending sellers
  const [pendingSellers, setPendingSellers] = useState<RegisteredSeller[]>([]);

  const stats = [
    { title: "Total Books", value: "1,248", icon: Book, change: "+12%", trend: "up" },
    { title: "Total Users", value: "3,421", icon: Users, change: "+8%", trend: "up" },
    { title: "Total Sales", value: "₹86,420", icon: ShoppingCart, change: "+15%", trend: "up" },
    { title: "Revenue", value: "₹24,560", icon: DollarSign, change: "+5%", trend: "up" },
  ];

  const recentActivity = [
    { action: "New book listed", user: "John Doe", time: "2 mins ago" },
    { action: "Order placed", user: "Sarah Smith", time: "15 mins ago" },
    { action: "New user registered", user: "Mike Johnson", time: "1 hour ago" },
    { action: "Book sold", user: "Emma Wilson", time: "3 hours ago" },
  ];

  const systemInfo = [
    { name: "Database Status", value: "Operational", status: "success" },
    { name: "Server Load", value: "42%", status: "warning" },
    { name: "Storage Used", value: "2.4 GB / 5 GB", status: "info" },
    { name: "Last Backup", value: "2 hours ago", status: "success" },
  ];

  useEffect(() => {
    // Check if user is logged in as admin
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      if (userData.userType !== "admin") {
        // Redirect to home if not admin
        navigate("/");
      } else {
        setAdminEmail(userData.email);
        setProfileData(prev => ({ ...prev, email: userData.email }));
        
        // Fetch data from backend
        fetchBooks();
        fetchUsers();
        fetchOrders();
        fetchPendingSellers();
      }
    } else {
      // Redirect to login if not logged in
      navigate("/admin/login");
    }
  }, [navigate]);

  // Define interfaces for backend data
  interface BackendBook {
    _id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    images: string[];
    seller: string; // user ID
    sellerName: string;
    contactInfo: {
      phone: string;
      email: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  interface BackendUser {
    _id: string;
    name: string;
    email: string;
    userType: string;
    sellerRequest?: {
      requested: boolean;
      requestedAt?: string;
      approved: boolean;
      approvedAt?: string;
    };
    sellerInfo?: {
      name: string;
      phone: string;
      location: string;
      bio: string;
    };
    createdAt: string;
  }

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:3003/api/books", {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const booksData: BackendBook[] = await response.json();
        // Transform backend books to match our interface
        const transformedBooks = booksData.map((book) => ({
          id: book._id,
          title: book.title,
          author: book.author,
          price: book.price,
          condition: book.condition,
          status: book.status,
          seller: book.sellerName,
          date: book.createdAt ? new Date(book.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setBooks(transformedBooks);
      } else {
        console.error("Failed to fetch books");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3003/api/users", {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const usersData: BackendUser[] = await response.json();
        // Transform backend users to match our interface
        const transformedUsers = usersData.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.userType,
          status: "Active", // Default status, you might want to add this to your User model
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          orders: 0, // Placeholder - you may want to track this in your backend
        }));
        setUsers(transformedUsers);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      // Placeholder for orders - you'll need to implement an Orders model and API
      // For now, using mock data
      setOrders([
        { id: 1001, book: "To Kill a Mockingbird", buyer: "Alice Cooper", seller: "John Doe", amount: 299, status: "Completed", date: "2023-05-16" },
        { id: 1002, book: "1984", buyer: "Bob Martin", seller: "Sarah Smith", amount: 249, status: "Processing", date: "2023-05-19" },
        { id: 1003, book: "The Great Gatsby", buyer: "Carol White", seller: "Emma Wilson", amount: 349, status: "Shipped", date: "2023-05-23" },
        { id: 1004, book: "Pride and Prejudice", buyer: "Daniel Green", seller: "Mike Johnson", amount: 199, status: "Completed", date: "2023-05-21" },
      ]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchPendingSellers = async () => {
    try {
      // Fetch all users
      const response = await fetch("http://localhost:3003/api/users", {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const usersData: BackendUser[] = await response.json();
        // Filter for users who have requested to become sellers but are not yet approved
        const pendingSellersData = usersData
          .filter((user) => user.sellerRequest && user.sellerRequest.requested && !user.sellerRequest.approved)
          .map((user) => ({
            name: user.sellerInfo?.name || user.name,
            email: user.email,
            phone: user.sellerInfo?.phone || "",
            location: user.sellerInfo?.location || "",
            bio: user.sellerInfo?.bio || "",
            status: "pending",
            registeredDate: user.sellerRequest?.requestedAt ? new Date(user.sellerRequest.requestedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
        setPendingSellers(pendingSellersData);
      } else {
        console.error("Failed to fetch pending sellers");
      }
    } catch (error) {
      console.error("Error fetching pending sellers:", error);
    }
  };

  const handleLogout = () => {
    // Remove user from localStorage
    localStorage.removeItem("user");
    // Navigate to admin login page
    navigate("/admin/login");
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || book.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredOrders = orders.filter(order => {
    return order.book.toLowerCase().includes(searchTerm.toLowerCase()) || 
           order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
           order.seller.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const updateBookStatus = async (id: number | string, status: string) => {
    try {
      // Update the book status in the backend
      const response = await fetch(`http://localhost:3003/api/books/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Update the local state
        const updatedBooks = books.map(book => 
          book.id === id ? { ...book, status } : book
        );
        setBooks(updatedBooks);
      } else {
        console.error('Failed to update book status');
        alert('Failed to update book status');
      }
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Error updating book status');
    }
  };

  const deleteUser = async (id: number | string) => {
    try {
      // Delete the user from the backend
      const response = await fetch(`http://localhost:3003/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        // Update the local state
        setUsers(users.filter(user => user.id !== id));
      } else {
        console.error('Failed to delete user');
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleDatabaseBackup = () => {
    alert("Database backup initiated. This may take a few minutes. You will receive a notification when complete.");
  };

  const handleSystemRestart = () => {
    const confirm = window.confirm("Are you sure you want to restart the system? This will temporarily make the website unavailable.");
    if (confirm) {
      alert("System restart initiated. The website will be temporarily unavailable during restart.");
    }
  };

  const handleSecurityScan = () => {
    alert("Security scan initiated. Results will be available in the security logs.");
  };

  // Function to export data as JSON
  const exportData = (dataType: string) => {
    let dataToExport: AdminBook[] | User[] | Order[] = [];
    let filename = "";
    
    switch (dataType) {
      case 'books':
        dataToExport = books;
        filename = "books-export.json";
        break;
      case 'users':
        dataToExport = users;
        filename = "users-export.json";
        break;
      case 'orders':
        dataToExport = orders;
        filename = "orders-export.json";
        break;
      default:
        alert("Invalid data type");
        return;
    }
    
    // Create JSON string
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Function to add a new user
  const addUser = (userData: UserData) => {
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    setUsers([...users, newUser]);
  };

  // Function to update admin profile
  const updateAdminProfile = (profileData: ProfileData) => {
    setAdminEmail(profileData.email);
    // In a real app, you would update the user data in localStorage or backend
    alert("Profile updated successfully!");
    setShowProfileModal(false);
  };

  // Function to change admin password
  const changeAdminPassword = (newPassword: string) => {
    // In a real app, you would hash the password and update it in the backend
    alert("Password changed successfully!");
    setShowPasswordModal(false);
  };

  // Function to approve a seller
  const approveSeller = async (email: string) => {
    try {
      // Find the user ID by email
      const userResponse = await fetch(`http://localhost:3003/api/users`, {
        headers: getAuthHeaders()
      });
      if (userResponse.ok) {
        const usersData: BackendUser[] = await userResponse.json();
        const userToApprove = usersData.find(user => user.email === email);
        
        if (userToApprove) {
          // Approve the seller request in the backend
          const updateResponse = await fetch(`http://localhost:3003/api/users/${userToApprove._id}/approve-seller`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
          });
          
          if (updateResponse.ok) {
            // Refresh the data
            fetchPendingSellers();
            fetchUsers();
            
            alert("Seller approved successfully!");
          } else {
            const errorData = await updateResponse.json();
            alert(`Error approving seller: ${errorData.message || 'Please try again.'}`);
          }
        } else {
          alert("Seller not found.");
        }
      }
    } catch (error) {
      console.error("Error approving seller:", error);
      alert("Error approving seller. Please try again.");
    }
  };

  // Function to reject a seller
  const rejectSeller = async (email: string) => {
    try {
      // Find the user ID by email
      const userResponse = await fetch(`http://localhost:3003/api/users`, {
        headers: getAuthHeaders()
      });
      if (userResponse.ok) {
        const usersData: BackendUser[] = await userResponse.json();
        const userToReject = usersData.find(user => user.email === email);
        
        if (userToReject) {
          // Reject the seller request in the backend
          const updateResponse = await fetch(`http://localhost:3003/api/users/${userToReject._id}/reject-seller`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
          });
          
          if (updateResponse.ok) {
            // Refresh the data
            fetchPendingSellers();
            
            alert("Seller request rejected successfully!");
          } else {
            const errorData = await updateResponse.json();
            alert(`Error rejecting seller: ${errorData.message || 'Please try again.'}`);
          }
        } else {
          alert("Seller not found.");
        }
      }
    } catch (error) {
      console.error("Error rejecting seller:", error);
      alert("Error rejecting seller. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <motion.aside 
        className={`bg-card shadow-md ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">Admin Control</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {[
              { name: "Dashboard", icon: BarChart3, id: "dashboard" },
              { name: "Books", icon: Book, id: "books" },
              { name: "Users", icon: Users, id: "users" },
              { name: "Orders", icon: ShoppingCart, id: "orders" },
              { name: "Sellers", icon: User, id: "sellers" },
              { name: "Database", icon: Database, id: "database" },
              { name: "System", icon: Server, id: "system" },
              { name: "Security", icon: Key, id: "security" },
              { name: "Settings", icon: Settings, id: "settings" },
            ].map((item) => (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${sidebarOpen ? '' : 'justify-center'}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className={`w-full justify-start ${sidebarOpen ? '' : 'justify-center'}`}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold capitalize">{activeTab} Management</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="hidden md:inline">Admin: {adminEmail}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="w-5 h-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="flex items-center mt-1">
                          {stat.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemInfo.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <Badge 
                            variant={
                              item.status === "success" ? "default" : 
                              item.status === "warning" ? "secondary" : 
                              "outline"
                            }
                          >
                            {item.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Administrative Controls</CardTitle>
                    <CardDescription>Complete control over your website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("books")}>
                        <Book className="w-6 h-6" />
                        <span>Manage Books</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("users")}>
                        <Users className="w-6 h-6" />
                        <span>Manage Users</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("sellers")}>
                        <User className="w-6 h-6" />
                        <span>Manage Sellers</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("database")}>
                        <Database className="w-6 h-6" />
                        <span>Database</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "books" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Book Management</CardTitle>
                    <CardDescription>Manage all books listed on the platform</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Book
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>₹{book.price}</TableCell>
                        <TableCell>{book.condition}</TableCell>
                        <TableCell>{book.seller}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              book.status === "Published" ? "default" : 
                              book.status === "Pending" ? "secondary" : 
                              "destructive"
                            }
                          >
                            {book.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateBookStatus(book.id, book.status === "Published" ? "Pending" : "Published")}
                            >
                              {book.status === "Published" ? "Unpublish" : "Publish"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateBookStatus(book.id, "Rejected")}
                              disabled={book.status === "Rejected"}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredBooks.length} of {books.length} books
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Previous</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all users on the platform</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Seller" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Active" ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.orders}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={async () => deleteUser(user.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Previous</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {activeTab === "sellers" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Seller Management</CardTitle>
                    <CardDescription>Manage seller applications and approvals</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Sellers
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pendingSellers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Registered Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSellers.map((seller, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{seller.name}</TableCell>
                          <TableCell>{seller.email}</TableCell>
                          <TableCell>{seller.phone}</TableCell>
                          <TableCell>{seller.location}</TableCell>
                          <TableCell>{seller.registeredDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => approveSeller(seller.email)}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => rejectSeller(seller.email)}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No pending sellers</h3>
                    <p className="mt-2 text-muted-foreground">
                      All seller applications have been processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>Manage all orders on the platform</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.book}</TableCell>
                        <TableCell>{order.buyer}</TableCell>
                        <TableCell>{order.seller}</TableCell>
                        <TableCell>₹{order.amount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === "Completed" ? "default" : 
                              order.status === "Processing" ? "secondary" : 
                              "outline"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Previous</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {activeTab === "database" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>Full control over your database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          Database Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Connection</span>
                            <Badge variant="default">Connected</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Tables</span>
                            <span>12</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Records</span>
                            <span>45,287</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Size</span>
                            <span>2.4 GB</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5" />
                          Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Used</span>
                            <span>2.4 GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available</span>
                            <span>2.6 GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total</span>
                            <span>5 GB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col gap-2" onClick={handleDatabaseBackup}>
                      <Download className="w-6 h-6" />
                      <span>Backup Database</span>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <Upload className="w-6 h-6" />
                          <span>Restore Backup</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restore Database</DialogTitle>
                          <DialogDescription>
                            This will replace your current database with the selected backup. This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="mt-2">Drag and drop your backup file here</p>
                            <p className="text-sm text-gray-500">or</p>
                            <Button variant="outline" className="mt-2">Browse Files</Button>
                          </div>
                          <Button className="w-full">Restore Database</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="h-20 flex flex-col gap-2">
                          <AlertTriangle className="w-6 h-6" />
                          <span>Clear Data</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clear Database</DialogTitle>
                          <DialogDescription>
                            This will permanently delete selected data from your database. This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select data to delete:</label>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <input type="checkbox" id="old-orders" className="mr-2" />
                                <label htmlFor="old-orders">Orders older than 6 months</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="old-users" className="mr-2" />
                                <label htmlFor="old-users">Inactive users (no activity for 1 year)</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="old-logs" className="mr-2" />
                                <label htmlFor="old-logs">System logs older than 30 days</label>
                              </div>
                              <div className="flex items-center">
                                <input type="checkbox" id="all-data" className="mr-2" />
                                <label htmlFor="all-data">All data (complete reset)</label>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="confirm-delete" />
                            <label htmlFor="confirm-delete" className="text-sm font-medium">
                              I understand this action cannot be undone
                            </label>
                          </div>
                          <Button variant="destructive" className="w-full">Delete Selected Data</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Data Export</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-16 flex flex-col gap-1" onClick={() => exportData('books')}>
                        <Book className="w-5 h-5" />
                        <span>Export Books</span>
                      </Button>
                      <Button variant="outline" className="h-16 flex flex-col gap-1" onClick={() => exportData('users')}>
                        <User className="w-5 h-5" />
                        <span>Export Users</span>
                      </Button>
                      <Button variant="outline" className="h-16 flex flex-col gap-1" onClick={() => exportData('orders')}>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Export Orders</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button className="w-full justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      Rebuild Indexes
                    </Button>
                    <Button className="w-full justify-start">
                      <Key className="w-4 h-4 mr-2" />
                      Check Integrity
                    </Button>
                    <Button className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Purge Logs
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Backup History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Today, 09:30 AM</span>
                        <Badge variant="default">Auto</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Yesterday, 09:30 AM</span>
                        <Badge variant="default">Auto</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Oct 20, 2025</span>
                        <Badge variant="secondary">Manual</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Oct 15, 2025</span>
                        <Badge variant="secondary">Manual</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>System Management</CardTitle>
                  <CardDescription>Control and monitor your entire system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5" />
                          Server Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Uptime</span>
                            <Badge variant="default">99.9%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Load Average</span>
                            <span>0.42</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory Usage</span>
                            <span>1.8 GB / 4 GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>CPU Usage</span>
                            <span>24%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5" />
                          Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Root Filesystem</span>
                            <span>45%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Database</span>
                            <span>2.4 GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Logs</span>
                            <span>128 MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Backups</span>
                            <span>856 MB</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col gap-2" onClick={handleSystemRestart}>
                      <RefreshCw className="w-6 h-6" />
                      <span>Restart System</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Server className="w-6 h-6" />
                      <span>View Logs</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Settings className="w-6 h-6" />
                      <span>Configuration</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart Services
                    </Button>
                    <Button className="w-full justify-start">
                      <Server className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Temp Files
                    </Button>
                    <Button className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Update System
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>OS</span>
                        <span>Ubuntu 22.04 LTS</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kernel</span>
                        <span>5.15.0-76-generic</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Web Server</span>
                        <span>nginx 1.22.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database</span>
                        <span>PostgreSQL 14.5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Security Management</CardTitle>
                  <CardDescription>Protect and secure your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Security Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Firewall</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>SSL Certificate</span>
                            <Badge variant="default">Valid</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Scan</span>
                            <span>2 hours ago</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Threats Detected</span>
                            <span>0</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          Authentication
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>2FA Enabled</span>
                            <Badge variant="default">Yes</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Sessions</span>
                            <span>12</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed Logins</span>
                            <span>3 (24h)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Password Policy</span>
                            <Badge variant="default">Strong</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col gap-2" onClick={handleSecurityScan}>
                      <Shield className="w-6 h-6" />
                      <span>Security Scan</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Key className="w-6 h-6" />
                      <span>Manage Keys</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <User className="w-6 h-6" />
                      <span>User Sessions</span>
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Admin Profile Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        className="h-16 flex flex-col gap-1"
                        onClick={() => setShowProfileModal(true)}
                      >
                        <User className="w-5 h-5" />
                        <span>Update Profile</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col gap-1"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        <Key className="w-5 h-5" />
                        <span>Change Password</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Run Full Scan
                    </Button>
                    <Button className="w-full justify-start">
                      <Key className="w-4 h-4 mr-2" />
                      Rotate Keys
                    </Button>
                    <Button className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Force Logout All
                    </Button>
                    <Button className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Block IP Addresses
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Security Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Login attempt blocked</span>
                        <span>2 min ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Failed login</span>
                        <span>15 min ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Security scan completed</span>
                        <span>2 hours ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>New admin session</span>
                        <span>3 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Manage platform configuration and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Platform Name</label>
                        <Input defaultValue="Deoghar Kitab" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Email</label>
                        <Input type="email" defaultValue="admin@deoghar-kitab.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Currency</label>
                        <Select defaultValue="inr">
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inr">INR (₹)</SelectItem>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Timezone</label>
                        <Select defaultValue="ist">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                            <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Commission Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Seller Commission (%)</label>
                        <Input type="number" defaultValue="10" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Price (₹)</label>
                        <Input type="number" defaultValue="50" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                        </div>
                        <Button variant="outline">Enabled</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Send SMS notifications for order updates</p>
                        </div>
                        <Button variant="outline">Disabled</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>v2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Update</span>
                      <span>2023-05-15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span>99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage</span>
                      <span>2.4 GB / 5 GB</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Backup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full" onClick={handleDatabaseBackup}>
                        <Download className="w-4 h-4 mr-2" />
                        Backup Database
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Restore Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Profile Update Modal */}
      <>
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Admin Profile</DialogTitle>
              <DialogDescription>
                Update your admin profile information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                />
              </div>
              <Button onClick={() => updateAdminProfile(profileData)}>Update Profile</Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Password Change Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Admin Password</DialogTitle>
              <DialogDescription>
                Update your admin account password
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input 
                  type="password" 
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input 
                  type="password" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input 
                  type="password" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                />
              </div>
              <Button onClick={() => changeAdminPassword(passwordData.newPassword)}>Change Password</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
};

export default AdminDashboard;