// Navigation Menu Handler
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        const menuBtn = document.getElementById('menu-btn');
        const navMenu = document.getElementById('nav-menu');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const navOverlay = navMenu ? navMenu.querySelector('.nav-menu-overlay') : null;
        const navLinks = navMenu ? navMenu.querySelectorAll('.nav-menu-items a') : [];
        
        // Open menu
        if (menuBtn && navMenu) {
            menuBtn.addEventListener('click', function() {
                navMenu.classList.remove('hidden');
                // Prevent body scroll when menu is open
                document.body.style.overflow = 'hidden';
                
                // Focus close button for accessibility
                if (closeMenuBtn) {
                    setTimeout(() => closeMenuBtn.focus(), 100);
                }
            });
        }
        
        // Close menu function
        function closeMenu() {
            if (navMenu) {
                navMenu.classList.add('hidden');
                // Restore body scroll
                document.body.style.overflow = '';
                
                // Return focus to menu button
                if (menuBtn) {
                    menuBtn.focus();
                }
            }
        }
        
        // Close menu button
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', closeMenu);
        }
        
        // Close menu when clicking overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', closeMenu);
        }
        
        // Close menu when clicking a link (for anchor links)
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                // Only close if it's an anchor link (starts with #)
                if (link.getAttribute('href').startsWith('#')) {
                    closeMenu();
                }
            });
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu && !navMenu.classList.contains('hidden')) {
                closeMenu();
            }
        });
        
        // Update footer links to match nav menu
        const footerNav = document.querySelector('footer nav');
        if (footerNav) {
            footerNav.innerHTML = `
                <a href="about.html">About</a>
                <a href="privacy.html">Privacy</a>
            `;
        }
    });
})();
