// Main JavaScript functionality for the podcast website

class PodcastApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAudioPlayer();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const mobileMenuClose = document.getElementById('mobileMenuClose');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => this.closeMobileMenu());
        }

        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                if (e.target === mobileMenuOverlay) {
                    this.closeMobileMenu();
                }
            });
        }

        // Mobile nav links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }

        // Episode play buttons
        const episodePlayBtns = document.querySelectorAll('.episode-play-btn');
        episodePlayBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEpisodePlay(e));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Handle user interaction for audio autoplay
        document.addEventListener('click', () => this.handleFirstUserInteraction(), { once: true });
        document.addEventListener('touchstart', () => this.handleFirstUserInteraction(), { once: true });
    }

    setupAudioPlayer() {
        const audio = document.getElementById('backgroundAudio');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const playIcon = document.getElementById('playIcon');
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeIcon = document.getElementById('volumeIcon');
        const audioStatus = document.querySelector('.audio-status');

        if (!audio || !playPauseBtn) return;

        let isPlaying = false;
        let isMuted = false;
        let hasUserInteracted = false;

        // Set initial volume
        audio.volume = 0.3;

        // Update initial status
        if (audioStatus) {
            audioStatus.textContent = 'Click to play';
        }

        // Play/Pause functionality
        playPauseBtn.addEventListener('click', async () => {
            hasUserInteracted = true;
            
            if (isPlaying) {
                audio.pause();
            } else {
                try {
                    await audio.play();
                    if (audioStatus) {
                        audioStatus.textContent = 'Now playing';
                    }
                } catch (error) {
                    console.log('Audio play failed:', error);
                    this.showNotification('Unable to play audio. Please check your browser settings.', 'warning');
                    if (audioStatus) {
                        audioStatus.textContent = 'Playback failed';
                    }
                }
            }
        });

        // Volume control
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                if (isMuted) {
                    audio.volume = 0.3;
                    volumeIcon.className = 'fas fa-volume-up';
                    isMuted = false;
                } else {
                    audio.volume = 0;
                    volumeIcon.className = 'fas fa-volume-mute';
                    isMuted = true;
                }
            });
        }

        // Audio events
        audio.addEventListener('play', () => {
            playIcon.className = 'fas fa-pause';
            isPlaying = true;
            if (audioStatus) {
                audioStatus.textContent = 'Now playing';
            }
        });

        audio.addEventListener('pause', () => {
            playIcon.className = 'fas fa-play';
            isPlaying = false;
            if (audioStatus) {
                audioStatus.textContent = 'Paused';
            }
        });

        audio.addEventListener('ended', () => {
            playIcon.className = 'fas fa-play';
            isPlaying = false;
            if (audioStatus) {
                audioStatus.textContent = 'Ended';
            }
        });

        audio.addEventListener('error', (e) => {
            console.log('Audio error:', e);
            this.showNotification('Unable to load background music', 'warning');
            if (audioStatus) {
                audioStatus.textContent = 'Audio unavailable';
            }
        });

        audio.addEventListener('loadstart', () => {
            if (audioStatus) {
                audioStatus.textContent = 'Loading...';
            }
        });

        audio.addEventListener('canplay', () => {
            if (audioStatus && !isPlaying) {
                audioStatus.textContent = 'Ready to play';
            }
        });

        // Try to preload audio
        audio.preload = 'metadata';
    }

    handleFirstUserInteraction() {
        // This function is called on the first user interaction
        // We can now attempt to play audio if needed
        const audio = document.getElementById('backgroundAudio');
        if (audio) {
            // Just prepare the audio, don't auto-play
            audio.load();
        }
    }

    setupScrollEffects() {
        const header = document.getElementById('header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Header background on scroll
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Hide/show header on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    setupMobileMenu() {
        // Handle mobile menu animations
        const hamburgerLines = document.querySelectorAll('.hamburger-line');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                hamburgerLines.forEach((line, index) => {
                    line.style.transform = this.isMenuOpen() ? 'none' : this.getHamburgerTransform(index);
                });
            });
        }
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupIntersectionObserver() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.clip-card, .episode-card, .merch-item, .social-card');
        animateElements.forEach(el => observer.observe(el));
    }

    toggleMobileMenu() {
        const overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) {
            overlay.classList.toggle('active');
            document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
        }
    }

    closeMobileMenu() {
        const overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    isMenuOpen() {
        const overlay = document.getElementById('mobileMenuOverlay');
        return overlay && overlay.classList.contains('active');
    }

    getHamburgerTransform(index) {
        const transforms = [
            'rotate(45deg) translate(5px, 5px)',
            'opacity: 0',
            'rotate(-45deg) translate(7px, -6px)'
        ];
        return transforms[index] || 'none';
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('.newsletter-input').value;
        
        if (this.validateEmail(email)) {
            this.showNotification('Thanks for subscribing! We\'ll keep you updated.', 'success');
            form.reset();
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
        }
    }

    handleEpisodePlay(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const episodeCard = button.closest('.episode-card');
        const episodeTitle = episodeCard.querySelector('h3').textContent;
        
        this.showNotification(`Playing: ${episodeTitle}`, 'info');
        
        // Add pulse animation
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 2000);
    }

    handleKeyboardNavigation(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && this.isMenuOpen()) {
            this.closeMobileMenu();
        }

        // Space bar controls audio player
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.click();
            }
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '300px',
            fontSize: '14px',
            fontWeight: '500'
        });

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };
        return colors[type] || colors.info;
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PodcastApp();
});

// Handle page visibility changes (pause audio when tab is hidden)
document.addEventListener('visibilitychange', () => {
    const audio = document.getElementById('backgroundAudio');
    if (audio && document.hidden) {
        // Optionally pause when tab becomes hidden
        // audio.pause();
    }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PodcastApp;
}