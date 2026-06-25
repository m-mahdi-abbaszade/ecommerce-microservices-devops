import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/client';
import { Package, XCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    orderApi.getAll({ user_id: user.id })
      .then(res => setOrders(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const cancelOrder = async (id: number) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await orderApi.cancel(id);
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const statusColor: any = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading from Order Management service...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No orders yet. Start shopping!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{order.order_number}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                  {!['cancelled', 'delivered'].includes(order.status) && (
                    <button onClick={() => cancelOrder(order.id)} className="text-red-500 hover:text-red-700 p-1">
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                {(order.items || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product_name} x{item.quantity}</span>
                    <span className="text-gray-900 font-medium">${parseFloat(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
