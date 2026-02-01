(function() {
  'use strict';

  const app = window.__app || {};
  window.__app = app;

  const DESKTOP_BREAKPOINT = 1024;
  const MOBILE_BREAKPOINT = 576;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    const toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    const nav = document.querySelector('.c-nav, .navbar-collapse');
    const navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

    if (!toggle || !nav) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      nav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      isOpen = false;
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.keyCode === 27) && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen) closeMenu();
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT && isOpen) {
        closeMenu();
      }
    }, 250), { passive: true });
  }

  function initSmoothScroll() {
    if (app.smoothScrollInit) return;
    app.smoothScrollInit = true;

    const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' || href === '#!') return;

      if (!isHomepage && href.startsWith('#')) {
        const sectionId = href.substring(1);
        if (sectionId) link.setAttribute('href', '/#' + sectionId);
      }

      link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        if (!target || target === '#' || target === '#!') return;

        const hash = target.includes('#') ? target.substring(target.indexOf('#') + 1) : '';
        if (!hash) return;

        const targetElement = document.getElementById(hash);
        if (!targetElement) return;

        e.preventDefault();

        const header = document.querySelector('.l-header');
        const offset = header ? header.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, '#' + hash);
        }
      });
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInit) return;
    app.scrollSpyInit = true;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      const scrollPos = window.pageYOffset + 100;

      sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === '#' + id || link.getAttribute('href') === '/#' + id) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', debounce(updateActiveLink, 100), { passive: true });
    updateActiveLink();
  }

  function initActiveMenuState() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      let isActive = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        if (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('/')) {
          isActive = true;
        }
      } else if (!linkPath.includes('#')) {
        const normalizedPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
        const normalizedLink = linkPath.endsWith('/') ? linkPath.slice(0, -1) : linkPath;
        if (normalizedPath === normalizedLink || normalizedPath.endsWith(normalizedLink)) {
          isActive = true;
        }
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  }

  function initImageHandling() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    const images = document.querySelectorAll('img');

    images.forEach(img => {
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e9ecef"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EImage not available%3C/text%3E%3C/svg%3E';
        this.src = fallbackSvg;
        this.style.objectFit = 'contain';
      });
    });
  }

  function notify(message, type) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    container.appendChild(toast);

    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 150);
      });
    }

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    }, 5000);
  }

  function initFormValidation() {
    if (app.formsInit) return;
    app.formsInit = true;

    const forms = document.querySelectorAll('.c-form, .needs-validation');

    const validators = {
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
      },
      name: {
        pattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
        message: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen).'
      },
      phone: {
        pattern: /^[\d\s+\-()]{10,20}$/,
        message: 'Bitte geben Sie eine gültige Telefonnummer ein.'
      },
      message: {
        minLength: 10,
        message: 'Die Nachricht muss mindestens 10 Zeichen lang sein.'
      }
    };

    function validateField(field) {
      const fieldType = field.type;
      const fieldName = field.name;
      const fieldValue = field.value.trim();
      let isValid = true;
      let errorMessage = '';

      if (field.hasAttribute('required') && !fieldValue) {
        isValid = false;
        errorMessage = 'Dieses Feld ist erforderlich.';
      } else if (fieldValue) {
        if (fieldType === 'email' || fieldName === 'email') {
          if (!validators.email.pattern.test(fieldValue)) {
            isValid = false;
            errorMessage = validators.email.message;
          }
        } else if (fieldName === 'firstName' || fieldName === 'lastName') {
          if (!validators.name.pattern.test(fieldValue)) {
            isValid = false;
            errorMessage = validators.name.message;
          }
        } else if (fieldName === 'phone') {
          if (!validators.phone.pattern.test(fieldValue)) {
            isValid = false;
            errorMessage = validators.phone.message;
          }
        } else if (fieldName === 'message') {
          if (fieldValue.length < validators.message.minLength) {
            isValid = false;
            errorMessage = validators.message.message;
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        isValid = false;
        errorMessage = 'Bitte akzeptieren Sie die Datenschutzerklärung.';
      }

      return { isValid, errorMessage };
    }

    function showFieldError(field, message) {
      field.classList.add('is-invalid');
      let errorEl = field.parentElement.querySelector('.invalid-feedback, .c-form__error');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = field.classList.contains('c-input') ? 'c-form__error' : 'invalid-feedback';
        field.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    function clearFieldError(field) {
      field.classList.remove('is-invalid');
      const errorEl = field.parentElement.querySelector('.invalid-feedback, .c-form__error');
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          const validation = validateField(input);
          if (!validation.isValid) {
            showFieldError(input, validation.errorMessage);
          } else {
            clearFieldError(input);
          }
        });

        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            const validation = validateField(input);
            if (validation.isValid) {
              clearFieldError(input);
            }
          }
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let isFormValid = true;
        const formInputs = form.querySelectorAll('input, textarea, select');

        formInputs.forEach(input => {
          const validation = validateField(input);
          if (!validation.isValid) {
            showFieldError(input, validation.errorMessage);
            isFormValid = false;
          } else {
            clearFieldError(input);
          }
        });

        if (!isFormValid) {
          form.classList.add('was-validated');
          notify('Bitte überprüfen Sie die markierten Felder.', 'danger');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        let originalText = '';

        if (submitBtn) {
          submitBtn.disabled = true;
          originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
        }

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }

          notify('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success');
          form.reset();
          form.classList.remove('was-validated');

          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1500);
      });
    });
  }

  function initScrollToTop() {
    if (app.scrollToTopInit) return;
    app.scrollToTopInit = true;

    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'btn-scroll-top';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:var(--color-platinum);color:var(--color-primary);border:none;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s;z-index:1000;box-shadow:var(--shadow-lg);display:flex;align-items:center;justify-content:center;';
    document.body.appendChild(scrollBtn);

    function toggleScrollBtn() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', debounce(toggleScrollBtn, 100), { passive: true });
    toggleScrollBtn();
  }

  function initCountUp() {
    if (app.countUpInit) return;
    app.countUpInit = true;

    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-count'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current);
        }
      }, 16);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function initPrivacyModal() {
    if (app.privacyModalInit) return;
    app.privacyModalInit = true;

    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.hasAttribute('data-modal')) {
          e.preventDefault();
          window.open(link.href, 'privacy', 'width=800,height=600,scrollbars=yes');
        }
      });
    });
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenuState();
    initImageHandling();
    initFormValidation();
    initScrollToTop();
    initCountUp();
    initPrivacyModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();