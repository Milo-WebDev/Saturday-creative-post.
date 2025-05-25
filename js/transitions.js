// js/transitions.js
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('page-transition-overlay');
    const pageContainer = document.querySelector('.page-container'); 
    // Get the logo element within the overlay
    const transitionLogoElement = overlay ? overlay.querySelector('.transition-logo-container') : null; 

    if (!overlay) {
        console.error('[Transitions] #page-transition-overlay element not found. Transitions will not work.');
        return;
    }
    if (!pageContainer) {
        console.error('[Transitions] .page-container element not found. Page reveal might not work correctly.');
    }

    // --- Initial State Setup ---
    document.body.classList.add('is-loading'); 
    overlay.classList.remove('hidden');      
    overlay.style.display = 'flex';          

    if (!window.gsap) {
        console.warn('[Transitions] GSAP not found. Overlay image trail disabled.');
    }

    let overlayTrailHandler = null; 

    const overlayTrailImageSources = [ 
        'imagenes/hero/footer/img (1).png',
        'imagenes/hero/footer/img (2).png',
        'imagenes/hero/footer/img (3).png',
        'imagenes/hero/footer/img (4).png',
        'imagenes/hero/footer/img (5).png',
    ];

    // exclusionElement is the element over which trail images should NOT be created
    function initializeOverlayImageTrail(targetElement, exclusionElement) {
        if (!window.gsap || overlayTrailImageSources.length === 0) {
            console.log('[Transitions] Overlay trail prerequisites not met.');
            return { start: () => {}, stop: () => {} }; 
        }

        console.log('[Transitions] Initializing image trail for overlay.');
        if (exclusionElement) {
            console.log('[Transitions] Exclusion element for trail:', exclusionElement);
        }


        let currentImageIndex = 0;
        let lastImageAnchorX = null;
        let lastImageAnchorY = null;
        const MIN_DISTANCE_THRESHOLD = 70; 
        const OFFSET_DISTANCE = 110;       
        const MAX_TRAIL_IMAGES = 9;        
        let activeTrailImages = [];        
        // No need for exclusionRect calculation anymore

        function createOverlayTrailImage(event) {
            // --- MODIFIED EXCLUSION CHECK ---
            // If an exclusionElement is defined, and the event.target (the element directly under the mouse)
            // is the exclusionElement itself or one of its children, then do not create a trail image.
            if (exclusionElement && exclusionElement.contains(event.target)) {
                // Optional: log when skipping
                // console.log('[Transitions Trail] Mouse is over exclusion element. Skipping image creation. Target:', event.target);
                return; 
            }

            const currentMouseX = event.offsetX; // These are relative to targetElement (the overlay)
            const currentMouseY = event.offsetY;

            const prevImageAnchorX = lastImageAnchorX;
            const prevImageAnchorY = lastImageAnchorY;

            if (prevImageAnchorX !== null && prevImageAnchorY !== null) {
                const deltaX = currentMouseX - prevImageAnchorX;
                const deltaY = currentMouseY - prevImageAnchorY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance < MIN_DISTANCE_THRESHOLD) {
                    return;
                }
            }

            lastImageAnchorX = currentMouseX;
            lastImageAnchorY = currentMouseY;

            if (activeTrailImages.length >= MAX_TRAIL_IMAGES) {
                const oldestImageEntry = activeTrailImages.shift();
                if (oldestImageEntry && oldestImageEntry.img.parentNode === targetElement) {
                    if (oldestImageEntry.timeline) oldestImageEntry.timeline.kill();
                    gsap.to(oldestImageEntry.img, {
                        opacity: 0, scale: 0.1, duration: 0.2, ease: 'power1.in',
                        onComplete: () => {
                            if (oldestImageEntry.img.parentNode === targetElement) oldestImageEntry.img.remove();
                        }
                    });
                }
            }

            const img = document.createElement('img');
            img.classList.add('trail-image'); 
            img.src = overlayTrailImageSources[currentImageIndex];
            currentImageIndex = (currentImageIndex + 1) % overlayTrailImageSources.length;
            targetElement.appendChild(img);

            let initialAppearX = currentMouseX;
            let initialAppearY = currentMouseY;

            if (prevImageAnchorX !== null && prevImageAnchorY !== null) {
                const dX = currentMouseX - prevImageAnchorX;
                const dY = currentMouseY - prevImageAnchorY;
                const moveLength = Math.sqrt(dX * dX + dY * dY);
                if (moveLength > 1) {
                    const normX = dX / moveLength; const normY = dY / moveLength;
                    initialAppearX = currentMouseX - normX * OFFSET_DISTANCE;
                    initialAppearY = currentMouseY - normY * OFFSET_DISTANCE;
                } else {
                    initialAppearX = currentMouseX - OFFSET_DISTANCE * 0.7071;
                    initialAppearY = currentMouseY - OFFSET_DISTANCE * 0.7071;
                }
            } else {
                 initialAppearX = currentMouseX - OFFSET_DISTANCE * 0.7071;
                 initialAppearY = currentMouseY - OFFSET_DISTANCE * 0.7071;
            }

            const tl = gsap.timeline({
                onComplete: () => {
                    if (img.parentNode === targetElement) img.remove();
                    const indexToRemove = activeTrailImages.findIndex(entry => entry.img === img);
                    if (indexToRemove > -1) activeTrailImages.splice(indexToRemove, 1);
                }
            });
            tl.set(img, { left: initialAppearX, top: initialAppearY, xPercent: -50, yPercent: -50, opacity: 1, scale: 1 });

            tl.to(img, { left: currentMouseX, top: currentMouseY, opacity: 1, scale: 2, duration: 1, ease: 'expo.out' });

            tl.to(img, { opacity: 0, scale: 0, duration: 0.6, delay: 0.3, ease: 'expo.in' });
            activeTrailImages.push({ img, timeline: tl });
        }
        
        const _mouseMoveHandler = (event) => createOverlayTrailImage(event);

        function startTrail() {
            console.log('[Transitions] Starting overlay image trail.');
            // No need to calculate exclusionRect here anymore
            
            lastImageAnchorX = null;
            lastImageAnchorY = null;
            activeTrailImages.forEach(entry => { 
                if (entry.timeline) entry.timeline.kill();
                if (entry.img.parentNode) entry.img.remove();
            });
            activeTrailImages = [];
            targetElement.addEventListener('mousemove', _mouseMoveHandler);
        }

        function stopTrail(forceClear = true) {
            console.log('[Transitions] Stopping overlay image trail.');
            targetElement.removeEventListener('mousemove', _mouseMoveHandler);
            if (forceClear) {
                activeTrailImages.forEach(entry => {
                    if (entry.timeline) entry.timeline.kill();
                    if (entry.img.parentNode === targetElement) {
                        gsap.to(entry.img, {
                            opacity: 0, scale: 0.1, duration: 0.20, ease: 'expo.in',
                            onComplete: () => {
                                if (entry.img.parentNode === targetElement) entry.img.remove();
                            }
                        });
                    }
                });
                activeTrailImages = [];
            }
        }
        return { start: startTrail, stop: stopTrail };
    }
    
    // Initialize the trail, passing the overlay as the target and the logo as the exclusion element
    if (overlay && window.gsap) {
        overlayTrailHandler = initializeOverlayImageTrail(overlay, transitionLogoElement);
        if (overlayTrailHandler) { 
            overlayTrailHandler.start();
        }
    }

    // --- Reveal Page Function ---
    function revealPage() {
        console.log('[Transitions] Revealing page content.');
        if (overlayTrailHandler) overlayTrailHandler.stop(); 

        overlay.classList.add('hidden'); 

        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded'); 

        setTimeout(() => {
            if (overlay.classList.contains('hidden')) {
                overlay.style.display = 'none';
                console.log('[Transitions] Overlay fully hidden.');
            }
        }, 700); 
    }

    // --- Trigger Reveal ---
    function startRevealSequence(delay) {
        console.log(`[Transitions] Scheduling page reveal with ${delay}ms delay.`);
        setTimeout(revealPage, delay);
    }

    if (document.readyState === 'complete') {
        console.log('[Transitions] Document already complete. Short delay for reveal.');
        startRevealSequence(200); 
    } else {
        window.addEventListener('load', () => {
            console.log('[Transitions] Window finished loading all assets.');
            startRevealSequence(1500); 
        });
    }

    // --- Page Navigation Transitions ---
    const internalLinks = document.querySelectorAll(
        'a[href]:not([target="_blank"]):not([href^="mailto:"]):not([href^="tel:"]):not([href^="javascript:"])'
    );

    internalLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');

            if (href && href.startsWith('#')) {
                const currentPath = window.location.pathname.replace(/\/$/, ""); 
                const linkPath = this.pathname.replace(/\/$/, "");

                if ( (this.href.split('#')[0] === window.location.href.split('#')[0]) || 
                     (linkPath === currentPath && this.hash !== "") ) {
                     console.log('[Transitions] Same-page anchor link, allowing default behavior:', href);
                     return; 
                }
            }
            
            if (!href || href === "#") {
                return;
            }

            event.preventDefault();
            console.log(`[Transitions] Intercepted navigation to: ${href}`);

            if (pageContainer) {
                pageContainer.style.transition = 'opacity 0.3s ease-out'; 
                pageContainer.style.opacity = '0';
            }
            document.body.classList.remove('is-loaded');
            document.body.classList.add('is-loading');

            overlay.style.display = 'flex'; 
            requestAnimationFrame(() => {
                overlay.classList.remove('hidden'); 
                if (overlayTrailHandler) overlayTrailHandler.start(); 
                console.log('[Transitions] Showing overlay for navigation.');
            });

            setTimeout(() => {
                console.log(`[Transitions] Navigating to ${href}`);
                if (overlayTrailHandler) overlayTrailHandler.stop(false); 
                window.location.href = href;
            }, 700); 
        });
    });
});