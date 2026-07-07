import { AbstractView } from '../router.js';
import { api } from '../api.js';
import { store } from '../store.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.product = null;
  }

  async getHtml() {
    return `
      <div id="productDetailContainer">
        <div style="text-align: center; padding: 3rem;">
          <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--accent-primary)"></i>
        </div>
      </div>
    `;
  }

  async afterRender() {
    try {
      const res = await api.getProduct(this.params.id);
      this.product = res.data;
      this.setTitle(this.product.name);
      
      const container = document.getElementById('productDetailContainer');
      const inStock = this.product.stock > 0;

      container.innerHTML = `
        <div class="product-detail">
          <div>
            <img src="${this.product.image || 'https://via.placeholder.com/600x500?text=No+Image'}" alt="${this.product.name}" class="detail-image" />
          </div>
          <div class="detail-info">
            <span class="product-category">${this.product.category}</span>
            <h1>${this.product.name}</h1>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <span class="rating"><i class="fa-solid fa-star"></i> ${this.product.rating}</span>
              <span style="color: var(--text-secondary)">(${this.product.numReviews} reviews)</span>
            </div>
            
            <div class="detail-price">$${this.product.price.toFixed(2)}</div>
            
            <span class="stock-status ${inStock ? 'in-stock' : 'out-of-stock'}">
              ${inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            
            <p>${this.product.description}</p>
            
            <div style="margin-top: 2rem; display: flex; gap: 1rem; align-items: center;">
              ${inStock ? `
                <div class="quantity-control" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                  <button class="qty-btn" id="decQty">-</button>
                  <input type="number" id="buyQty" class="qty-input" value="1" min="1" max="${this.product.stock}" />
                  <button class="qty-btn" id="incQty">+</button>
                </div>
                <button id="addToCartBtn" class="btn btn-primary" style="flex: 1; padding: 0.8rem;">
                  <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
              ` : `
                <button class="btn btn-outline" disabled style="flex: 1; padding: 0.8rem; opacity: 0.5; cursor: not-allowed;">
                  Out of Stock
                </button>
              `}
            </div>
          </div>
        </div>
      `;

      if (inStock) {
        const qtyInput = document.getElementById('buyQty');
        document.getElementById('decQty').addEventListener('click', () => {
          if (qtyInput.value > 1) qtyInput.value--;
        });
        document.getElementById('incQty').addEventListener('click', () => {
          if (qtyInput.value < this.product.stock) qtyInput.value++;
        });

        document.getElementById('addToCartBtn').addEventListener('click', async () => {
          if (!store.state.token) {
            window.showToast('Please login to add items to cart', 'error');
            window.router.navigateTo('/login');
            return;
          }

          try {
            const btn = document.getElementById('addToCartBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
            btn.disabled = true;

            await api.addToCart(this.product.id, parseInt(qtyInput.value));
            
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            window.showToast('Item added to cart');
            
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }, 2000);
          } catch (err) {
            window.showToast(err.message, 'error');
            document.getElementById('addToCartBtn').disabled = false;
            document.getElementById('addToCartBtn').innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
          }
        });
      }

    } catch (err) {
      document.getElementById('productDetailContainer').innerHTML = `<p style="color: var(--danger)">Error: ${err.message}</p>`;
    }
  }
}
