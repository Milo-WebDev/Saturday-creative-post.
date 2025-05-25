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

    const imageLoopInterval = 500;
    const hideDelay = 0;
    // ---------------------

    // --- State Variables ---
    let currentIntervalId = null;
    let currentImageIndex = 0;
    let hideTimeoutId = null;
    let currentVisibleImageElement = null; // To keep track of the currently shown <img>
    let imagesForCurrentCategory = []; // Cache image elements for the active category
    // ---------------------

    // --- Create Image Elements Function ---
    function createHoverImageElements(categories, container) {
        console.log("Creating hover image elements...");
        let createdCount = 0;
        let totalToCreate = 0;

        for (const category in categories) {
            if (Object.hasOwnProperty.call(categories, category)) {
                const images = categories[category];
                totalToCreate += images.length;
                images.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = `Hover image for ${category}`; // Alt text for accessibility
                    img.classList.add('hover-effect-image');
                    img.dataset.category = category; // Store category for easy selection
                    // Styles are now primarily handled by CSS, but initial state can be here
                    // img.style.opacity = '0';
                    // img.style.visibility = 'hidden';
                    container.appendChild(img);
                    img.onload = () => { createdCount++; if (createdCount === totalToCreate) console.log("All hover image elements created and loaded (or initiated loading)."); };
                    img.onerror = () => { console.error(`Failed to load: ${imageUrl}`); createdCount++; if (createdCount === totalToCreate) console.log("All hover image elements created (with some loading errors)."); }
                });
            }
        }
        if (totalToCreate === 0) console.log("No images found to create elements for.");
    }
    // --- Call Image Element Creation ---
    if (imageContainer) {
        createHoverImageElements(categoryImages, imageContainer);
    } else {
        console.error("#hover-image-container not found!");
    }
    // ---------------------------------


    // Function to start the image loop
    function startImageLoop(category) {
        if (hideTimeoutId) {
            clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }

        imagesForCurrentCategory = Array.from(imageContainer.querySelectorAll(`.hover-effect-image[data-category="${category}"]`));

        if (!imagesForCurrentCategory || imagesForCurrentCategory.length === 0) {
            console.warn(`No images found for category: ${category}`);
            imageContainer.classList.remove('is-visible'); // Hide container if no images
            return;
        }
        
        imageContainer.classList.add('is-visible'); // Make the main container visible

        if (currentIntervalId) {
            clearInterval(currentIntervalId);
        }
        if (currentVisibleImageElement) {
            currentVisibleImageElement.classList.remove('active-img');
        }

        currentImageIndex = 0;
        currentVisibleImageElement = imagesForCurrentCategory[currentImageIndex];
        currentVisibleImageElement.classList.add('active-img');

        currentIntervalId = setInterval(() => {
            if (currentVisibleImageElement) {
                currentVisibleImageElement.classList.remove('active-img');
            }
            currentImageIndex = (currentImageIndex + 1) % imagesForCurrentCategory.length;
            currentVisibleImageElement = imagesForCurrentCategory[currentImageIndex];
            if (currentVisibleImageElement) {
                currentVisibleImageElement.classList.add('active-img');
            } else {
                // Should not happen if imagesForCurrentCategory is populated
                console.error("Error: currentVisibleImageElement became null during interval.");
                clearInterval(currentIntervalId);
            }
        }, imageLoopInterval);
    }

    // Function to stop the image loop and hide container
    function stopImageLoop() {
        if (currentIntervalId) {
            clearInterval(currentIntervalId);
            currentIntervalId = null;
        }
        if (currentVisibleImageElement) {
            currentVisibleImageElement.classList.remove('active-img');
            currentVisibleImageElement = null;
        }
        imageContainer.classList.remove('is-visible');
        imagesForCurrentCategory = []; // Clear the cached list
    }

    // Add event listeners to each trigger word
    triggerWords.forEach(span => {
        span.addEventListener('mouseenter', () => {
            const category = span.dataset.category;

            if (hideTimeoutId) {
                clearTimeout(hideTimeoutId);
                hideTimeoutId = null;
            }

            h1Element.classList.add('h1-hover-active');
            span.classList.add('is-active');
            startImageLoop(category);
        });

        span.addEventListener('mouseleave', () => {
            if (hideTimeoutId) {
                 clearTimeout(hideTimeoutId);
            }

            span.classList.remove('is-active');
            h1Element.classList.remove('h1-hover-active');

            hideTimeoutId = setTimeout(() => {
                stopImageLoop();
                hideTimeoutId = null;
            }, hideDelay);
        });
    });

}); // End DOMContentLoaded
// --- END OF FILE script.js ---