import React, {useEffect, useRef} from "react";

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const trailer = trailerRef.current;

        const moveCursor = (e: MouseEvent) => {
            if (cursor && trailer) {
                cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

                // Slight delay for the trailer for fluid feel
                trailer.animate({
                    transform: `translate3d(${e.clientX - 20}px, ${e.clientY - 20}px, 0)`
                }, {
                    duration: 500,
                    fill: "forwards"
                });
            }
        };

        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    return (
        <>
            <div ref={cursorRef} className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block" />
            <div ref={trailerRef} className="fixed top-0 left-0 w-12 h-12 border border-white/30 rounded-full pointer-events-none z-[9998] mix-blend-difference hidden md:block transition-opacity duration-300" />
        </>
    );
};