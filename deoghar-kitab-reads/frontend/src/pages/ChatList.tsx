import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, BookOpen, Clock, ChevronRight, Inbox } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const ChatList = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3003/api/chats', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setChats(await res.json());
      }
    } catch (e) {
      console.error('Failed to load chats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    
    // Check if today
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Title Card */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-card mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground leading-tight tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Conversations
              </h1>
              <p className="text-xs text-muted-foreground">Secure student-to-student buyer & seller messaging</p>
            </div>
            <Button 
              onClick={() => navigate('/browse')} 
              className="bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl h-11 px-5 shadow-sm transition-all"
            >
              Browse Textbooks
            </Button>
          </div>

          {loading ? (
            <div className="border border-border/40 rounded-3xl p-12 bg-card text-center flex flex-col items-center justify-center shadow-card min-h-[300px]">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
              <p className="text-xs text-muted-foreground font-medium">Loading active conversations...</p>
            </div>
          ) : chats.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-dashed border-border/70 rounded-3xl p-12 bg-card/50 text-center flex flex-col items-center justify-center shadow-sm min-h-[350px]"
            >
              <div className="w-14 h-14 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-bold mb-1">No chats yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                You haven't initiated any inquiries or received any buyer requests. Check out books from your campus peers to start a conversation!
              </p>
              <Button 
                onClick={() => navigate('/browse')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-6"
              >
                Browse Books for Sale
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat, idx) => {
                const otherParticipants = chat.participants.filter((p: any) => String(p._id) !== String(user?.id || user?._id));
                const otherUser = otherParticipants[0] || { name: 'Deoghar Kitab Member', email: '' };
                const otherName = otherUser.name || otherUser.email || 'Deoghar Kitab Member';
                const otherInitials = otherName.substring(0, 2).toUpperCase();
                
                const lastMessage = chat.messages?.length 
                  ? chat.messages[chat.messages.length - 1].text 
                  : 'No messages yet';
                
                const lastMessageTime = chat.messages?.length
                  ? formatMessageTime(chat.messages[chat.messages.length - 1].createdAt)
                  : formatMessageTime(chat.lastUpdated);
                
                const linkedBook = chat.book;
                const unread = chat.unreadCount || 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={chat._id}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    className="block rounded-3xl border border-border/40 bg-card p-5 cursor-pointer hover:border-amber-500/50 hover:shadow-card transition-all relative group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
                        {otherInitials}
                      </div>

                      {/* Info & Last message */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-foreground truncate group-hover:text-amber-600 transition-colors">
                            {otherName}
                          </h3>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {lastMessageTime}
                          </span>
                        </div>

                        {linkedBook && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800 font-semibold mb-2 max-w-full">
                            <BookOpen className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-[400px]">{linkedBook.title}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground truncate leading-relaxed">
                          {lastMessage}
                        </p>
                      </div>

                      {/* Right Indicator (Unread Count or Arrow) */}
                      <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0 pl-2">
                        {unread > 0 ? (
                          <span className="bg-amber-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                            {unread}
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatList;
