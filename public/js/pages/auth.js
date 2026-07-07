import { AbstractView } from '../router.js';
import { api } from '../api.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.isLogin = window.location.pathname === '/login';
    this.setTitle(this.isLogin ? 'Login' : 'Register');
  }

  async getHtml() {
    return `
      <div class="auth-container">
        <h1 style="text-align: center; margin-bottom: 2rem;">
          ${this.isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        
        <form id="authForm">
          ${!this.isLogin ? `
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="name" class="form-control" required />
            </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="email" class="form-control" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="password" class="form-control" required minlength="6" />
          </div>
          
          <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%; padding: 0.8rem; margin-top: 1rem;">
            ${this.isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div style="text-align: center; margin-top: 1.5rem; color: var(--text-secondary);">
          ${this.isLogin ? `
            Don't have an account? <a href="/register" data-link style="color: var(--accent-primary)">Sign up</a>
          ` : `
            Already have an account? <a href="/login" data-link style="color: var(--accent-primary)">Login</a>
          `}
        </div>
      </div>
    `;
  }

  async afterRender() {
    document.getElementById('authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = document.getElementById('submitBtn');
      
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      btn.disabled = true;

      try {
        if (this.isLogin) {
          await api.login(email, password);
          window.showToast('Logged in successfully');
        } else {
          const name = document.getElementById('name').value;
          await api.register(name, email, password);
          window.showToast('Account created successfully');
        }
        
        // Load cart
        await api.getCart();
        window.router.navigateTo('/');
        
      } catch (err) {
        window.showToast(err.message, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }
}
