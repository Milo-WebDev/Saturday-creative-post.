// --- START OF FILE js/custom-cursor.js ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') {
        console.error('GSAP not found. Custom cursor will not function.');
        return;
    }

    // --- Configuration ---
    const CURSOR_SQUARE_SIZE_INITIAL = 15;
    const CURSOR_PADDING_HORIZONTAL = 2; // This is the CSS padding on each side
    const CURSOR_BORDER_WIDTH = 1;       // CSS border on each side
    const CURSOR_BORDER_COLOR = '#1F1F1F';
    const CURSOR_BACKGROUND_COLOR = '#FFFFFF';
    const CURSOR_TEXT_COLOR = '#1F1F1F';
    const CURSOR_FONT_FAMILY = '"FreightTextPro"';
    const CURSOR_FONT_SIZE = '12px';
    const CURSOR_FONT_WEIGHT = '600';

    const CURSOR_FOLLOW_SPEED_LERP_FACTOR = 0.3;
    const CURSOR_OFFSET_X = 12;
    const CURSOR_OFFSET_Y = 16;

    const WIDEN_HOVER_ELEMENT_SELECTORS = 'a, button, input[type="submit"], input[type="button"], .trigger-word';
    const DEFAULT_WIDEN_MESSAGE = "Leamos un poco";

    const EXPAND_DURATION = 0.4;
    const EXPAND_EASE = "expo.out";
    const COLLAPSE_DURATION = 0.35;
    const COLLAPSE_EASE = "expo.inOut";
    const AT_SYMBOL_REVEAL_DURATION = 0.2;
    const AT_SYMBOL_REVEAL_EASE = "power1.out";
    const WORD_REVEAL_STAGGER = 0.05;
    const EDGE_DETECTION_PADDING = 10; // Buffer from viewport edge
    // --- End Configuration ---

    console.log("Custom Cursor Script: Initializing...");

    document.body.style.cursor = 'default';

    const customCursor = document.createElement('div');
    const cursorTextContainer = document.createElement('div');

    gsap.set(customCursor, {
        position: 'fixed',
        height: CURSOR_SQUARE_SIZE_INITIAL,
        width: CURSOR_SQUARE_SIZE_INITIAL, // This width includes padding and border due to box-sizing
        backgroundColor: CURSOR_BACKGROUND_COLOR,
        border: `${CURSOR_BORDER_WIDTH}px solid ${CURSOR_BORDER_COLOR}`,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: `${CURSOR_PADDING_HORIZONTAL}px`,
        paddingRight: `${CURSOR_PADDING_HORIZONTAL}px`,
        boxSizing: 'border-box', // Crucial for width calculation
        opacity: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        x: -200, y: -200
    });

    gsap.set(cursorTextContainer, {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        // No explicit width needed here, it will be constrained by customCursor's content box
    });

    customCursor.appendChild(cursorTextContainer);
    document.body.appendChild(customCursor);
    console.log("Custom Cursor Script: Cursor elements appended to body.");

    let atSpanInstance = null;
    let mouseX = 0, mouseY = 0;
    let cursorVisualX = -200, cursorVisualY = -200; // Top-left of the customCursor div
    let isVisible = false;
    let currentHoverTarget = null;
    let activeTimeline = null;
    let isAnimating = false;

    function displayAtSymbol(animateIn = false, forceClear = true) {
        if (forceClear) cursorTextContainer.innerHTML = '';
        atSpanInstance = document.createElement('span');
        atSpanInstance.textContent = '@';
        const initialY = animateIn ? '5px' : 0;
        const initialOpacity = animateIn ? 0 : (isVisible ? 1 : 0);
        gsap.set(atSpanInstance, {
            fontFamily: CURSOR_FONT_FAMILY, fontSize: CURSOR_FONT_SIZE, fontWeight: CURSOR_FONT_WEIGHT,
            color: CURSOR_TEXT_COLOR, lineHeight: '1', y: initialY, opacity: initialOpacity,
        });
        if (forceClear || !cursorTextContainer.hasChildNodes()) {
            cursorTextContainer.appendChild(atSpanInstance);
        }
        if (animateIn && isVisible) {
            gsap.to(atSpanInstance, { opacity: 1, y: 0, duration: AT_SYMBOL_REVEAL_DURATION, ease: AT_SYMBOL_REVEAL_EASE, delay: 0.05 });
        }
    }
    displayAtSymbol(false);
    if (atSpanInstance) gsap.set(atSpanInstance, { opacity: 0 });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (!isVisible) {
            gsap.to(customCursor, { opacity: 1, duration: 0.2 });
            if (atSpanInstance && parseFloat(gsap.getProperty(atSpanInstance, "opacity")) === 0) {
                gsap.to(atSpanInstance, { opacity: 1, y: 0, duration: AT_SYMBOL_REVEAL_DURATION, ease: AT_SYMBOL_REVEAL_EASE });
            }
            isVisible = true;
            if (cursorVisualX === -200 && cursorVisualY === -200) {
                cursorVisualX = mouseX + CURSOR_OFFSET_X;
                cursorVisualY = mouseY + CURSOR_OFFSET_Y;
                gsap.set(customCursor, { x: cursorVisualX, y: cursorVisualY });
            }
        }
    });

    gsap.ticker.add(() => {
        if (isVisible) {
            const targetVisualX = mouseX + CURSOR_OFFSET_X;
            const targetVisualY = mouseY + CURSOR_OFFSET_Y;
            const dx = targetVisualX - cursorVisualX;
            const dy = targetVisualY - cursorVisualY;
            cursorVisualX += dx * CURSOR_FOLLOW_SPEED_LERP_FACTOR;
            cursorVisualY += dy * CURSOR_FOLLOW_SPEED_LERP_FACTOR;
            gsap.set(customCursor, { x: cursorVisualX, y: cursorVisualY });
        }
    });

    function createStyledSpansForDisplay(text) {
        // ... (this function remains the same)
        const words = text.split(/(\s+)/);
        const elements = [];
        words.forEach(wordText => {
            const isSpace = wordText.trim() === '';
            const span = document.createElement('span');
            span.innerHTML = isSpace ? ' '.repeat(wordText.length) : wordText;
            gsap.set(span, {
                display: 'inline-block', fontFamily: CURSOR_FONT_FAMILY, fontSize: CURSOR_FONT_SIZE,
                fontWeight: CURSOR_FONT_WEIGHT, color: CURSOR_TEXT_COLOR, lineHeight: '1',
                opacity: isSpace ? 1 : 0, y: isSpace ? 0 : '5px',
            });
            elements.push(span);
        });
        return elements;
    }

    function measureTextContentWidth(text) { // Renamed for clarity
        const tempContainer = document.createElement('div');
        // Important: tempContainer itself should not have padding/border for this measurement
        gsap.set(tempContainer, {
            position: 'absolute', visibility: 'hidden', left: '-9999px',
            display: 'flex', // So children spans line up
            padding: 0, border: 'none' // Ensure no extra space
        });
        document.body.appendChild(tempContainer);
        const measureSpans = createStyledSpansForDisplay(text);
        measureSpans.forEach(span => {
            gsap.set(span, { opacity: 1, y: 0 }); // Make sure fully rendered
            tempContainer.appendChild(span);
        });
        const width = tempContainer.offsetWidth; // This is the pure width of all text spans together
        document.body.removeChild(tempContainer);
        return width;
    }

    function handleMouseEnter(event) {
        const targetElement = event.target.closest(WIDEN_HOVER_ELEMENT_SELECTORS + ', [data-cursor-message]');
        if (targetElement && isVisible) {
            if (isAnimating && activeTimeline) activeTimeline.timeScale(3).progress(1);
            if (currentHoverTarget === targetElement && isAnimating && activeTimeline && !activeTimeline.reversed()) return;

            currentHoverTarget = targetElement;
            isAnimating = true;

            if (activeTimeline && activeTimeline.isActive()) activeTimeline.kill();
            activeTimeline = gsap.timeline({
                paused: true,
                onComplete: () => { isAnimating = false; },
                onKill: () => { isAnimating = false; }
            });

            const customMessage = targetElement.getAttribute('data-cursor-message') || DEFAULT_WIDEN_MESSAGE;

            if (atSpanInstance) {
                activeTimeline.to(atSpanInstance, { opacity: 0, duration: 0.05, ease: "none" }, 0);
            }

            const measuredTextContentWidth = measureTextContentWidth(customMessage);
            // newCursorTotalWidth is the final visual width including padding and border
            const newCursorTotalWidth = measuredTextContentWidth + (CURSOR_PADDING_HORIZONTAL * 2) + (CURSOR_BORDER_WIDTH * 2);

            let finalXPosition = cursorVisualX; // The current X of the cursor's top-left
            const potentialRightEdgeIfNoShift = finalXPosition + newCursorTotalWidth;
            const viewportWidth = window.innerWidth;

            if (potentialRightEdgeIfNoShift > viewportWidth - EDGE_DETECTION_PADDING) {
                // It would overflow. Calculate new X so right edge aligns.
                finalXPosition = viewportWidth - newCursorTotalWidth - EDGE_DETECTION_PADDING;
            }

            // Animate X position if it needs to shift due to edge detection
            // This tween will be for the 'x' property of customCursor
            if (Math.abs(finalXPosition - cursorVisualX) > 1) { // Only animate if significant shift
                activeTimeline.to(customCursor, {
                    x: finalXPosition,
                    duration: EXPAND_DURATION * 0.4, // Shift a bit faster than full expand
                    ease: EXPAND_EASE
                }, 0); // Start X shift at the beginning of the timeline
            }

            // Animate width to the new total width
            // Since box-sizing is border-box, this 'width' includes padding and border
            activeTimeline.to(customCursor, {
                width: newCursorTotalWidth,
                duration: EXPAND_DURATION,
                ease: EXPAND_EASE
            }, 0); // Start width animation also at the beginning

            activeTimeline.call(() => {
                cursorTextContainer.innerHTML = '';
                const liveWordSpansElements = createStyledSpansForDisplay(customMessage);
                const spansToAnimate = [];
                liveWordSpansElements.forEach(el => {
                    cursorTextContainer.appendChild(el);
                    if (el.textContent.trim() !== '') spansToAnimate.push(el);
                });

                if (spansToAnimate.length > 0) {
                    // This word animation needs to be part of the same timeline
                    // to be properly managed (killed, reversed etc.)
                    activeTimeline.to(spansToAnimate, {
                        opacity: 1,
                        y: 0,
                        duration: EXPAND_DURATION * 0.7,
                        stagger: WORD_REVEAL_STAGGER,
                        ease: EXPAND_EASE
                    }, `-=${EXPAND_DURATION * 0.7}`); // Overlap with width animation, adjust as needed
                }
            }, [], EXPAND_DURATION * 0.15); // Delay population slightly

            activeTimeline.play();
        }
    }

    function handleMouseLeave(event) {
        const targetElement = event.target.closest(WIDEN_HOVER_ELEMENT_SELECTORS + ', [data-cursor-message]');
        if (targetElement && targetElement === currentHoverTarget && isVisible) {
            if (isAnimating && activeTimeline) activeTimeline.timeScale(3).progress(1);
            if (currentHoverTarget === null && isAnimating && activeTimeline && activeTimeline.reversed()) return;

            isAnimating = true;
            if (activeTimeline && activeTimeline.isActive()) activeTimeline.kill();
            activeTimeline = gsap.timeline({
                paused: true,
                onComplete: () => {
                    displayAtSymbol(true, true);
                    isAnimating = false;
                },
                onKill: () => {
                    displayAtSymbol(false, true);
                    gsap.set(customCursor, { width: CURSOR_SQUARE_SIZE_INITIAL });
                    isAnimating = false;
                }
            });

            const currentWords = Array.from(cursorTextContainer.children)
                .filter(el => el !== atSpanInstance && el.textContent.trim() !== '');

            if (currentWords.length > 0) {
                activeTimeline.to(currentWords, {
                    opacity: 0, y: '5px', duration: COLLAPSE_DURATION * 0.6,
                    stagger: { each: WORD_REVEAL_STAGGER * 0.4, from: "end" },
                    ease: COLLAPSE_EASE.replace('Out', 'In')
                }, 0);
            }

            // When collapsing, the x position should naturally follow the mouse via the ticker.
            // We only animate the width back.
            activeTimeline.to(customCursor, {
                width: CURSOR_SQUARE_SIZE_INITIAL,
                // No 'x' animation here, let the ticker handle repositioning smoothly
                duration: COLLAPSE_DURATION,
                ease: COLLAPSE_EASE
            }, currentWords.length > 0 ? 0.05 : 0);

            activeTimeline.play();
            currentHoverTarget = null;
        }
    }

    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    document.body.addEventListener('mouseleave', () => {
        if (isVisible) {
            if (activeTimeline && activeTimeline.isActive()) activeTimeline.kill();
            gsap.to(customCursor, {
                opacity: 0, duration: 0.2, onComplete: () => { isVisible = false; }
            });
            gsap.set(customCursor, { width: CURSOR_SQUARE_SIZE_INITIAL, x: -200, y: -200 });
            displayAtSymbol(false, true);
            if (atSpanInstance) gsap.set(atSpanInstance, { opacity: 0 });
            currentHoverTarget = null;
            isAnimating = false;
        }
    });
    console.log('Custom square cursor (GSAP v14 - edge detection refined) initialized.');
});
// --- END OF FILE js/custom-cursor.js ---