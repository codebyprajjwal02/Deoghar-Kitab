import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from "@/lib/api";

const NotificationsPage = () => {
  const { getAuthHeaders } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchNotifications();
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {loading && <p>Loading...</p>}
      {!loading && notifications.length === 0 && <p>No notifications.</p>}
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li key={n._id} className={`p-3 rounded-lg border ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-sm text-gray-700">{n.type}</p>
                <pre className="text-xs text-muted-foreground">{JSON.stringify(n.payload)}</pre>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                {!n.read && (
                  <Button size="sm" onClick={() => markRead(n._id)}>Mark read</Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
