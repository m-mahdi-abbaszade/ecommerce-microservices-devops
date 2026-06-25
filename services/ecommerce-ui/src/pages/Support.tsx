import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supportApi } from '../api/client';
import { MessageCircle, Send } from 'lucide-react';

export default function Support() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'general', priority: 'medium', message: '' });
  const { user } = useAuth();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    supportApi.getTickets()
      .then(res => setTickets(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supportApi.createTicket({ ...form, user_id: user?.id });
      setForm({ subject: '', category: 'general', priority: 'medium', message: '' });
      setShowForm(false);
      loadTickets();
    } catch (err) {
      alert('Failed to create ticket');
    }
  };

  const statusColor: any = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm">
          + New Ticket
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTicket} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
          <input type="text" placeholder="Subject" required value={form.subject}
            onChange={e => setForm({...form, subject: e.target.value})}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white outline-none">
              <option value="general">General</option>
              <option value="order">Order</option>
              <option value="product">Product</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
            </select>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <textarea placeholder="Describe your issue..." required rows={4} value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition">Submit Ticket</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading from Contact Support service...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No support tickets. Create one if you need help!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500">{ticket.category} - {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[ticket.status] || 'bg-gray-100'}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{ticket.messages?.length || 0} messages</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
