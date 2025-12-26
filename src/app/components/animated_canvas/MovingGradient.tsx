"use client"; // This is required for React hooks (useRef, useEffect)


import React, {useEffect, useRef} from "react";


/**
 * MovingGradient Component
 * This component renders the animated orb effect onto a canvas.
 * It's designed to fill its parent container.
 */
export const MovingGradient = () => {
    // Add TypeScript type for the ref
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return; // Check if context is available

        let width: number, height: number;
        let animationFrameId: number;
        let time = 0;

        // This will hold our static noise pattern
        let noiseCanvas: HTMLCanvasElement | null = null;

        // --- Generates static noise ---
        // This function is called once (and on resize)
        function createStaticNoise(w: number, h: number) {
            noiseCanvas = document.createElement('canvas');
            if (!noiseCanvas) return;

            noiseCanvas.width = w;
            noiseCanvas.height = h;
            const noiseCtx = noiseCanvas.getContext('2d');
            if (!noiseCtx) return;

            try {
                const noiseImageData = noiseCtx.createImageData(w, h);
                const data = noiseImageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    // Create a random grayscale value
                    const noise = Math.random() * 40;
                    data[i] = noise;     // R
                    data[i + 1] = noise;   // G
                    data[i + 2] = noise;   // B
                    data[i + 3] = 15;      // Alpha (low opacity)
                }
                noiseCtx.putImageData(noiseImageData, 0, 0);
            } catch (e) {
                console.error("Could not create noise: ", e);
            }
        }


        // Resize the canvas
        function setup() {
            if (!canvas.parentElement) return;
            // Set canvas size to match its parent
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;

            // Re-generate the static noise for the new size
            createStaticNoise(width, height);
        }

        // The main animation loop
        function animate() {
            time++;
            if (!ctx) return;

            // --- 1. Draw Moving Gradient ---
            // Create a gradient that cycles through HSL colors
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            const hueOffset = time * .3; // Controls speed of color change
            // Using bright, saturated colors for the gradient
            gradient.addColorStop(0, `hsl(${(200 + hueOffset) % 360}, 100%, 70%)`);
            gradient.addColorStop(0.5, `hsl(${(250 + hueOffset) % 360}, 100%, 70%)`);
            gradient.addColorStop(1, `hsl(${(300 + hueOffset) % 360}, 100%, 70%)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // --- 2. Draw Interference Waves ---
            // Draw multiple, thin, translucent sine waves
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`; // Very subtle waves

            for (let i = 0; i < 10; i++) { // 10 waves
                ctx.beginPath();
                // Start each wave at a different vertical position
                let y = (height / 10) * i;
                ctx.moveTo(0, y);

                for (let x = 0; x < width; x++) {
                    // Combine two sine waves for a more complex interference
                    let wave = Math.sin(x * 0.01 + time * 0.005 + i * 0.2) * 5;
                    let interference = Math.sin(x * 0.02 + time * 0.003 + i * 0.3) * 5;
                    ctx.lineTo(x, y + wave + interference);
                }
                ctx.stroke();
            }

            // --- 3. Add Noise ---
            // Draw the pre-generated static noise canvas on top
            if (noiseCanvas) {
                ctx.drawImage(noiseCanvas, 0, 0);
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // --- Initialization ---
        setup();
        animate();

        // Re-run setup on window resize
        window.addEventListener('resize', setup);

        // Cleanup on component unmount
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', setup);
        };
    }, []); // Run only once on mount

    return (
        <canvas
            ref={canvasRef}
            // Positioned absolutely to fill the parent container
            className="absolute top-0 left-0 w-full h-full z-0"
        />
    );
};