import { AbstractView } from '../router.js';
import { api } from '../api.js';
import { store } from '../store.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle('Checkout');
  }

  async getHtml() {
    return `
      <div class="cart-layout">
        <div>
          <h1 style="margin-bottom: 2rem;">Checkout</h1>
          <form id="checkoutForm" class="card" style="padding: 2rem;">
            <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Shipping Address</h2>
            
            <div class="form-group">
              <label class="form-label">Street Address</label>
              <input type="text" id="street" class="form-control" required />
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" id="city" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" id="state" class="form-control" required />
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Zip Code</label>
                <input type="text" id="zip" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">Country</label>
                <input type="text" id="country" class="form-control" value="US" required />
              </div>
            </div>

            <button type="submit" id="placeOrderBtn" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem; font-size: 1.1rem;">
              Place Order
            </button>
          </form>
        </div>
        
        <div class="order-summary">
          <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Order Summary</h2>
          <div id="checkoutSummary"></div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (!store.state.token || store.state.cart.items.length === 0) {
      window.router.navigateTo('/cart');
      return;
    }

    const { cart } = store.state;
    const summary = document.getElementById('checkoutSummary');
    
    let itemsHtml = cart.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
        <span style="color: var(--text-secondary)">${item.quantity}x ${item.product.name}</span>
        <span>$${(item.quantity * item.product.price).toFixed(2)}</span>
      </div>
    `).join('');

    summary.innerHTML = `
      <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);">
        ${itemsHtml}
      </div>
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${cart.total.toFixed(2)}</span>
      </div>
      <div class="summary-total">
        <span>Total</span>
        <span>$${cart.total.toFixed(2)}</span>
      </div>
    `;

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const shippingAddress = {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        country: document.getElementById('country').value,
      };

      const btn = document.getElementById('placeOrderBtn');
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      btn.disabled = true;

      try {
        await api.placeOrder(shippingAddress);
        window.showToast('Order placed successfully!');
        window.router.navigateTo('/orders');
      } catch (err) {
        window.showToast(err.message, 'error');
        btn.innerHTML = 'Place Order';
        btn.disabled = false;
      }
    });
  }
}
