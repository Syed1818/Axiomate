class AxiomateNavbar extends HTMLElement {
  connectedCallback() {
    // Inject the navigation HTML
    this.innerHTML = `
      <nav id="navbar" class="navbar">
        <div class="nav-container">
          <a href="/index.html" class="nav-logo">
            <img src="images/logo.png" alt="Axiomate" class="logo-img" />
            <span class="logo-text">Axiomate</span>
          </a>
          <div class="nav-links" id="nav-links">
            <a href="/index.html" class="nav-link">Home</a>
            <a href="/index.html#services" class="nav-link">Services</a>
            <a href="/about.html" class="nav-link">About</a>
            <a href="/process.html" class="nav-link">Process</a>
            <a href="/testimonials.html" class="nav-link">Clients</a>
            <a href="/contact.html" class="nav-link">Contact</a>
          </div>
          <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <a href="/contact.html" class="nav-cta magnetic-btn"><span>Get Started</span></a>
          <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    `;

    this.updateActiveLink();
    
    // If your custom SPA router (in main.js) swaps content instead of a full reload,
    // you can dispatch a 'route-changed' event to dynamically update the active link state.
    window.addEventListener('route-changed', () => this.updateActiveLink());
  }

  updateActiveLink() {
    const currentPath = window.location.pathname;
    this.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
        link.classList.add('active');
      }
    });
  }
}

customElements.define('axiomate-navbar', AxiomateNavbar);