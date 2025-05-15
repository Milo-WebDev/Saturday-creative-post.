// js/grid-animation.js
// --- LENIS INITIALIZATION REMOVED ---
// Assumes Lenis smooth scrolling is initialized globally elsewhere (e.g., in scroll-effects.js)

// Get the grid element
const grid = document.querySelector('.grid');
// Get all grid items within the grid (ensure grid exists before running)
const gridItems = grid ? grid.querySelectorAll('.grid__item') : [];

// --- initSmoothScrolling function REMOVED ---

// Function to apply scroll-triggered animations to grid items
const applyScrollAnimations = () => {
    if (!gridItems.length) {
        console.warn('Grid Animation: No grid items found.');
        return;
    }
    // Ensure GSAP and ScrollTrigger are loaded (ScrollTrigger update is handled globally)
     if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('Grid Animation: GSAP or ScrollTrigger is not loaded. Cannot apply animations.');
        return;
    }

	console.log('Grid Animation: Applying animations to', gridItems.length, 'items.'); // Added log

	gridItems.forEach((item) => {
		// Get the previous element sibling for the current item
		const previousElementSibling = item.previousElementSibling;
		// Determine if the current item is on the left side based on its position
        // Adding a small tolerance (+1) for rounding issues
		const isLeftSide = previousElementSibling && (item.offsetLeft + item.offsetWidth <= previousElementSibling.offsetLeft + 1);
		// Determine the origin for transformations
		const originX = isLeftSide ? 100 : 0;

		gsap.timeline({
			defaults: {
				ease: 'power4'
			},
			scrollTrigger: {
				trigger: item,
				start: 'top bottom-=15%', // Start animation when item bottom is 15% from viewport bottom
				end: '+=100%',          // End animation after scrolling 100% of trigger height past the start
				scrub: true             // Smoothly scrub animation based on scroll position
                // Optional: Add markers for debugging individual item triggers
                // markers: true,
			}
		})
		.fromTo(item.querySelector('.grid__item-img'), {
			scale: 0,
			transformOrigin: `${originX}% 0%`
		}, {
			scale: 1
		})
		.fromTo(item.querySelector('.grid__item-img-inner'), {
			scale: 5,
			transformOrigin: `${originX}% 0%`
		}, {
			scale: 1
		}, 0) // Run this animation concurrently with the previous one (at time 0)
		.fromTo(item.querySelector('.grid__item-caption'), {
			xPercent: isLeftSide ? 100 : -100, // Start off-screen
			opacity: 0
		}, {
			ease: 'power1', // Use a different ease for the caption
			xPercent: 0,    // Move to original position
			opacity: 1
		}, 0); // Also run this concurrently
	});
}

// Ensure dependencies (GSAP/ScrollTrigger already checked inside function) and images are loaded
if (typeof imagesLoaded !== 'undefined' && grid) {
    imagesLoaded(grid, { background: '.grid__item-img-inner' }, () => {
        // --- Lenis initialization REMOVED ---
        console.log('Grid Animation: Images loaded.');
        // Apply scroll-triggered animations
        applyScrollAnimations();
    });
} else {
    // Fallback or error handling if imagesLoaded or grid isn't available
    if (!grid) {
         console.error('Grid Animation: .grid element missing.');
    } else if (typeof imagesLoaded === 'undefined') {
         console.warn('Grid Animation: imagesLoaded library not found. Applying animations without preloading.');
         // Apply animations directly if grid exists but imagesLoaded doesn't
         applyScrollAnimations();
    } else {
        // Grid exists, but imagesLoaded check failed for another reason? Apply anyway.
        console.warn('Grid Animation: Applying animations (fallback).');
        applyScrollAnimations();
    }
}