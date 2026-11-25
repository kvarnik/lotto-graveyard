// Share Button Handler
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        const shareBtn = document.getElementById('share-btn');
        const copyLinkBtn = document.getElementById('copy-link-btn');
        
        // Share button handler
        if (shareBtn) {
            shareBtn.addEventListener('click', async function() {
                const shareData = {
                    title: 'RIP my numbers · Lotto Graveyard',
                    text: 'They died as they lived: not matching. Give your lottery tickets the send-off they deserve.',
                    url: window.location.href
                };
                
                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback: copy to clipboard
                        await navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard!');
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Share failed:', error);
                    }
                }
            });
        }
        
        // Copy link button handler
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', async function() {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('Link copied to clipboard!');
                } catch (error) {
                    console.error('Copy failed:', error);
                    showToast('Failed to copy link');
                }
            });
        }
        
        // Toast notification helper
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'share-toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    });
})();
