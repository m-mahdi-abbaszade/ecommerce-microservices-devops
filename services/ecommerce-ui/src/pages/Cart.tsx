import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/client';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = React.useState(false);

  const placeOrder = async () => {
    if (!isAuthenticated) return navigate('/login');
    setPlacing(true);
    try {
      await orderApi.create({
        user_id: user!.id,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity }))
      });
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link to="/products" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🛒</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-primary-600 font-medium">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-lg hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-lg hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-5 w-5" /></button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between text-xl font-bold text-gray-900 mb-4">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <button onClick={placeOrder} disabled={placing}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
          {placing ? 'Placing Order...' : isAuthenticated ? 'Place Order' : 'Login to Checkout'}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This triggers: Order Service → Inventory Service (reserve) → Profile Service (address) → Shipping Service (shipment)
        </p>
      </div>
    </div>
  );
}
