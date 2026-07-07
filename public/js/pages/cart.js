import { AbstractView } from '../router.js';
import { api } from '../api.js';
import { store } from '../store.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle('Shopping Cart');
  }

  async getHtml() {
    return `
      <div class="cart-layout">
        <div>
          <h1 style="margin-bottom: 2rem;">Shopping Cart</h1>
          <div id="cartItemsContainer" class="cart-items">
            <!-- Items injected here -->
          </div>
        </div>
        
        <div class="order-summary">
          <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Order Summary</h2>
          <div id="summaryContent">
            <!-- Summary injected here -->
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (!store.state.token) {
      document.getElementById('cartItemsContainer').innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p>Please login to view your cart.</p>
          <a href="/login" class="btn btn-primary" data-link style="margin-top: 1rem;">Login</a>
        </div>
      `;
      document.querySelector('.order-summary').style.display = 'none';
      return;
    }

    this.renderCart();
    
    // Subscribe to cart updates
    this.unsubscribe = store.subscribe(() => {
      // Only re-render if we're still on the cart page
      if (window.location.pathname === '/cart') {
        this.renderCart();
      }
    });
  }

  renderCart() {
    const { cart } = store.state;
    const container = document.getElementById('cartItemsContainer');
    const summary = document.getElementById('summaryContent');

    if (!cart.items || cart.items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <p>Your cart is empty.</p>
          <a href="/" class="btn btn-primary" data-link style="margin-top: 1rem;">Continue Shopping</a>
        </div>
      `;
      document.querySelector('.order-summary').style.display = 'none';
      return;
    }

    document.querySelector('.order-summary').style.display = 'block';

    container.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <img src="${item.product.image || 'https://via.placeholder.com/80'}" class="cart-item-img" alt="${item.product.name}" />
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.product.name}</h3>
          <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
        </div>
        <div class="quantity-control">
          <button class="qty-btn dec-btn" data-id="${item.product.id}">-</button>
          <input type="number" class="qty-input" value="${item.quantity}" readonly />
          <button class="qty-btn inc-btn" data-id="${item.product.id}">+</button>
        </div>
        <button class="btn btn-danger remove-btn" data-id="${item.product.id}" style="padding: 0.5rem;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');

    summary.innerHTML = `
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${cart.total.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>Free</span>
      </div>
      <div class="summary-total">
        <span>Total</span>
        <span>$${cart.total.toFixed(2)}</span>
      </div>
      <a href="/checkout" class="btn btn-primary" data-link style="width: 100%; margin-top: 1.5rem; font-size: 1.1rem; padding: 1rem;">
        Proceed to Checkout
      </a>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    document.querySelectorAll('.dec-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const item = store.state.cart.items.find(i => i.product.id === id);
        if (item && item.quantity > 1) {
          try {
            await api.updateCartItem(id, item.quantity - 1);
          } catch (err) {
            window.showToast(err.message, 'error');
          }
        }
      });
    });

    document.querySelectorAll('.inc-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const item = store.state.cart.items.find(i => i.product.id === id);
        if (item && item.quantity < item.product.stock) {
          try {
            await api.updateCartItem(id, item.quantity + 1);
          } catch (err) {
            window.showToast(err.message, 'error');
          }
        } else {
          window.showToast('Cannot add more than available stock', 'error');
        }
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        try {
          await api.removeFromCart(id);
          window.showToast('Item removed from cart');
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      });
    });
  }
}
