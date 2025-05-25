// --- START OF FILE scroll-effects.js ---

// --- Global Effects Section (formerly referred to as content of global-effects.js) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Global Effects] DOMContentLoaded');

    // --- Lenis Smooth Scroll Initialization (GLOBAL) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
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
        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', ScrollTrigger.update);
        console.log('[Global Effects] Lenis scroll listener added for ScrollTrigger.update');

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
        console.log('[Global Effects] GSAP ScrollTrigger integrated with Lenis ticker.');

        // --- Header Background Toggle (GLOBAL) ---
        const header = document.querySelector('.site-header');
        if (header) {
            ScrollTrigger.create({
                start: 'top -80',
                end: 99999,
                toggleClass: { className: 'site-header-scrolled', targets: header }
            });
            console.log('[Global Effects] Header background toggle ScrollTrigger created.');
        } else {
            console.warn('[Global Effects] .site-header not found for background toggle.');
        }

        // --- Footer Logo Animation (GLOBAL - Site Header Logo to Main Footer) ---
        const siteHeaderLogo = document.querySelector('.site-header .logo');
        const mainFooterTrigger = document.querySelector('.main-footer');

        if (siteHeaderLogo && mainFooterTrigger) {
            gsap.set(siteHeaderLogo, { transformOrigin: "top left" });

            ScrollTrigger.create({
                trigger: mainFooterTrigger,
                start: "top center",
                end: "center center",
                scrub: 1,
                animation: gsap.to(siteHeaderLogo, {
                    left: "50%",
                    top: "50%",
                    xPercent: 0, // To center the scaled logo
                    yPercent: 0, // To center the scaled logo
                    scale: 5,
                    ease: "none",
                    duration: 1
                }),
            });
            console.log('[Global Effects] Site header logo to footer animation ScrollTrigger created.');
        } else {
             if (!siteHeaderLogo) console.warn('[Global Effects] .site-header .logo not found for footer animation.');
             if (!mainFooterTrigger) console.warn('[Global Effects] .main-footer not found for site header logo animation trigger.');
        }

    } else {
        console.warn('[Global Effects] GSAP or ScrollTrigger not found. Global scroll effects disabled.');
    }
});
// --- End of Global Effects Section ---


