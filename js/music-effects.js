// --- START OF FILE music-effects.js ---
// Contains effects specific ONLY to the music.html page (Grid Animation + Specific Parallax)

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Music Effects] DOMContentLoaded');

    // Ensure GSAP and ScrollTrigger are loaded
    if (window.gsap && window.ScrollTrigger) {
        console.log('[Music Effects] GSAP & ScrollTrigger found.');

        // --- Parallax effect for page container background (MUSIC VERSION) ---
        // Using the scrub: 0.5 version as requested for music.html
        const musicPageContainer = document.querySelector('.page-container');
        if (musicPageContainer) {
            gsap.to(musicPageContainer, {
                '--parallax-offset-y': '2700px', // Value from original example
                ease: 'none',
                scrollTrigger: {
                    trigger: musicPageContainer,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0 // The requested scrub value for music page
                }
            });
            console.log('[Music Effects] Parallax for .page-container initialized (scrub: 0.5).');
        } else {
             console.warn('[Music Effects] .page-container not found for parallax.');
        }


        // --- Animated Grid Logic (Moved from grid-animation.js) ---
        const grid = document.querySelector('.grid');
        if (grid) {
            const gridItems = grid.querySelectorAll('.grid__item');

            const applyScrollAnimations = () => {
                if (!gridItems.length) {
                    console.warn('[Music Effects] Grid Animation: No grid items found.');
                    return;
                }

                console.log('[Music Effects] Grid Animation: Applying animations to', gridItems.length, 'items.');

                gridItems.forEach((item) => {
                    const previousElementSibling = item.previousElementSibling;
                    const isLeftSide = previousElementSibling && (item.offsetLeft + item.offsetWidth <= previousElementSibling.offsetLeft + 1);
                    const originX = isLeftSide ? 100 : 0;

                    gsap.timeline({
                        defaults: { ease: 'power4' },
                        scrollTrigger: {
                            trigger: item,
                            start: 'top bottom-=15%',
                            end: '+=100%',
                            scrub: true
                            // markers: true // Optional debugging
                        }
                    })
                    .fromTo(item.querySelector('.grid__item-img'), {
                        scale: 0,
                        transformOrigin: `${originX}% 0%`
                    }, { scale: 1 })
                    .fromTo(item.querySelector('.grid__item-img-inner'), {
                        scale: 5,
                        transformOrigin: `${originX}% 0%`
                    }, { scale: 1 }, 0)
                    .fromTo(item.querySelector('.grid__item-caption'), {
                        xPercent: isLeftSide ? 100 : -100,
                        opacity: 0
                    }, {
                        ease: 'power1',
                        xPercent: 0,
                        opacity: 1
                    }, 0);
                });
            };

            // Check for imagesLoaded library (essential for grid timing)
            if (typeof imagesLoaded !== 'undefined') {
                console.log('[Music Effects] Grid Animation: imagesLoaded found. Waiting for images...');
                imagesLoaded(grid, { background: '.grid__item-img-inner' }, () => {
                    console.log('[Music Effects] Grid Animation: Images loaded.');
                    applyScrollAnimations();
                });
            } else {
                console.warn('[Music Effects] Grid Animation: imagesLoaded library not found! Animations might start before images are ready.');
                // Apply animations anyway, might be slightly janky if images load late
                 applyScrollAnimations();
            }

        } else {
            console.log('[Music Effects] .grid element not found. Grid animations not applied.');
        }


    } else {
        console.warn('[Music Effects] GSAP or ScrollTrigger not found. Music-specific effects disabled.');
    }
});
// --- END OF FILE music-effects.js ---