import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChatCreate = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [participantIds, setParticipantIds] = useState('');
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = participantIds.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length < 2) return alert('Provide at least two user IDs separated by commas');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3003/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ participantIds: ids, bookId: bookId || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/chat/${data._id}`);
      } else {
        alert(data.message || 'Failed to create chat');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Start Chat</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="text-sm">Participant IDs (comma separated)</label>
          <Input value={participantIds} onChange={(e) => setParticipantIds(e.target.value)} placeholder="userId1,userId2" />
        </div>
        <div>
          <label className="text-sm">Optional Book ID</label>
          <Input value={bookId} onChange={(e) => setBookId(e.target.value)} placeholder="bookId" />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Starting...' : 'Start Chat'}</Button>
      </form>
    </div>
  );
};

export default ChatCreate;
