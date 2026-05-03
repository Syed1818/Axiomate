class AxiomateFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer id="footer" class="relative z-10 bg-[#121523]/45 border border-white/10 rounded-[20px] p-10 md:p-16 backdrop-blur-[20px] mx-auto mb-6 max-w-[1152px] w-[calc(100%-48px)] transition-all duration-300 hover:border-white/20">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-12">
            <div class="flex flex-col gap-2">
              <img src="/images/logo.png" alt="Axiomate" class="w-9 h-9 mb-2 transition-transform duration-300 hover:scale-110" />
              <span class="text-[1.3rem] font-bold text-white tracking-tight">Axiomate</span>
              <p class="text-[0.85rem] text-gray-400">Engineering Tomorrow's Technology</p>
            </div>
            <div class="flex flex-col gap-3">
              <h4 class="text-[0.85rem] font-semibold text-white uppercase tracking-wider mb-1">Services</h4>
              <a href="/web-development.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Web Development</a>
              <a href="/ai-ml.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">AI & ML</a>
              <a href="/mobile-apps.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Mobile Apps</a>
              <a href="/cloud-devops.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Cloud & DevOps</a>
            </div>
            <div class="flex flex-col gap-3">
              <h4 class="text-[0.85rem] font-semibold text-white uppercase tracking-wider mb-1">Company</h4>
              <a href="/about.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">About Us</a>
              <a href="/process.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Our Process</a>
              <a href="/testimonials.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Clients</a>
              <a href="/contact.html" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Contact</a>
            </div>
            <div class="flex flex-col gap-3">
              <h4 class="text-[0.85rem] font-semibold text-white uppercase tracking-wider mb-1">Connect</h4>
              <a href="https://linkedin.com" target="_blank" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">LinkedIn</a>
              <a href="https://github.com" target="_blank" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">GitHub</a>
              <a href="https://twitter.com" target="_blank" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Twitter / X</a>
              <a href="mailto:hello@axiomate.tech" class="text-[0.85rem] text-gray-400 hover:text-[#00d2ff] transition-colors duration-300">Email Us</a>
            </div>
          </div>
          <div class="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/10 text-[0.8rem] text-gray-500 gap-4 text-center md:text-left">
            <p>&copy; 2026 Axiomate Tech Services. All rights reserved.</p>
            <p class="font-mono">Crafted with precision & passion.</p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('axiomate-footer', AxiomateFooter);