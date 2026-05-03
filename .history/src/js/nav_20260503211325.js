class AxiomateNavbar extends HTMLElement {
  connectedCallback() {
    // Inject the navigation HTML
    this.innerHTML = `
      <nav id="navbar" class="navbar fixed top-0 left-0 right-0 z-[1000] py-4 bg-transparent transition-all duration-300 border-b border-transparent">
        <div class="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <a href="/index.html" class="flex items-center gap-2.5 z-10 relative group">
            <img src="/images/logo.png" alt="Axiomate" class="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110" />
            <span class="text-[1.3rem] font-bold text-white tracking-tight">Axiomate</span>
          </a>
          <div class="nav-links hidden md:flex gap-8 items-center" id="nav-links">
            <a href="/index.html" class="nav-link text-[0.9rem] font-medium text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#00d2ff] hover:after:w-full after:transition-all after:duration-300">Home</a>
            <a href="/services.html" class="nav-link text-[0.9rem] font-medium text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#00d2ff] hover:after:w-full after:transition-all after:duration-300">Services</a>
            <a href="/about.html" class="nav-link text-[0.9rem] font-medium text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#00d2ff] hover:after:w-full after:transition-all after:duration-300">About</a>
            <a href="/process.html" class="nav-link text-[0.9rem] font-medium text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#00d2ff] hover:after:w-full after:transition-all after:duration-300">Process</a>
            <a href="/testimonials.html" class="nav-link text-[0.9rem] font-medium text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#00d2ff] hover:after:w-full after:transition-all after:duration-300">Clients</a>
            <a href="/contact.html" class="nav-link text-[0.9rem] font-medium text-gray-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#00d2ff] hover:after:w-full after:transition-all after:duration-300">Contact</a>
          </div>
          <div class="flex items-center gap-4 z-10 relative">
            <button class="theme-toggle w-[38px] h-[38px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#00d2ff] transition-all duration-300 hover:border-[#00d2ff] hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] backdrop-blur-md" id="theme-toggle" aria-label="Toggle theme">
              <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <a href="/contact.html" class="nav-cta magnetic-btn hidden md:inline-flex text-[0.85rem] font-semibold px-6 py-2.5 bg-gradient-to-r from-[#00d2ff] to-[#3b82f6] text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,210,255,0.4)]"><span>Get Started</span></a>
            <button class="nav-toggle flex md:hidden flex-col gap-[5px]" id="nav-toggle" aria-label="Toggle menu">
              <span class="w-6 h-[2px] bg-white rounded-full transition-all duration-300"></span>
              <span class="w-6 h-[2px] bg-white rounded-full transition-all duration-300"></span>
              <span class="w-6 h-[2px] bg-white rounded-full transition-all duration-300"></span>
            </button>
          </div>
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