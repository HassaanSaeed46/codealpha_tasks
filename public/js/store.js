// A simple store implementation using local storage
export const store = {
  state: {
    user: null,
    token: null,
    cart: {
      items: [],
      total: 0
    }
  },

  listeners: [],

  init() {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      this.state.user = JSON.parse(savedUser);
      this.state.token = savedToken;
    }
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  },

  setUser(user, token) {
    this.state.user = user;
    this.state.token = token;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.notify();
  },

  logout() {
    this.state.user = null;
    this.state.token = null;
    this.state.cart = { items: [], total: 0 };
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.notify();
  },

  setCart(cartData) {
    this.state.cart = cartData || { items: [], total: 0 };
    this.notify();
  }
};

store.init();
