import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <Link to={`/products/${product.id}`}>
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-300">
            {product.category?.name === 'Electronics' ? '📱' :
             product.category?.name === 'Clothing' ? '👕' :
             product.category?.name === 'Books' ? '📚' : '🏠'}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
          {product.category?.name || 'Uncategorized'}
        </span>
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-2 font-semibold text-gray-900 hover:text-primary-600 transition line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center mt-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-gray-600 ml-1">{product.rating} ({product.review_count})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
