import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Send, 
  Check, 
  CheckCheck, 
  BookOpen, 
  User, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import \{ API_BASE_URL \} from "@/lib/api";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  const fetchChat = async (silent = false) => {
    try {
      const res = await fetch(${API_BASE_URL}/api/chats/${id}, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setChat(data);
        
        // Mark as read automatically when reading messages
        markAsRead();

        if (!silent) {
          setTimeout(() => {
            scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
          }, 100);
        }
      } else {
        console.error('Failed to load chat');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(${API_BASE_URL}/api/chats/${id}/read, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error('Failed to mark chat as read:', err);
    }
  };

  useEffect(() => {
    fetchChat(false);
    
    // Poll for messages every 2.5s
    const t = setInterval(() => {
      fetchChat(true);
    }, 2500);

    return () => clearInterval(t);
  }, [id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    
    const textToSend = message.trim();
    setMessage('');
    setSending(true);

    try {
      const res = await fetch(${API_BASE_URL}/api/chats/${id}/messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ text: textToSend })
      });
      if (res.ok) {
        fetchChat(false);
      } else {
        toast.error('Failed to send message');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error. Failed to send.');
    } finally {
      setSending(false);
    }
  };

  // Find other participant name
  const otherParticipant = chat?.participants?.find((p: any) => String(p._id) !== String(user?.id || user?._id));
  const otherName = otherParticipant?.name || 'Deoghar Kitab Member';
  const otherInitials = otherName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 flex justify-center items-center">
        <div className="container mx-auto px-4 max-w-3xl w-full">
          {/* Header Action Row */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/chat')}
              className="h-10 w-10 rounded-xl border-border/40 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Private Conversation
              </h2>
              <p className="text-xs text-muted-foreground">Secure connection</p>
            </div>
          </div>

          {!chat ? (
            <div className="border border-border/40 rounded-3xl p-12 bg-card text-center flex flex-col items-center justify-center shadow-card min-h-[400px]">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
              <p className="text-sm font-semibold text-muted-foreground">Retrieving chat room history...</p>
            </div>
          ) : (
            <div className="bg-card border border-border/40 rounded-3xl shadow-card overflow-hidden flex flex-col h-[650px] relative">
              {/* Dynamic Header: Other Participant Details */}
              <div className="bg-muted/30 border-b border-border/30 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-sm shadow-sm">
                    {otherInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground leading-snug">{otherName}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Active Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Details Context Card */}
              {chat.book && (
                <div 
                  onClick={() => navigate(`/book/${chat.book._id || chat.book.id}`)}
                  className="bg-amber-500/5 hover:bg-amber-500/10 border-b border-border/20 px-6 py-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-10 h-13 rounded-lg overflow-hidden border border-border/30 bg-card flex-shrink-0 shadow-sm">
                      <img 
                        src={chat.book.images?.[0] || chat.book.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"} 
                        alt={chat.book.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 mb-0.5">Inquiring About</p>
                      <h4 className="font-bold text-xs text-foreground truncate max-w-[280px] sm:max-w-[400px] leading-tight">
                        {chat.book.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">by {chat.book.author}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <div>
                      <p className="font-extrabold text-sm text-primary">₹{chat.book.price}</p>
                      <span className="text-[10px] text-muted-foreground">View Details</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                </div>
              )}

              {/* Message Scroller Container */}
              <div 
                ref={scroller} 
                className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-transparent to-muted/10 space-y-4"
              >
                {(!chat.messages || chat.messages.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 animate-pulse-scale" />
                    </div>
                    <h4 className="font-extrabold text-base mb-1">Start the Conversation!</h4>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Send a message below to securely discuss pick-up times, price adjustments, or book condition.
                    </p>
                  </div>
                ) : (
                  chat.messages.map((m: any, idx: number) => {
                    const isSelf = String(m.sender) === String(user?.id || user?._id);
                    const msgTime = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative group transition-all ${
                            isSelf 
                              ? 'bg-amber-500 text-white rounded-tr-none' 
                              : 'bg-card border border-border/30 text-foreground rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap pr-8">{m.text}</p>
                          
                          {/* Metadata Alignment (Timestamp + Read Tick) */}
                          <div className="absolute bottom-1 right-2 flex items-center gap-1">
                            <span className={`text-[9px] ${isSelf ? 'text-white/70' : 'text-muted-foreground/60'}`}>
                              {msgTime}
                            </span>
                            
                            {isSelf && (
                              m.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-white/50" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Footer Form */}
              <form 
                onSubmit={handleSendMessage} 
                className="bg-card border-t border-border/40 p-4 flex gap-3 items-center"
              >
                <Input 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Type your secure message..." 
                  className="flex-grow h-12 bg-muted/30 border border-border/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all rounded-xl text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={sending || !message.trim()}
                  className="h-12 w-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold transition-all shadow-md flex items-center justify-center p-0 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatRoom;
