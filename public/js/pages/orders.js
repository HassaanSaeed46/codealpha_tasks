import { AbstractView } from '../router.js';
import { api } from '../api.js';
import { store } from '../store.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle('Order History');
  }

  async getHtml() {
    return `
      <div style="max-width: 800px; margin: 0 auto;">
        <h1 style="margin-bottom: 2rem;">Order History</h1>
        <div id="ordersContainer">
          <div style="text-align: center; padding: 3rem;">
            <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--accent-primary)"></i>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (!store.state.token) {
      window.router.navigateTo('/login');
      return;
    }

    try {
      const res = await api.getOrders();
      const orders = res.data;
      const container = document.getElementById('ordersContainer');

      if (orders.length === 0) {
        container.innerHTML = `
          <div class="card" style="padding: 3rem; text-align: center;">
            <div style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <h3>No orders found</h3>
            <p style="margin-bottom: 1.5rem;">You haven't placed any orders yet.</p>
            <a href="/" class="btn btn-primary" data-link>Start Shopping</a>
          </div>
        `;
        return;
      }

      container.innerHTML = orders.map(order => `
        <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
            <div>
              <div style="color: var(--text-secondary); font-size: 0.9rem;">Order ID</div>
              <div style="font-family: monospace;">${order._id}</div>
            </div>
            <div style="text-align: right;">
              <div style="color: var(--text-secondary); font-size: 0.9rem;">Date Placed</div>
              <div>${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div style="display: grid; gap: 1rem;">
            ${order.items.map(item => `
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.image || 'https://via.placeholder.com/60'}" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;" />
                <div style="flex: 1;">
                  <div style="font-weight: 500;">${item.name}</div>
                  <div style="color: var(--text-secondary); font-size: 0.9rem;">Qty: ${item.quantity}</div>
                </div>
                <div style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
              <i class="fa-solid fa-truck"></i> Shipping to: ${order.shippingAddress.city}, ${order.shippingAddress.state}
            </div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-primary);">
              Total: $${order.totalPrice.toFixed(2)}
            </div>
          </div>
        </div>
      `).join('');

    } catch (err) {
      document.getElementById('ordersContainer').innerHTML = `<p style="color: var(--danger)">Error: ${err.message}</p>`;
    }
  }
}
