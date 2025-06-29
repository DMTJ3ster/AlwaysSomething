// Enhanced JavaScript functionality for the podcast website

class PodcastApp {
    constructor() {
        this.init();
        this.setupParallax();
        this.setupImageLazyLoading();
        this.setupAnimationTriggers();
    }

    init() {
        this.setupEventListeners();
        this.setupAudioPlayer();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupParticleEffects();
        this.setupImageEffects();
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

        // Clip cards hover effects
        const clipCards = document.querySelectorAll('.clip-card');
        clipCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.handleCardHover(card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
        });

        // Social cards effects
        const socialCards = document.querySelectorAll('.social-card');
        socialCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.handleSocialCardHover(card));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Handle user interaction for audio autoplay
        document.addEventListener('click', () => this.handleFirstUserInteraction(), { once: true });
        document.addEventListener('touchstart', () => this.handleFirstUserInteraction(), { once: true });

        // Window resize handler
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));

        // Mouse move for parallax effects
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    setupAudioPlayer() {
        const audio = document.getElementById('backgroundAudio');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const playIcon = document.getElementById('playIcon');
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeIcon = document.getElementById('volumeIcon');
        const audioStatus = document.querySelector('.audio-status');
        const audioPlayer = document.getElementById('audioPlayer');

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

        // Add visual feedback to audio player
        if (audioPlayer) {
            audioPlayer.style.animation = 'slideInUp 0.6s ease-out';
        }

        // Play/Pause functionality with enhanced feedback
        playPauseBtn.addEventListener('click', async () => {
            hasUserInteracted = true;
            
            // Add click animation
            playPauseBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                playPauseBtn.style.transform = '';
            }, 150);
            
            if (isPlaying) {
                audio.pause();
                this.removeAudioVisualizer();
            } else {
                try {
                    await audio.play();
                    if (audioStatus) {
                        audioStatus.textContent = 'Now playing';
                        audioStatus.classList.add('playing');
                    }
                    this.addAudioVisualizer();
                } catch (error) {
                    console.log('Audio play failed:', error);
                    this.showNotification('Unable to play audio. Please check your browser settings.', 'warning');
                    if (audioStatus) {
                        audioStatus.textContent = 'Playback failed';
                        audioStatus.classList.add('error');
                    }
                }
            }
        });

        // Volume control with animation
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                volumeBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    volumeBtn.style.transform = '';
                }, 150);

                if (isMuted) {
                    audio.volume = 0.3;
                    volumeIcon.className = 'fas fa-volume-up';
                    isMuted = false;
                    this.showNotification('Audio unmuted', 'info');
                } else {
                    audio.volume = 0;
                    volumeIcon.className = 'fas fa-volume-mute';
                    isMuted = true;
                    this.showNotification('Audio muted', 'info');
                }
            });
        }

        // Audio events with enhanced feedback
        audio.addEventListener('play', () => {
            playIcon.className = 'fas fa-pause';
            isPlaying = true;
            if (audioStatus) {
                audioStatus.textContent = 'Now playing';
                audioStatus.classList.add('playing');
                audioStatus.classList.remove('error');
            }
            if (audioPlayer) {
                audioPlayer.classList.add('glow');
            }
        });

        audio.addEventListener('pause', () => {
            playIcon.className = 'fas fa-play';
            isPlaying = false;
            if (audioStatus) {
                audioStatus.textContent = 'Paused';
                audioStatus.classList.remove('playing');
            }
            if (audioPlayer) {
                audioPlayer.classList.remove('glow');
            }
        });

        audio.addEventListener('ended', () => {
            playIcon.className = 'fas fa-play';
            isPlaying = false;
            if (audioStatus) {
                audioStatus.textContent = 'Ended';
                audioStatus.classList.remove('playing');
            }
            this.removeAudioVisualizer();
        });

        audio.addEventListener('error', (e) => {
            console.log('Audio error:', e);
            this.showNotification('Unable to load background music', 'warning');
            if (audioStatus) {
                audioStatus.textContent = 'Audio unavailable';
                audioStatus.classList.add('error');
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

    addAudioVisualizer() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer || audioPlayer.querySelector('.audio-visualizer')) return;

        const visualizer = document.createElement('div');
        visualizer.className = 'audio-visualizer';
        visualizer.innerHTML = `
            <div class="visualizer-bar"></div>
            <div class="visualizer-bar"></div>
            <div class="visualizer-bar"></div>
            <div class="visualizer-bar"></div>
        `;
        
        // Add CSS for visualizer
        const style = document.createElement('style');
        style.textContent = `
            .audio-visualizer {
                display: flex;
                align-items: center;
                gap: 2px;
                margin-left: 8px;
            }
            .visualizer-bar {
                width: 3px;
                height: 12px;
                background: var(--primary);
                border-radius: 2px;
                animation: visualizer 0.8s ease-in-out infinite;
            }
            .visualizer-bar:nth-child(2) { animation-delay: 0.1s; }
            .visualizer-bar:nth-child(3) { animation-delay: 0.2s; }
            .visualizer-bar:nth-child(4) { animation-delay: 0.3s; }
            @keyframes visualizer {
                0%, 100% { height: 4px; opacity: 0.5; }
                50% { height: 16px; opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        audioPlayer.querySelector('.audio-controls').appendChild(visualizer);
    }

    removeAudioVisualizer() {
        const visualizer = document.querySelector('.audio-visualizer');
        if (visualizer) {
            visualizer.remove();
        }
    }

    handleFirstUserInteraction() {
        const audio = document.getElementById('backgroundAudio');
        if (audio) {
            audio.load();
        }
    }

    setupScrollEffects() {
        const header = document.getElementById('header');
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const currentScrollY = window.scrollY;

            // Header background on scroll
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Hide/show header on scroll with smooth animation
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.hero-background, .section');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                if (element.classList.contains('hero-background')) {
                    element.style.transform = `translateY(${rate}px)`;
                }
            });
        });
    }

    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    setupAnimationTriggers() {
        const animatedElements = document.querySelectorAll('.clip-card, .episode-card, .merch-item, .social-card');
        
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupMobileMenu() {
        const hamburgerLines = document.querySelectorAll('.hamburger-line');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                const isOpen = this.isMenuOpen();
                hamburgerLines.forEach((line, index) => {
                    if (isOpen) {
                        line.style.transform = 'none';
                        line.style.opacity = '1';
                    } else {
                        const transforms = [
                            'rotate(45deg) translate(5px, 5px)',
                            'opacity: 0',
                            'rotate(-45deg) translate(7px, -6px)'
                        ];
                        if (index === 1) {
                            line.style.opacity = '0';
                        } else {
                            line.style.transform = transforms[index];
                        }
                    }
                });
            });
        }
    }

    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    // Add smooth scroll with easing
                    this.smoothScrollTo(targetPosition, 800);
                }
            });
        });
    }

    smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    
                    // Add staggered animation for grid items
                    if (entry.target.parentElement.classList.contains('clips-grid') ||
                        entry.target.parentElement.classList.contains('merch-grid') ||
                        entry.target.parentElement.classList.contains('social-grid')) {
                        const siblings = Array.from(entry.target.parentElement.children);
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.clip-card, .episode-card, .merch-item, .social-card, .section-header');
        animateElements.forEach(el => observer.observe(el));
    }

    setupParticleEffects() {
        // Create floating particles for enhanced visual appeal
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--primary);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                opacity: 0.3;
                left: ${Math.random() * 100}vw;
                top: 100vh;
                animation: floatUp ${5 + Math.random() * 5}s linear infinite;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 10000);
        };

        // Add CSS for floating particles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                to {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Create particles periodically
        setInterval(createParticle, 2000);
    }

    setupImageEffects() {
        // Add hover effects to images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.05)';
                img.style.filter = 'brightness(1.1) saturate(1.2)';
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
                img.style.filter = 'brightness(1) saturate(1)';
            });
        });
    }

    handleCardHover(card) {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        // Add CSS for ripple animation
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    handleCardLeave(card) {
        // Remove any remaining ripple effects
        const ripples = card.querySelectorAll('.ripple-effect');
        ripples.forEach(ripple => ripple.remove());
    }

    handleSocialCardHover(card) {
        // Add floating animation to social icons
        const icon = card.querySelector('.social-icon');
        if (icon) {
            icon.style.animation = 'bounce 0.6s ease-in-out';
            setTimeout(() => {
                icon.style.animation = '';
            }, 600);
        }
    }

    handleMouseMove(e) {
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                const x = (e.clientX - window.innerWidth / 2) * 0.01;
                const y = (e.clientY - window.innerHeight / 2) * 0.01;
                
                const heroBackground = hero.querySelector('.hero-background');
                if (heroBackground) {
                    heroBackground.style.transform = `translate(${x}px, ${y}px)`;
                }
            }
        }
    }

    handleResize() {
        // Recalculate animations and layouts on resize
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => {
            el.style.animationDelay = '0s';
        });
    }

    toggleMobileMenu() {
        const overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) {
            overlay.classList.toggle('active');
            document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
            
            // Add entrance animation to menu items
            if (overlay.classList.contains('active')) {
                const menuLinks = overlay.querySelectorAll('.mobile-nav-link');
                menuLinks.forEach((link, index) => {
                    link.style.animation = `slideInRight 0.3s ease-out ${index * 0.1}s both`;
                });
            }
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

    handleNewsletterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('.newsletter-input').value;
        const submitBtn = form.querySelector('.btn');
        
        if (this.validateEmail(email)) {
            // Add loading state
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Subscribing...';
            
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Subscribe';
                this.showNotification('Thanks for subscribing! We\'ll keep you updated.', 'success');
                form.reset();
                
                // Add success animation
                submitBtn.style.background = 'var(--success)';
                submitBtn.textContent = 'Subscribed!';
                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.textContent = 'Subscribe';
                }, 2000);
            }, 1500);
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
            form.querySelector('.newsletter-input').style.borderColor = 'var(--error)';
            setTimeout(() => {
                form.querySelector('.newsletter-input').style.borderColor = '';
            }, 3000);
        }
    }

    handleEpisodePlay(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const episodeCard = button.closest('.episode-card');
        const episodeTitle = episodeCard.querySelector('h3').textContent;
        
        // Add visual feedback
        button.style.transform = 'translate(-50%, -50%) scale(0.8)';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.style.transform = 'translate(-50%, -50%) scale(1)';
            button.style.background = '';
        }, 200);
        
        this.showNotification(`Playing: ${episodeTitle}`, 'info');
        
        // Add pulse animation to the entire card
        episodeCard.classList.add('pulse');
        setTimeout(() => episodeCard.classList.remove('pulse'), 2000);
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

        // Arrow keys for navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const focusableElements = document.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            if (e.key === 'ArrowDown' && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
                e.preventDefault();
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                focusableElements[currentIndex - 1].focus();
                e.preventDefault();
            }
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add enhanced styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            maxWidth: '350px',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });

        // Style notification content
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        // Style close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            margin-left: auto;
            transition: background 0.2s ease;
        `;

        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
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
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #6366f1, #4f46e5)'
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
    
    // Add loading screen fade out
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 500);
        }, 1000);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    const audio = document.getElementById('backgroundAudio');
    if (audio && document.hidden) {
        // Optionally pause when tab becomes hidden
        // audio.pause();
    }
});

// Service Worker registration for PWA capabilities
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

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PodcastApp;
}