"use client";

import React, {useRef, useState} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";

// Define the shape of a single subtitle item
export interface SubtitleItem {
    id: number;
    original: string;
    translation: string;
    startTime: number;
    endTime: number;
}

interface SubtitleRotatorProps {
    subtitles: SubtitleItem[];
    // Must accept null initially while the parent component renders
    videoElement: HTMLVideoElement | null;
    className?: string;
    originalTextClass?: string;
    translationTextClass?: string;
}

export default function SubtitleRotator({
                                            ref,
                                            subtitles,
                                            videoElement,
                                            className = "",
                                            originalTextClass = "text-xl font-bold text-white",
                                            translationTextClass = "text-lg text-yellow-400 italic",
                                        }: SubtitleRotatorProps) {
    const [activeSubtitle, setActiveSubtitle] = useState<SubtitleItem | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. SYNC LOGIC: Listen to video time updates
    useGSAP(() => {
        // If video element isn't ready, stop.
        if (!videoElement) return;

        // CONFIG: How many seconds EARLY should the animation start?
        // 0.25s allows the fade-in to happen *during* the silence before the line starts.
        const LEAD_TIME = 0.25;

        const checkTime = () => {
            const currentTime = videoElement.currentTime;

            const match = subtitles.find((sub) => {
                // Shift the start window back by the lead time
                const startWindow = sub.startTime - LEAD_TIME;
                const endWindow = sub.endTime;

                return currentTime >= startWindow && currentTime <= endWindow;
            });

            // Only update state if the match is different (prevents infinite re-renders)
            setActiveSubtitle((prev) => (prev?.id === match?.id ? prev : match || null));
        };

        // Use GSAP ticker for high-performance updates (smoother than timeupdate event)
        gsap.ticker.add(checkTime);

        // Cleanup listener when component unmounts
        return () => gsap.ticker.remove(checkTime);
    }, {dependencies: [subtitles, videoElement]});


    // 2. ANIMATION LOGIC: React to activeSubtitle changing
    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline();

        // A. Animate IN (New Subtitle)
        if (activeSubtitle) {
            tl.fromTo(
                containerRef.current.children,
                {
                    y: 15, // Reduced movement distance for snappier feel
                    opacity: 0,
                    filter: "blur(4px)"
                },
                {
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 0.25, // Faster duration (was 0.5)
                    stagger: 0.05,  // Tighter stagger
                    ease: "power2.out",
                    overwrite: "auto", // Important: Stop 'exit' animation instantly
                }
            );
        }
        // B. Animate OUT (Silence/Gap)
        else {
            tl.to(containerRef.current.children, {
                y: -10,
                opacity: 0,
                filter: "blur(4px)",
                duration: 0.2, // Fast exit
                stagger: 0.05,
                ease: "power2.in",
                overwrite: "auto",
            });
        }
    }, {scope: containerRef, dependencies: [activeSubtitle]});

    return (
        <div
            className={`flex flex-col items-center justify-center min-h-[100px] overflow-hidden pointer-events-none ${className}`} ref={ref}>
            <div ref={containerRef} className="flex flex-col items-center text-center">

                {/* Original Text */}
                <div className={`block ${originalTextClass}`}>
                    {activeSubtitle?.original || ""}
                </div>

                {/* Translation Text */}
                <div className={`block mt-2 ${translationTextClass}`}>
                    {activeSubtitle?.translation || ""}
                </div>

            </div>
        </div>
    );
}