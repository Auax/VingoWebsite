"use client";

import React, {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {clamp, interpolate, normalize} from "gsap/gsap-core";
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
import {useGSAP} from '@gsap/react';
import Lenis from 'lenis';
import {FaChevronDown} from "react-icons/fa6";
import Image from 'next/image';


import Navbar from "@/app/components/navbar/navbar";

import iphoneImg from "@/assets/iphone.png";
import TextRotator from "@/app/components/TextRotator";
import SubtitleRotator from "@/app/components/Subtitles/Subtitles";
import {subtitleData} from "@/app/components/Subtitles/SubtitleData";
import {FaApple} from "react-icons/fa";
import WaveCard from "@/app/components/card/waveCard";
import Card from "@/app/components/card/card";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);


// --- Home Component (Main Page) ---
export default function Home() {

    // 1. Setup Lenis Smooth Scroll
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // generic exponential ease
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Connect GSAP ScrollTrigger to Lenis
        // This ensures GSAP updates strictly with the Lenis scroll position
        /* @ts-ignore */
        lenis.on('scroll', ScrollTrigger.update)

        /* @ts-ignore */
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000)
        })

        gsap.ticker.lagSmoothing(0)

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf)
        };
    }, []);

    // Hero refs
    const heroRef = useRef(null);
    const heroTextsRef = useRef(null);
    const subtitlesRef = useRef(null);
    const phoneImageRef = useRef(null);
    const arrowRef = useRef(null);
    const phoneContainer = useRef(null);
    const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null);

    // Introduction refs
    const introSectionRef = useRef(null);
    const introBottomTextRef = useRef(null);
    const learnCardsRef = useRef(null);

    const ANIM_CONFIG = {
        // Breakpoints in pixels
        breakpoints: {
            xs: 0,
            sm: 640,
            md: 768, // tabletScreenBreakpointWidth
            lg: 1024
        },
        // Animation Length (Scroll distance in %)
        animEnd: {
            mobile: 80,  // Ends at +=80%
            desktop: 100 // Ends at +=100%
        },
        // Vertical Offsets (in px)
        // 0 = centered relative to the calculated baseline
        offsets: {
            xs: -100,
            sm: -100,
            md: -100,
            lg: 0
        }
    };

    useGSAP(() => {
        // Infinite loop: Start at natural position, move down, fade out.
        gsap.fromTo(
            arrowRef.current,
            {y: -5}, // Start slightly above, invisible
            {
                y: 0,       // End slightly below
                duration: 2,
                ease: "power2.out",
                repeat: -1,  // Infinite repeat

                // Keyframes allows us to fade IN then OUT
                keyframes: [
                    {opacity: 1, duration: 0.5}, // Fade in quickly at start
                    {opacity: 0, duration: 1.5, delay: 0.5} // Fade out slowly while moving down
                ]
            }
        );
    }, {scope: arrowRef});

    useGSAP(() => {
        if (!heroRef.current) return;

        /* TIMELINE 1 */
        const tl1 = gsap.timeline({
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                // Dynamic End: Check breakpoint to decide between 80% and 100%
                end: () => window.innerWidth < ANIM_CONFIG.breakpoints.md
                    ? `+=${ANIM_CONFIG.animEnd.mobile}%`
                    : `+=${ANIM_CONFIG.animEnd.desktop}%`,
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true, // Crucial for recalculating the 'end' and 'getTransform'
                markers: false,
            }
        });

        console.log(window.innerWidth < 768);

        tl1.fromTo(heroTextsRef.current, {
                autoAlpha: 1,
            },
            {
                autoAlpha: 0,
                duration: 2,
                ease: "power2.out",
            });


        const yEase = gsap.parseEase("power2.in");

        const getCurrentSettings = (width) => {
            // Determine which breakpoint is active (cascade logic)
            let activeBp = 'xs';
            // if (width >= ANIM_CONFIG.breakpoints.xl) activeBp = 'xl';
            if (width >= ANIM_CONFIG.breakpoints.lg) activeBp = 'lg';
            else if (width >= ANIM_CONFIG.breakpoints.md) activeBp = 'md';
            else if (width >= ANIM_CONFIG.breakpoints.sm) activeBp = 'sm';

            // Check if it counts as "mobile" (below md) for the animation duration logic
            const isMobile = width < ANIM_CONFIG.breakpoints.md;

            return {
                offset: ANIM_CONFIG.offsets[activeBp],
                animEnd: isMobile ? ANIM_CONFIG.animEnd.mobile : ANIM_CONFIG.animEnd.desktop,
                isMobile
            };
        };

        const getTransform = () => {
            const _default = {scale: 0.5, y: 0};
            if (!phoneImageRef.current) return _default;

            const screenWidth = window.innerWidth;
            const settings = getCurrentSettings(screenWidth);

            // --- 1. Calculate Scale ---
            const phoneWidth = phoneImageRef.current.offsetWidth;
            const maxAllowedWidth = screenWidth * 0.90;
            const fitScale = maxAllowedWidth / phoneWidth;
            const finalScale = clamp(0.25, 0.5, fitScale);

            // --- 2. Calculate Final Y Position ---

            // A. Calculate the 'Center Compensation'
            // If animation ends at 80%, we have a 20% gap.
            // We move the center down by 20vh so it feels visually centered during the scroll.
            const animGap = (100 - settings.animEnd) / 100; // 0.2 for mobile, 0 for desktop
            const centerCompensation = window.innerHeight * animGap;

            // B. Apply the User Configured Offset
            // Formula: Compensation + Breakpoint Offset
            const targetY = centerCompensation + settings.offset;

            // --- 3. Interpolation Logic (Optional) ---
            // If you want the phone to strictly stick to the targetY, use Option A.
            // If you want that "slide" effect based on scale (from your previous code), use Option B.

            // Option B (Smoother): Interpolate towards targetY as scale decreases
            // We assume '0' is the starting center, and we move towards targetY
            const progress = normalize(0.25, 0.5, finalScale);
            const easedProgress = yEase(progress);

            // On mobile, we interpolate. On desktop (fixed scale), it just stays at targetY.
            const finalY = settings.isMobile
                ? interpolate(targetY, ANIM_CONFIG.offsets.lg, easedProgress) // Interpolate between Mobile Target and Desktop Target
                : targetY;

            return {
                scale: finalScale,
                y: finalY
            };
        };

        tl1.fromTo(phoneContainer.current, {
            force3D: true,
            scale: 1.2,
            y: -20,
            filter: "brightness(0.2)",
        }, {
            scale: () => getTransform().scale,
            y: () => getTransform().y,
            duration: 2,
            filter: "brightness(1)",
            ease: "power2.out",
        });

        tl1.fromTo(subtitlesRef.current, {
                autoAlpha: 0,

            }, {
                autoAlpha: 1,
                duration: 2,
                ease: "power2.out",
            },
            ">");

        /* TIMELINE 2 */
        const tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: "#introduction",
                start: "top 40%",
                end: "50% 50%",
                scrub: 1,

                markers: false
            }
        });

        tl2.fromTo(introBottomTextRef.current, {
            autoAlpha: 0,
            filter: "blur(10px)",
            y: -100
        }, {
            autoAlpha: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1,
            ease: "power2.in",
        });

        /* TIMELINE 3 */
        const tl3 = gsap.timeline({
            scrollTrigger: {
                trigger: "#howItWorks",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1,

                markers: true
            }
        });

        tl3.fromTo(learnCardsRef.current, {
            autoAlpha: 0,
            filter: "blur(10px)",
        }, {
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power2.in",
        }, ">");

    }, {dependencies: []});

    const scrollToContent = () => {

        gsap.to(window, {
            duration: 2,
            scrollTo: {
                y: "#introduction", // Change this to the ID of your target section
                offsetY: 0,  // Optional: Add offset for fixed headers (e.g., 80)
            },
            ease: "power3.inOut"
        });
    };

    return (
        <>
            <Navbar/>
            {/*<CustomCursor/>*/}

            <div className="flex min-h-screen flex-col items-center font-sans overflow-x-hidden">
                <main
                    className="flex min-h-screen w-full flex-col items-center sm:items-start relative bg-black">

                    {/* --- HERO TEXT SECTION --- */}
                    <section
                        ref={heroRef}
                        id="hero"
                        className="flex flex-col h-screen items-center justify-center text-center mx-auto z-10 w-full ">


                        <div ref={phoneContainer}
                             className="absolute h-full w-full left-0 top-0 justify-center items-center flex z-5 overflow-visible"
                        >
                            <div className="relative h-full w-auto max-w-none flex-none ">

                                <Image
                                    src={iphoneImg}
                                    ref={phoneImageRef}
                                    alt="phone"
                                    className="h-full w-auto max-w-none z-10 relative pointer-events-none select-none md:rotate-0 1rotate-90"
                                    draggable={false}
                                    priority
                                />

                                {/* MASK Layer */}
                                <div className="absolute inset-0 z-5 md:rotate-0 1rotate-90 "
                                     style={{
                                         // Using the webkit prefixes + standard properties
                                         WebkitMaskImage: 'url("/images/iphone-mask.png")',
                                         maskImage: 'url("/images/iphone-mask.png")',
                                         WebkitMaskRepeat: 'no-repeat',
                                         maskRepeat: 'no-repeat',
                                         WebkitMaskSize: '100% 100%',
                                         maskSize: '100% 100%',
                                         WebkitMaskPosition: 'center',
                                         maskPosition: 'center',
                                     }}>

                                    {/* Noise Layer */}
                                    <div
                                        className="absolute inset-0 z-4 pointer-events-none"
                                        style={{
                                            backgroundImage: `url('/images/noise.jpg')`,
                                            backgroundRepeat: 'repeat',
                                            backgroundSize: '150px',
                                            mixBlendMode: 'overlay',
                                            opacity: '0.2'
                                        }}
                                    ></div>

                                    {/* Video Layer */}
                                    <video
                                        src="/videos/godfather-scene-vingo-res.mp4"
                                        autoPlay loop muted
                                        ref={(node) => setVideoNode(node)}
                                        className="h-full w-full object-cover z-3 will-change-transform backface-hidden transform-[translateZ(0)]"
                                        draggable={false}
                                        type="video/mp4"
                                    />
                                    <SubtitleRotator
                                        subtitles={subtitleData}
                                        ref={subtitlesRef}
                                        videoElement={videoNode}
                                        className="absolute bottom-[10%] left-0 w-full flex justify-center z-20 scale-250 md:scale-200 lg:scale-175 text-shadow-lg pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="z-10 flex flex-col items-center" ref={heroTextsRef}>
                            <h1 className="text-6xl sm:text-8xl font-semibold leading-tight tracking-tight ">
                                <TextRotator words={["Películas", "Series", "Vídeos"]}/>
                            </h1>
                            <h1 className="text-4xl sm:text-6xl font-semibold leading-tight tracking-tight text-white mt-[-1.5rem] mb-5">
                                Aprende cualquier idioma
                            </h1>

                            <div className="flex gap-2">
                                <a href="#descargar"
                                   className="bg-white text-black px-4 py-2 rounded flex gap-2 items-center">
                                    Descargar para iOS <FaApple className="mb-1"/>
                                </a>
                                <a href="#demo"
                                   className="border-2 border-white text-white px-4 py-2 rounded flex gap-2 items-center">
                                    Ver demo
                                </a>
                            </div>

                            <button
                                onClick={scrollToContent}
                                className="text-md hover:text-white/80 cursor-pointer absolute bottom-20 z-10 text-white rounded-full flex flex-col gap-2 items-center">
                                Ver más
                                <FaChevronDown ref={arrowRef}/>
                            </button>
                        </div>

                    </section>


                    {/* --- INTRODUCTION SECTION --- */}
                    <section
                        className="w-full h-[80vh] lg:h-screen bg-black flex flex-col items-center z-1 text-center"
                        ref={introSectionRef}
                        id="introduction">

                        <div className="flex flex-col justify-end h-full">
                            <h2 className="text-5xl font-semibold leading-tight mb-20 tracking-tight text-white"
                                ref={introBottomTextRef}>
                                Learning. Made easy.
                            </h2>
                        </div>
                    </section>
                    <section className="h-screen w-full container items-center flex flex-col mx-auto mt-20" id="howItWorks">
                        <div className="flex gap-8 max-w-[80%]" ref={learnCardsRef}>
                            <div className="flex flex-col items-start gap-5">
                                <h3 className="text-xl font-semibold">Upload any video</h3>
                                <hr className="border-white/25 w-full"/>
                                <p className="text-white/60 text-lg leading-6">Import videos from your camera roll,
                                    YouTube links,
                                    or
                                    any video file. <span className="text-white">We support all major formats</span>.
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-5">
                                <h3 className="text-xl font-semibold">Get instant subtitles</h3>
                                <hr className="border-white/25 w-full"/>
                                <p className="text-white/60 text-lg  leading-6">Our AI generates accurate subtitles in
                                    the original
                                    language plus translations in <span
                                        className="text-white">your target language</span>.
                                </p>
                            </div>

                            <div className="flex flex-col items-start gap-5">
                                <h3 className="text-xl font-semibold">Learn while watching
                                </h3>
                                <hr className="border-white/25 w-full"/>
                                <p className="text-white/60 text-lg leading-6"><span
                                    className="text-white">Tap any word</span> for instant definitions. Save vocabulary.
                                    Track your progress. Learn naturally.
                                </p>
                            </div>
                        </div>

                    </section>

                </main>
            </div>
        </>
    );
}