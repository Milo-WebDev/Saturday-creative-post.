// --- START OF FILE global-effects.js ---
// Contains effects and initializations shared across multiple pages (index.html, music.html, etc.)

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Global Effects] DOMContentLoaded');

    // --- Lenis Smooth Scroll Initialization (GLOBAL) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false, // Keep false for potential conflict avoidance on mobile?
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    console.log('[Global Effects] Lenis smooth scroll initialized.');

    // --- GSAP ScrollTrigger Integration & Setup (GLOBAL) ---
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger); // Register plugin FIRST

        // Integrate Lenis with ScrollTrigger updates (Needs to happen ONCE globally)
        lenis.on('scroll', ScrollTrigger.update);
        console.log('[Global Effects] Lenis scroll listener added for ScrollTrigger.update');

        // Integrate Lenis into GSAP ticker for synchronization
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
        console.log('[Global Effects] GSAP ScrollTrigger integrated with Lenis ticker.');

        // --- Header Background Toggle (GLOBAL) ---
        const header = document.querySelector('.site-header');
        if (header) {
            ScrollTrigger.create({
                start: 'top -80', // When top of viewport scrolls 80px past the top of the page
                end: 99999, // Essentially infinite end point
                toggleClass: { className: 'site-header-scrolled', targets: header }
                // markers: true // Optional: for debugging scroll trigger points
            });
            console.log('[Global Effects] Header background toggle ScrollTrigger created.');
        } else {
            console.warn('[Global Effects] .site-header not found for background toggle.');
        }

        // --- Footer Logo Animation (GLOBAL) ---
        const siteLogo = document.querySelector('.site-header .logo');
        const mainFooter = document.querySelector('.main-footer');

        if (siteLogo && mainFooter) {
            // Set transform origin for scaling animation
            gsap.set(siteLogo, { transformOrigin: "top left" });

            // Define final position (adjust if needed, 50%/50% is viewport center usually)
            const finalLogoX = "50%";
            const finalLogoY = "50%";

            ScrollTrigger.create({
                trigger: mainFooter,
                start: "top center", // When the top of the footer hits the center of the viewport
                end: "center center", // When the center of the footer hits the center of the viewport
                scrub: 1, // Smooth scrubbing effect (1 second delay)
                // markers: true, // Optional: for debugging
                animation: gsap.to(siteLogo, {
                    // Move the element relative to its normal position first
                    left: finalLogoX,
                    top: finalLogoY,
                    // Then adjust position using translate (0,0 means center based on top-left origin)
                    xPercent: 0, // Keep original xPercent correction
                    yPercent: 0, // Keep original yPercent correction
                    scale: 5,    // Scale it up
                    ease: "none", // Linear transition during scrub
                    duration: 1   // Duration influences the scrub smoothing
                }),
            });
            console.log('[Global Effects] Footer logo animation ScrollTrigger created.');
        } else {
             if (!siteLogo) console.warn('[Global Effects] .site-header .logo not found for footer animation.');
             if (!mainFooter) console.warn('[Global Effects] .main-footer not found for footer animation trigger.');
        }

    } else {
        console.warn('[Global Effects] GSAP or ScrollTrigger not found. Global scroll effects disabled.');
        // Stop Lenis if GSAP/ScrollTrigger isn't there? Or let it run for basic smooth scroll?
        // lenis.destroy(); // Optionally destroy lenis if GSAP is essential
    }

}); // End MAIN DOMContentLoaded listener
// --- END OF FILE global-effects.js ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Index Effects] DOMContentLoaded for Footer Image Trail');

    const footerElement = document.querySelector('.main-footer');
    if (!footerElement) {
        console.warn('[Index Effects] Footer element .main-footer not found for image trail.');
        return;
    }

    // --- Configuration for Footer Image Trail ---
    const trailImageSources = [
        'imagenes/hero/footer/img (1).png',
        'imagenes/hero/footer/img (2).png',
        'imagenes/hero/footer/img (3).png',
        'imagenes/hero/footer/img (4).png',
        'imagenes/hero/footer/img (5).png',
        // Add more image paths as needed
    ];

    if (trailImageSources.length === 0) {
        console.warn('[Index Effects] No images configured for footer trail.');
        return;
    }

    let currentImageIndex = 0;
    let lastImageX = null;
    let lastImageY = null;
    const MIN_DISTANCE_THRESHOLD = 100;

    function createTrailImage(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        if (lastImageX !== null && lastImageY !== null) {
            const deltaX = mouseX - lastImageX;
            const deltaY = mouseY - lastImageY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < MIN_DISTANCE_THRESHOLD) {
                return;
            }
        }

        lastImageX = mouseX;
        lastImageY = mouseY;

        const img = document.createElement('img');
        img.classList.add('trail-image');
        img.src = trailImageSources[currentImageIndex];
        currentImageIndex = (currentImageIndex + 1) % trailImageSources.length;

        footerElement.appendChild(img);

        // Set initial properties: immediate appearance
        gsap.set(img, {
            left: mouseX,
            top: mouseY,
            xPercent: -50,
            yPercent: -50,
            opacity: 1,
            scale: 2
            // rotation: 0 // No initial rotation needed if not animating it
        });

        // Animate disappearance after a delay
        gsap.to(img, {
            opacity: 0,
            scale: 0.3, // Still scale down on fade, looks nice
            // rotation: 0, // <-- REMOVED/COMMENTED OUT rotation animation
            duration: 0.7,
            delay: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                img.remove();
            }
        });
    }

    footerElement.addEventListener('mouseenter', () => {
        console.log('[Index Effects] Mouse entered footer. Activating image trail.');
        lastImageX = null;
        lastImageY = null;
        footerElement.addEventListener('mousemove', createTrailImage);
    });

    footerElement.addEventListener('mouseleave', () => {
        console.log('[Index Effects] Mouse left footer. Deactivating image trail.');
        footerElement.removeEventListener('mousemove', createTrailImage);
    });

});