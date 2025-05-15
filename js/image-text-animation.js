// js/image-text-animation.js

// Variable to store the Lenis smooth scrolling object
let lenis;

// Get all the image-text items
const imageTextItems = document.querySelectorAll('.image-text-item');

// Function to initialize Lenis for smooth scrolling
const initSmoothScrolling = () => {
    // Instantiate the Lenis object with specified properties
    lenis = new Lenis({
        lerp: 0.1, // Keep smoothening factor
        smoothWheel: true // Enables smooth scrolling for mouse wheel events
    });

    // Update ScrollTrigger each time the user scrolls
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
    } else {
        console.error('ScrollTrigger is not loaded.');
    }

    // Define a function to run at each animation frame
    const scrollFn = (time) => {
        lenis.raf(time); // Run Lenis' requestAnimationFrame method
        requestAnimationFrame(scrollFn); // Recursively call scrollFn on each frame
    };
    // Start the animation frame loop
    requestAnimationFrame(scrollFn);
};

// Function to apply scroll-triggered animations to image-text items
const applyImageTextAnimations = () => {
    if (!imageTextItems.length) {
        console.warn('No image-text items found for animation.');
        return;
    }
     if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger is not loaded. Cannot apply animations.');
        return;
    }

    imageTextItems.forEach((item) => {
        // Find the image and text elements within the current item
        const imageEl = item.querySelector('.item-image');
        const textEl = item.querySelector('.item-text');

        // Determine if the image is on the right side (item is :nth-child(even))
        const isImageRight = item.matches(':nth-child(even)');

        // --- Image Animation (Simplified) ---
        // Set transform origin based on image position for the reveal
        // If image is on the right (even item), reveal starts from left edge (0%)
        // If image is on the left (odd item), reveal starts from right edge (100%)
        const imageRevealOriginX = isImageRight ? '0%' : '100%';

        // Single tween for the horizontal reveal using scaleX
        gsap.from(imageEl, {
            scaleX: 0, // Start fully scaled down horizontally
            transformOrigin: `${imageRevealOriginX} 50%`, // Set origin edge and vertical center
            scrollTrigger: {
                trigger: item,
                start: 'top bottom-=15%', // Start slightly before item enters view
                end: 'center bottom-=10%', // End roughly when item center is near bottom
                scrub: 1.2,
                // markers: true, // Uncomment for debugging
            },
            ease: 'power2.out',
        });

        // --- Text Animation ---
        // Determine horizontal slide direction for text
        // If image is right (even item), text is left -> slide text from left (-50%)
        // If image is left (odd item), text is right -> slide text from right (50%)
        const textStartXPercent = isImageRight ? -50 : 50;

        gsap.from(textEl.children, { // Target children (h3, p) for staggered effect
            xPercent: textStartXPercent,
            opacity: 0,
            stagger: 0.1, // Add a small stagger between h3 and p
            scrollTrigger: {
                trigger: item,
                start: 'top bottom-=15%', // Match image start trigger
                end: 'center center+=10%',
                scrub: 1.5,
               // markers: true, // Uncomment for debugging
            },
            ease: 'power1.out',
            duration: 0.8 // Base duration for ease calculation with scrub
        });
    });
}

// --- Initialize ---
initSmoothScrolling();
applyImageTextAnimations();

console.log("Image-Text animations initialized (v2 - Fixed Squash).");