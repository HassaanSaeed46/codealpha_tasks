import { AbstractView } from '../router.js';
import { api } from '../api.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle('Home');
    this.products = [];
    this.categories = [];
  }

  async getHtml() {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Explore Collection</h1>
        <div style="display: flex; gap: 1rem;">
          <select id="categoryFilter" class="form-control" style="width: auto;">
            <option value="">All Categories</option>
          </select>
          <select id="sortSelect" class="form-control" style="width: auto;">
            <option value="createdAt_desc">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      <div id="productsGrid" class="grid grid-cols-4">
        <!-- Products will be injected here -->
      </div>
      <div id="pagination" style="display: flex; justify-content: center; gap: 1rem; margin-top: 3rem;"></div>
    `;
  }

  async afterRender() {
    try {
      const catRes = await api.getProducts('/categories');
      this.categories = catRes.data;
      
      const catSelect = document.getElementById('categoryFilter');
      this.categories.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
      });

      // Handle query params manually
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('category')) {
        catSelect.value = urlParams.get('category');
      }

      const fetchAndRender = async () => {
        const query = new URLSearchParams(window.location.search);
        query.set('category', catSelect.value);
        query.set('sort', document.getElementById('sortSelect').value);
        
        // Remove empty params
        if (!query.get('category')) query.delete('category');
        if (query.get('sort') === 'createdAt_desc') query.delete('sort');

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const res = await api.getProducts(queryString);
        this.products = res.data.products;
        this.renderProducts();
      };

      catSelect.addEventListener('change', fetchAndRender);
      document.getElementById('sortSelect').addEventListener('change', fetchAndRender);

      // Initial load
      const initialQuery = window.location.search;
      const res = await api.getProducts(initialQuery);
      this.products = res.data.products;
      this.renderProducts();

    } catch (err) {
      document.getElementById('productsGrid').innerHTML = `<p style="color: var(--danger)">Error loading products: ${err.message}</p>`;
    }
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (this.products.length === 0) {
      grid.innerHTML = '<p>No products found.</p>';
      return;
    }

    grid.innerHTML = this.products.map(p => `
      <a href="/product/${p.id}" class="card" data-link>
        <div class="product-image-container">
          <img src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${p.name}" class="product-image" />
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-title">${p.name}</h3>
          <div class="product-footer">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <span class="rating"><i class="fa-solid fa-star"></i> ${p.rating}</span>
          </div>
        </div>
      </a>
    `).join('');
  }
}
