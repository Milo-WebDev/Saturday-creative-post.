// --- START OF FILE script.js ---

document.addEventListener('DOMContentLoaded', () => {

    const triggerWords = document.querySelectorAll('.main-text .trigger-word');
    const h1Element = document.querySelector('.main-text h1');
    const imageContainer = document.getElementById('hover-image-container');

    // --- Configuration ---
    const categoryImages = {
        arte: [
            'imagenes/hero/arte/bro1.jpeg', 'imagenes/hero/arte/bro5.jpg', 'imagenes/hero/arte/bro2.jpg',
            'imagenes/hero/arte/bro4.jpg', 'imagenes/hero/arte/bro3.jpg',
        ],
        diseno: [
            'imagenes/hero/diseño/dsgn (1).webp', 'imagenes/hero/diseño/dsgn (2).webp', 'imagenes/hero/diseño/dsgn (3).webp',
            'imagenes/hero/diseño/dsgn (4).webp', 'imagenes/hero/diseño/dsgn (5).webp', 'imagenes/hero/diseño/dsgn (6).webp',
            'imagenes/hero/diseño/dsgn (7).webp', 'imagenes/hero/diseño/dsgn (8).webp', 'imagenes/hero/diseño/dsgn (9).webp',
            'imagenes/hero/diseño/dsgn (10).webp', 'imagenes/hero/diseño/dsgn (11).webp', 'imagenes/hero/diseño/dsgn (12).webp',
        ],
        musica: [
            'imagenes/hero/musica/musik (1).webp', 'imagenes/hero/musica/musik (1).png', 'imagenes/hero/musica/musik (2).png',
            'imagenes/hero/musica/musik (3).png', 'imagenes/hero/musica/musik (4).png', 'imagenes/hero/musica/musik (5).png',
            'imagenes/hero/musica/musik (6).png', 'imagenes/hero/musica/musik (7).png', 'imagenes/hero/musica/musik (8).png',
            'imagenes/hero/musica/musik (9).png', 'imagenes/hero/musica/musik (10).png', 'imagenes/hero/musica/musik (11).png',
        ],
        moda: [
            'imagenes/hero/moda/fashion1.jpg', 'imagenes/hero/moda/style2.jpg', 'imagenes/hero/moda/trend3.jpg',
        ],
        crisis: [
            'imagenes/hero/crisis/app-crash-rizvanov.gif',
        ]
    };

    const imageLoopInterval = 500; // Time in milliseconds between image changes
    const hideDelay = 0; // **NEW**: Delay in ms before hiding on mouseleave (adjust as needed)
    // ---------------------

    // --- Image Preloading Function ---
    function preloadImages(categories) {
        console.log("Preloading hover images...");
        let preloadedCount = 0;
        let totalImages = 0;
        for (const category in categories) {
            if (Object.hasOwnProperty.call(categories, category)) {
                const images = categories[category];
                totalImages += images.length;
                images.forEach(imageUrl => {
                    const img = new Image();
                    img.src = imageUrl;
                    img.onload = () => { preloadedCount++; if (preloadedCount === totalImages) console.log("All hover images preloading initiated."); };
                    img.onerror = () => { console.error(`Failed to preload: ${imageUrl}`); preloadedCount++; if (preloadedCount === totalImages) console.log("All hover images preloading initiated (with some errors)."); }
                });
            }
        }
         if (totalImages === 0) console.log("No images found to preload.");
    }
    preloadImages(categoryImages);
    // ---------------------------------

    let currentIntervalId = null;
    let currentImageIndex = 0;
    let hideTimeoutId = null; // **NEW**: To store the timeout ID for hiding

    // Function to start the image loop
    function startImageLoop(category) {
        // **NEW**: Clear any pending hide operations
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }

        const images = categoryImages[category];
        if (!images || images.length === 0) {
            console.warn(`No images found for category: ${category}`);
            imageContainer.style.backgroundImage = '';
            imageContainer.classList.add('is-visible');
            return;
        }

        if (currentIntervalId) {
            clearInterval(currentIntervalId);
        }

        // *** Optimization: Only reset index if container wasn't already visible? Or always reset for consistency?
        // Let's keep the reset for now, as the main issue is the hide/show flicker.
        currentImageIndex = 0;

        imageContainer.style.backgroundImage = `url('${images[currentImageIndex]}')`;
        imageContainer.classList.add('is-visible'); // Ensure it's visible

        currentIntervalId = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            imageContainer.style.backgroundImage = `url('${images[currentImageIndex]}')`;
        }, imageLoopInterval);
    }

    // Function to stop the image loop and hide container (remains mostly the same)
    function stopImageLoop() {
        if (currentIntervalId) {
            clearInterval(currentIntervalId);
            currentIntervalId = null;
        }
        imageContainer.classList.remove('is-visible');
    }


    // Add event listeners to each trigger word
    triggerWords.forEach(span => {
        span.addEventListener('mouseenter', () => {
            const category = span.dataset.category;

            // **NEW**: Clear any pending hide timeout when mouse enters
            if (hideTimeoutId) {
                clearTimeout(hideTimeoutId);
                hideTimeoutId = null;
            }

            h1Element.classList.add('h1-hover-active');
            span.classList.add('is-active');
            startImageLoop(category); // Call startImageLoop directly
        });

        span.addEventListener('mouseleave', () => {
            // **NEW**: Instead of calling stopImageLoop directly, schedule it
            // Clear any previously scheduled hide (shouldn't be necessary but safe)
            if (hideTimeoutId) {
                 clearTimeout(hideTimeoutId);
            }

            // Remove text styling immediately
            span.classList.remove('is-active');
            h1Element.classList.remove('h1-hover-active');

            // Schedule the hiding
            hideTimeoutId = setTimeout(() => {
                stopImageLoop();
                hideTimeoutId = null; // Clear the ID after execution
            }, hideDelay);
        });
    });

}); // End DOMContentLoaded
// --- END OF FILE script.js ---