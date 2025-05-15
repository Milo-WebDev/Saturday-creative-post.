// --- START OF FILE index-effects.js ---
// Contains effects specific ONLY to the index.html page

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Index Effects] DOMContentLoaded');

    // Ensure GSAP and ScrollTrigger are loaded (they should be, by global-effects.js)
    if (window.gsap && window.ScrollTrigger) {
        console.log('[Index Effects] GSAP & ScrollTrigger found.');

        // --- Parallax effect for page container background (INDEX VERSION) ---
        // Assuming the index page *might* have a different parallax need or intensity
        // NOTE: This targets .page-container, same as the music one. Ensure CSS handles distinct backgrounds if needed.
        const indexPageContainer = document.querySelector('.page-container');
        if (indexPageContainer) {
             // Let's use the original scrub: 0 for index, assuming that was intended.
             // If you want NO parallax on index, simply remove this block.
            gsap.to(indexPageContainer, {
                '--parallax-offset-y': '2000px', // Maybe a different value for index?
                ease: 'none',
                scrollTrigger: {
                    trigger: indexPageContainer,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0 // Original value from initial file
                }
            });
            console.log('[Index Effects] Parallax for .page-container initialized (scrub: 0).');
        } else {
            // This shouldn't happen if the HTML structure is consistent, but good practice
             console.warn('[Index Effects] .page-container not found for parallax.');
        }

        // --- Staggered Animation for Section One (INDEX ONLY) ---
        const sectionOne = document.querySelector('#section-one');
        if (sectionOne) {
            const title = sectionOne.querySelector('.section-one-title');
            const images = gsap.utils.toArray(sectionOne.querySelectorAll('.image-grid img'));
            const paragraphs = gsap.utils.toArray(sectionOne.querySelectorAll('.text-content p'));
            const link = sectionOne.querySelector('.leer-post-link');

            let titleWords = [];
            if (title) {
                const originalText = title.innerText;
                title.innerHTML = originalText.split(/\s+/).map(word => `<span class="word-span" style="display: inline-block; will-change: transform, opacity;">${word}</span>`).join(' ');
                titleWords = title.querySelectorAll('.word-span');
                // Add will-change for performance hint
                images.forEach(img => img.style.willChange = 'transform, opacity');
                paragraphs.forEach(p => p.style.willChange = 'transform, opacity');
                if(link) link.style.willChange = 'transform, opacity';
            } else {
                console.warn('[Index Effects] Section One Title (.section-one-title) not found.');
            }

            // Set Initial States
            gsap.set([titleWords, images, paragraphs, link].filter(Boolean), {autoAlpha: 0}); // Filter out nulls
            if (titleWords.length > 0) gsap.set(titleWords, { y: 30 });
            if (images.length > 0) gsap.set(images, { scale: 0.9 });
            if (paragraphs.length > 0) gsap.set(paragraphs, { y: 20 });
            if (link) gsap.set(link, { y: 20 });

            // Create the Animation Timeline
            const tlSectionOne = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionOne,
                    start: 'top 70%', // When top of section hits 70% down the viewport
                    once: true,      // Play only once
                    // markers: true, // For debugging
                },
                defaults: { duration: 0.6, ease: 'power1.out' }
            });

            // Add animations (check if elements exist before adding)
            if (titleWords.length > 0) { tlSectionOne.to(titleWords, { autoAlpha: 1, y: 0, stagger: 0.08 }); }
            if (images.length > 0) { tlSectionOne.to(images, { autoAlpha: 1, scale: 1, stagger: 0.05 }, "-=0.4"); }
            if (paragraphs.length > 0) { tlSectionOne.to(paragraphs, { autoAlpha: 1, y: 0, stagger: 0.1 }, "<"); } // "<" starts with previous animation
            if (link) { tlSectionOne.to(link, { autoAlpha: 1, y: 0 }, "-=0.3"); }

            console.log('[Index Effects] Section One staggered animation timeline created.');
        } else {
            // Only log warning if on index.html potentially missing #section-one
            // Could add a check: if (document.body.id === 'index-page-body') { ... }
            console.log('[Index Effects] #section-one not found. Staggered animation not applied.');
        }

        // --- Scroll Parallax for Hero Grid/Hover Image (INDEX ONLY) ---
        const heroParallaxImages = document.querySelectorAll(".background-grid-image, #hover-image-container");
        const heroSection = document.querySelector('.hero-section');

        if (heroParallaxImages.length > 0 && heroSection) {
             gsap.to(heroParallaxImages, {
                 yPercent: -15, // Move up 15% of their height
                 ease: "none",
                 scrollTrigger: {
                     trigger: heroSection,
                     start: "top top", // When hero top hits viewport top
                     end: "bottom top", // When hero bottom hits viewport top
                     scrub: true,      // Smooth scrubbing tied to scroll
                 }
             });
             console.log('[Index Effects] Hero parallax effect applied to specific images.');
        } else {
             if (!heroSection) console.warn('[Index Effects] .hero-section not found for hero parallax.');
             if (heroParallaxImages.length === 0) console.warn('[Index Effects] No .background-grid-image or #hover-image-container found for hero parallax.');
        }

        // --- Section Two Animations (INDEX ONLY) ---
        const sectionTwo = document.querySelector('#section-two');
        if (sectionTwo) {
            // --- Entrance Animation ---
            const topMarqueeContainer = sectionTwo.querySelector('.marquee-top');
            const imageSwitcher = sectionTwo.querySelector('.image-switcher');
            const bottomMarqueeContainer = sectionTwo.querySelector('.marquee-bottom');
            const link2 = sectionTwo.querySelector('.leer-post-link-2');
            const sectionTwoElements = [topMarqueeContainer, imageSwitcher, bottomMarqueeContainer, link2].filter(el => el !== null);

            if (sectionTwoElements.length > 0) {
                sectionTwoElements.forEach(el => { el.style.willChange = 'transform, opacity'; });
                gsap.set(sectionTwoElements, { autoAlpha: 0 });
                gsap.set([topMarqueeContainer, bottomMarqueeContainer, link2].filter(Boolean), { y: 25 });
                if (imageSwitcher) gsap.set(imageSwitcher, { scale: 0.9 });

                const tlEntranceSectionTwo = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionTwo,
                        start: 'top 75%',
                        once: true,
                        // markers: true,
                    },
                    defaults: { duration: 0.65, ease: 'power1.out' }
                });

                if (topMarqueeContainer) tlEntranceSectionTwo.to(topMarqueeContainer, { autoAlpha: 1, y: 0 }, 0);
                if (imageSwitcher) tlEntranceSectionTwo.to(imageSwitcher, { autoAlpha: 1, scale: 1 }, 0.1);
                if (bottomMarqueeContainer) tlEntranceSectionTwo.to(bottomMarqueeContainer, { autoAlpha: 1, y: 0 }, 0.2);
                if (link2) tlEntranceSectionTwo.to(link2, { autoAlpha: 1, y: 0 }, 0.3);

                console.log('[Index Effects] Section Two entrance animation timeline created.');
            } else {
                console.warn('[Index Effects] Could not find necessary elements for Section Two entrance animation.');
            }

            // --- Marquee Scroll ---
            const topMarqueeTrack = sectionTwo.querySelector('.marquee-track-top');
            const bottomMarqueeTrack = sectionTwo.querySelector('.marquee-track-bottom');
            if (topMarqueeTrack && bottomMarqueeTrack) {
                const marqueeMovePercent = -50; // Adjust as needed for seamless loop

                gsap.to(topMarqueeTrack, {
                    xPercent: marqueeMovePercent,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionTwo,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.5 // Smooth scrub
                    }
                });
                gsap.to(bottomMarqueeTrack, {
                    xPercent: -marqueeMovePercent, // Opposite direction
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionTwo,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.5
                    }
                });
                console.log('[Index Effects] Section Two marquee scroll animations initialized.');
            } else {
                if (!topMarqueeTrack) console.warn('[Index Effects] Section Two top marquee track (.marquee-track-top) not found.');
                if (!bottomMarqueeTrack) console.warn('[Index Effects] Section Two bottom marquee track (.marquee-track-bottom) not found.');
            }

            // --- Image Auto-Cycling ---
            const switchImages = gsap.utils.toArray(sectionTwo.querySelectorAll('.switch-image'));
            const totalImages = switchImages.length;
            let currentImageIndex = 0;

            if (totalImages > 0) {
                 // Ensure initial state is correct
                switchImages.forEach((img, index) => {
                    gsap.set(img, { display: index === 0 ? 'block' : 'none' });
                    if (index === 0) img.classList.add('active');
                    else img.classList.remove('active');
                });

                 if (totalImages > 1) {
                    const cycleInterval = 1000; // 1 second interval
                    setInterval(() => {
                        if (switchImages[currentImageIndex]) {
                            switchImages[currentImageIndex].classList.remove('active');
                            gsap.set(switchImages[currentImageIndex], { display: 'none' });
                        }
                        currentImageIndex = (currentImageIndex + 1) % totalImages;
                        if (switchImages[currentImageIndex]) {
                            switchImages[currentImageIndex].classList.add('active');
                            gsap.set(switchImages[currentImageIndex], { display: 'block' });
                        }
                    }, cycleInterval);
                    console.log('[Index Effects] Section Two image auto-cycling initialized.');
                 } else {
                    console.log('[Index Effects] Only one image found in Section Two switcher. Auto-cycling not started.');
                 }
            } else {
                console.warn('[Index Effects] Section Two image switcher found no images (.switch-image).');
            }
        } else {
             console.log('[Index Effects] #section-two not found. Section Two animations not applied.');
        }


    } else {
        console.warn('[Index Effects] GSAP or ScrollTrigger not found. Index-specific effects disabled.');
    }
});
// --- END OF FILE index-effects.js ---