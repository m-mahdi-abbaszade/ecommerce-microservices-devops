import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { productApi } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getAll({ limit: 8 }),
      productApi.getCategories()
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Microservices E-Commerce</h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            A production-grade distributed system with 7 independent services, Docker orchestration, and clean architecture.
          </p>
          <Link to="/products" className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
            <span>Browse Products</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: '7 Microservices', desc: 'Independent services communicating via REST over Docker network' },
              { icon: Shield, title: 'Isolated Databases', desc: 'Each service owns its PostgreSQL database with dedicated schema' },
              { icon: Truck, title: 'API Gateway', desc: 'Nginx reverse proxy routing traffic to all backend services' }
            ].map((f, i) => (
              <div key={i} className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50">
                <f.icon className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link key={cat.id} to={`/products?category=${cat.name}`}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition group">
                <div className="text-4xl mb-2">
                  {cat.name === 'Electronics' ? '📱' : cat.name === 'Clothing' ? '👕' : cat.name === 'Books' ? '📚' : '🏠'}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.productCount} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading products from microservice...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
