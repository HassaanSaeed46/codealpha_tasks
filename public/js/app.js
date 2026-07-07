import { Router } from './router.js';
import { store } from './store.js';
import { api } from './api.js';

import Home from './pages/home.js';
import Product from './pages/product.js';
import Cart from './pages/cart.js';
import Checkout from './pages/checkout.js';
import Auth from './pages/auth.js';
import Orders from './pages/orders.js';

// Global toast utility
window.showToast = (message, type = 'success') => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Setup Router
  const routes = [
    { path: '/', view: Home },
    { path: '/product/:id', view: Product },
    { path: '/cart', view: Cart },
    { path: '/checkout', view: Checkout },
    { path: '/login', view: Auth },
    { path: '/register', view: Auth },
    { path: '/orders', view: Orders }
  ];
  
  const router = new Router(routes, document.getElementById('app'));
  window.router = router; // Make available globally for easy programmatic navigation

  // Update navbar based on store state
  const updateNavbar = () => {
    const { user, cart } = store.state;
    
    // Auth Links
    const authLinks = document.getElementById('authLinks');
    if (user) {
      authLinks.innerHTML = `
        <span style="color: var(--text-secondary); font-size: 0.9rem;">Hi, ${user.name}</span>
        <a href="/orders" data-link style="font-size: 0.9rem;">Orders</a>
        <button id="logoutBtn" class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.85rem;">Logout</button>
      `;
      
      document.getElementById('logoutBtn').addEventListener('click', () => {
        store.logout();
        window.showToast('Logged out successfully');
        router.navigateTo('/');
      });
    } else {
      authLinks.innerHTML = `
        <a href="/login" class="btn btn-outline" data-link style="padding: 0.3rem 0.8rem; font-size: 0.85rem;">Login</a>
        <a href="/register" class="btn btn-primary" data-link style="padding: 0.3rem 0.8rem; font-size: 0.85rem;">Sign Up</a>
      `;
    }
    
    // Cart Badge
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  };

  store.subscribe(updateNavbar);
  updateNavbar();

  // Handle Search
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  
  const handleSearch = () => {
    const val = searchInput.value.trim();
    if (val) {
      router.navigateTo(`/?search=${encodeURIComponent(val)}`);
    } else {
      router.navigateTo(`/`);
    }
  };
  
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Fetch initial cart if logged in
  if (store.state.user) {
    try {
      await api.getCart();
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  }

  // Initial route
  router.router();
});
