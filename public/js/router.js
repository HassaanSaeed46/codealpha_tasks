export class Router {
  constructor(routes, rootElement) {
    this.routes = routes;
    this.rootElement = rootElement;
    
    // Handle link clicks to use History API
    document.addEventListener('click', e => {
      const target = e.target.closest('[data-link]');
      if (target) {
        e.preventDefault();
        this.navigateTo(target.href);
      }
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', () => this.router());
  }

  navigateTo(url) {
    history.pushState(null, null, url);
    this.router();
  }

  async router() {
    // Array of potential matches
    const potentialMatches = this.routes.map(route => {
      return {
        route: route,
        result: location.pathname.match(this.pathToRegex(route.path))
      };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
      match = {
        route: this.routes.find(route => route.path === '/404') || this.routes[0],
        result: [location.pathname]
      };
    }

    const viewArgs = this.getParams(match);
    const view = new match.route.view(viewArgs);

    this.rootElement.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--accent-primary)"></i></div>';
    
    try {
      this.rootElement.innerHTML = await view.getHtml();
      if (view.afterRender) {
        await view.afterRender();
      }
    } catch (err) {
      console.error(err);
      this.rootElement.innerHTML = `<div style="text-align: center; padding: 3rem; color: var(--danger)">Error loading page: ${err.message}</div>`;
    }
  }

  pathToRegex(path) {
    return new RegExp('^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$');
  }

  getParams(match) {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
      return [key, values[i]];
    }));
  }
}

export class AbstractView {
  constructor(params) {
    this.params = params;
  }

  setTitle(title) {
    document.title = title + " | Lumina Store";
  }

  async getHtml() {
    return "";
  }
}
