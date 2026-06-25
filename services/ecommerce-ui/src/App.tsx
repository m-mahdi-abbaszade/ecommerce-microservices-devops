import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Support from './pages/Support';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-2">E-Commerce Microservices Architecture</p>
          <p>Product Catalog | Product Inventory | Order Management | Profile Management | Shipping & Handling | Contact Support | Ecommerce UI</p>
          <p className="mt-2">Docker + Nginx API Gateway + PostgreSQL + React + Express.js</p>
        </div>
      </footer>
    </div>
  );
}
