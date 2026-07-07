import { store } from './store.js';

const API_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (store.state.token) {
    headers['Authorization'] = `Bearer ${store.state.token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    store.setUser(res.data.user, res.data.token);
    return res;
  },
  
  async register(name, email, password) {
    const res = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    store.setUser(res.data.user, res.data.token);
    return res;
  },

  // Products
  async getProducts(queryParams = '') {
    return await fetchAPI(`/products${queryParams}`);
  },

  async getProduct(id) {
    return await fetchAPI(`/products/${id}`);
  },

  // Cart
  async getCart() {
    if (!store.state.token) return { data: { items: [], total: 0 }};
    const res = await fetchAPI('/cart');
    store.setCart(res.data);
    return res;
  },

  async addToCart(productId, quantity = 1) {
    const res = await fetchAPI('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    store.setCart(res.data);
    return res;
  },

  async updateCartItem(productId, quantity) {
    const res = await fetchAPI(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    store.setCart(res.data);
    return res;
  },

  async removeFromCart(productId) {
    const res = await fetchAPI(`/cart/${productId}`, {
      method: 'DELETE'
    });
    store.setCart(res.data);
    return res;
  },

  // Orders
  async placeOrder(shippingAddress) {
    return await fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress })
    });
  },

  async getOrders() {
    return await fetchAPI('/orders');
  }
};
