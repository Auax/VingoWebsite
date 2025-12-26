// components/AnimatedGrainBackground.tsx

import React, { useRef, useEffect } from 'react';

interface GrainProps {
    /** The maximum brightness of the grain (0-255). Lower is more subtle. Default: 40 */
    intensity?: number;
}

const AnimatedGrainBackground: React.FC<GrainProps> = ({
                                                           intensity = 40,
                                                       }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const drawNoise = () => {
            const { width, height } = canvas;
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const grain = (Math.random() * intensity) | 0;

                data[i] = grain;
                data[i + 1] = grain;
                data[i + 2] = grain;
                data[i + 3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);
            animationFrameRef.current = requestAnimationFrame(drawNoise);
        };

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            canvas.width = width;
            canvas.height = height;
        });

        resizeObserver.observe(canvas);
        animationFrameRef.current = requestAnimationFrame(drawNoise);

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            resizeObserver.disconnect();
        };
    }, [intensity]);

    // Tailwind classes for the canvas:
    // absolute inset-0 w-full h-full
    // z-10 (Top layer, above z-0)
    // opacity-50 (Reduced opacity to see the clouds underneath)
    // pointer-events-none
    const tailwindClasses = "absolute inset-0 w-full h-full z-1 opacity-50 pointer-events-none";

    return <canvas ref={canvasRef} className={tailwindClasses} />;
};

export default AnimatedGrainBackground;