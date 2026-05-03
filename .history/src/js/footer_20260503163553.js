class AxiomateFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer id="footer" class="footer">
        <div class="container">
          <div class="footer-top">
            <div class="footer-brand">
              <img src="/images/logo.png" alt="Axiomate" class="footer-logo-img" />
              <span class="footer-logo-text">Axiomate</span>
              <p class="footer-tagline">Engineering Tomorrow's Technology</p>
            </div>
            <div class="footer-links-group">
              <h4>Services</h4>
              <a href="/web-development.html">Web Development</a>
              <a href="/ai-ml.html">AI & ML</a>
              <a href="/mobile-apps.html">Mobile Apps</a>
              <a href="/cloud-devops.html">Cloud & DevOps</a>
            </div>
            <div class="footer-links-group">
              <h4>Company</h4>
              <a href="/about.html">About Us</a>
              <a href="/process.html">Our Process</a>
              <a href="/testimonials.html">Clients</a>
              <a href="/contact.html">Contact</a>
            </div>
            <div class="footer-links-group">
              <h4>Connect</h4>
              <a href="https://linkedin.com" target="_blank">LinkedIn</a>
              <a href="https://github.com" target="_blank">GitHub</a>
              <a href="https://twitter.com" target="_blank">Twitter / X</a>
              <a href="mailto:hello@axiomate.tech">Email Us</a>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 Axiomate Tech Services. All rights reserved.</p>
            <p class="footer-made">Crafted with precision & passion.</p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('axiomate-footer', AxiomateFooter);