// --- Index Page Specific Effects Section ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Index Effects] DOMContentLoaded for Index Page Specific Effects');

    const footerElement = document.querySelector('.main-footer');
    const footerContentWrapper = footerElement ? footerElement.querySelector('.footer-content-wrapper') : null;

    if (!window.gsap || !window.ScrollTrigger) {
        console.warn('[Index Effects] GSAP or ScrollTrigger not found. Index page scroll effects (trail, text anim) disabled.');
        return; // GSAP is essential for both effects
    }

    // --- Footer Image Trail (INDEX SPECIFIC) ---
    if (footerElement && footerContentWrapper) {
        const trailImageSources = [
            'imagenes/hero/footer/img (1).png',
            'imagenes/hero/footer/img (2).png',
            'imagenes/hero/footer/img (3).png',
            'imagenes/hero/footer/img (4).png',
            'imagenes/hero/footer/img (5).png',
        ];

        if (trailImageSources.length === 0) {
            console.warn('[Index Effects] No images configured for footer trail.');
        } else {
            const footerExclusionElements = [footerContentWrapper]; // Simplified to just the wrapper

            console.log('[Index Effects] Primary footer trail exclusion zone: .footer-content-wrapper');

            let currentImageIndex = 0;
            let lastImageAnchorX = null;
            let lastImageAnchorY = null;
            const MIN_DISTANCE_THRESHOLD = 70;
            const OFFSET_DISTANCE = 110;
            const MAX_TRAIL_IMAGES = 9;
            let activeTrailImages = [];

            function createTrailImage(event) {
                if (footerExclusionElements.length > 0 && footerExclusionElements[0].contains(event.target)) {
                    return;
                }

                const currentMouseX = event.offsetX;
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
                    if (oldestImageEntry && oldestImageEntry.img.parentNode === footerElement) {
                        if (oldestImageEntry.timeline) oldestImageEntry.timeline.kill();
                        gsap.to(oldestImageEntry.img, {
                            opacity: 0, scale: 0.1, duration: 0.25, ease: 'power1.in',
                            onComplete: () => {
                                if (oldestImageEntry.img.parentNode === footerElement) oldestImageEntry.img.remove();
                            }
                        });
                    }
                }

                const img = document.createElement('img');
                img.classList.add('trail-image'); // Make sure .trail-image CSS is defined in global.css or index-page.css
                img.src = trailImageSources[currentImageIndex];
                currentImageIndex = (currentImageIndex + 1) % trailImageSources.length;
                footerElement.appendChild(img);

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
                        initialAppearX = currentMouseX - OFFSET_DISTANCE * 0.7071; // Approx 1/sqrt(2)
                        initialAppearY = currentMouseY - OFFSET_DISTANCE * 0.7071;
                    }
                } else {
                    initialAppearX = currentMouseX - OFFSET_DISTANCE * 0.7071;
                    initialAppearY = currentMouseY - OFFSET_DISTANCE * 0.7071;
                }

                const tl = gsap.timeline();
                tl.set(img, {
                    left: initialAppearX, top: initialAppearY, xPercent: -50, yPercent: -50,
                    transformOrigin: '50% 50%', opacity: 1, scale: 1,
                });
                tl.to(img, {
                    left: currentMouseX, top: currentMouseY, xPercent: -50, yPercent: -50,
                    opacity: 1, scale: 2.0, duration: 1, ease: 'expo.out',
                });
                tl.to(img, {
                    opacity: 0, scale: 0, duration: 0.6, delay: 0.2, ease: 'expo.in',
                    onComplete: () => {
                        if (img.parentNode === footerElement) img.remove();
                        const indexToRemove = activeTrailImages.findIndex(entry => entry.img === img);
                        if (indexToRemove > -1) activeTrailImages.splice(indexToRemove, 1);
                    }
                });
                activeTrailImages.push({ img: img, timeline: tl });
            }

            footerElement.addEventListener('mouseenter', () => {
                console.log('[Index Effects] Mouse entered footer. Activating image trail.');
                lastImageAnchorX = null; lastImageAnchorY = null;
                footerElement.addEventListener('mousemove', createTrailImage);
            });

            footerElement.addEventListener('mouseleave', () => {
                console.log('[Index Effects] Mouse left footer. Deactivating image trail.');
                footerElement.removeEventListener('mousemove', createTrailImage);
            });
            console.log('[Index Effects] Footer image trail initialized.');
        }
    } else {
        if (!footerElement) console.warn('[Index Effects] Footer element .main-footer not found for image trail.');
        if (!footerContentWrapper) console.warn('[Index Effects] .footer-content-wrapper not found. Trail exclusion setup skipped.');
    }
    // --- End of Footer Image Trail ---


    // --- Footer Text Animation (INDEX SPECIFIC - NEW) ---
    if (footerElement && footerContentWrapper) { // Re-check as they are primary for this too
        console.log('[Index Effects] Setting up Footer Text Animation.');

        const elementsToAnimate = [];
        const fCW = footerContentWrapper; // shorthand

        // Column 1: Newsletter
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(1) > h4')));
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(1) > p')));
        const formC1 = fCW.querySelector('.footer-column:nth-child(1) .newsletter-form');
        if (formC1) {
            const inputC1 = formC1.querySelector('input[type="email"]');
            const buttonC1 = formC1.querySelector('button[type="submit"]');
            if (inputC1) elementsToAnimate.push(inputC1);
            if (buttonC1) elementsToAnimate.push(buttonC1);
        }

        // Column 2: Explore
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(2) > h4')));
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(2) .footer-nav ul li')));

        // Column 3: Connect & Collaborators
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(3) > h4'))); // "Conecta"
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(3) .social-icons a')));
        const collabH4C3 = fCW.querySelector('.footer-column:nth-child(3) .collaborators-link > h4');
        if (collabH4C3) elementsToAnimate.push(collabH4C3); // "Colaboradores"
        const collabAC3 = fCW.querySelector('.footer-column:nth-child(3) .collaborators-link > a');
        if (collabAC3) elementsToAnimate.push(collabAC3);

        // Column 4: Info
        const logoC4 = fCW.querySelector('.footer-column:nth-child(4) .footer-logo');
        if (logoC4) elementsToAnimate.push(logoC4);
        elementsToAnimate.push(...Array.from(fCW.querySelectorAll('.footer-column:nth-child(4) > p')));

        const finalAnimatedElements = elementsToAnimate.filter(el => el); // Filter out any nulls

        if (finalAnimatedElements.length > 0) {
             // Set initial state for all elements before ScrollTrigger
            gsap.set(finalAnimatedElements, { opacity: 0, y: 30 });

            ScrollTrigger.create({
                trigger: footerElement,
                start: "top 65%",
                // markers: true, // Uncomment for debugging
                once: true,
                onEnter: () => {
                    gsap.to(finalAnimatedElements, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        stagger: 0.07,
                        overwrite: 'auto'
                    });
                }
            });
            console.log(`[Index Effects] Footer text animation ScrollTrigger created for ${finalAnimatedElements.length} elements.`);
        } else {
            console.warn('[Index Effects] No elements found or collected for footer text animation.');
        }
    } else {
        // Warnings for missing footerElement or footerContentWrapper for text animation handled by initial check.
        if (!footerContentWrapper && footerElement) console.warn('[Index Effects] .footer-content-wrapper not found. Footer text animation skipped.');
        else if (!footerElement) console.warn('[Index Effects] .main-footer not found. Footer text animation skipped.');

    }
    // --- End Footer Text Animation ---

});
// --- End of Index Page Specific Effects Section ---

// --- END OF FILE scroll-effects.js ---