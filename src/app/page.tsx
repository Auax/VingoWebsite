"use client";

import React, {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
import {useGSAP} from '@gsap/react';
import Lenis from 'lenis';
import {FaChevronDown} from "react-icons/fa6";
import Image from 'next/image';


// Your existing imports
import Navbar from "@/app/components/navbar/navbar";

import iphoneImg from "@/assets/iphone.png";
import TextRotator from "@/app/components/TextRotator";
import SubtitleRotator from "@/app/components/Subtitles/Subtitles";
import {subtitleData} from "@/app/components/Subtitles/SubtitleData";

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

    const heroRef = useRef(null);
    const heroTextsRef = useRef(null);
    const subtitlesRef = useRef(null);
    const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null);
    const arrowRef = useRef(null);
    const contentRef = useRef(null);
    const phoneContainer = useRef(null);

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
                end: "+=100%", // Scrolls for the height of the hero
                scrub: 1,
                pin: true, // <--- PINS the hero section (and the phone inside it)
                markers: false,
            }
        });

        tl1.fromTo(heroTextsRef.current, {
                autoAlpha: 1,
            },
            {
                autoAlpha: 0,
                duration: 2,
                ease: "power2.out",
            });


        tl1.fromTo(phoneContainer.current, {
            force3D: true,
            scale: 1.6,
            y: -20,
            filter: "brightness(0.2)",
        }, {
            scale: 0.5,
            y: 0,
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
                trigger: "#content",
                start: "top 50%",
                end: "50% 50%",
                scrub: 1,

                markers: false
            }
        });


        // tl1.fromTo(contentRef.current, {
        //     opacity: 0,
        // }, {
        //     opacity: 1,
        //     duration: 1,
        //     ease: "power2.out",
        // });
    }, {dependencies: []});

    const scrollToContent = () => {

        gsap.to(window, {
            duration: 2,
            scrollTo: {
                y: "#content", // Change this to the ID of your target section
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
                        className="flex flex-col h-screen items-center justify-center text-center mx-auto z-10 w-full overflow-hidden">


                        <div ref={phoneContainer}
                             className="absolute h-full w-full left-0 top-0 justify-center items-center flex z-5"
                        >
                            <Image src={iphoneImg} alt="phone" className="w-full absolute object-contain z-5"
                                   draggable={false}/>
                            <SubtitleRotator subtitles={subtitleData}
                                             className="absolute bottom-50 z-5 scale-170 text-shadow-lg"
                                             ref={subtitlesRef} videoElement={videoNode}/>

                            {/* Masking and noise */}
                            <div className="w-full absolute object-contain z-2 h-screen"
                                 style={{
                                     WebkitMaskImage: 'url("/images/iphone-mask.png")',
                                     maskImage: 'url("/images/iphone-mask.png")',
                                     WebkitMaskRepeat: 'no-repeat',
                                     maskRepeat: 'no-repeat',
                                     WebkitMaskSize: 'contain',
                                     maskSize: 'contain',
                                     WebkitMaskPosition: 'center',
                                     maskPosition: 'center',
                                 }}>
                                <div
                                    className="fixed inset-0 z-4 pointer-events-none"
                                    style={{
                                        backgroundImage: `url('/images/noise.jpg')`,
                                        backgroundRepeat: 'repeat',
                                        backgroundSize: '150px',
                                        mixBlendMode: 'overlay', // or 'soft-light'
                                        opacity: '0.5' // Control the intensity here
                                    }}
                                ></div>
                                <video src="/videos/godfather-scene-vingo-res.mp4" autoPlay loop
                                       muted
                                       ref={(node) => setVideoNode(node)}
                                       className="h-full absolute object-contain z-3 will-change-transform backface-hidden transform-[translateZ(0)]"
                                       draggable={false}
                                       type="video/mp4"/>
                            </div>
                        </div>

                        <div className="z-10 flex flex-col items-center" ref={heroTextsRef}>
                            <h1 className="text-4xl sm:text-6xl font-semibold leading-tight tracking-tight text-white">
                                Aprende cualquier idioma viendo
                            </h1>
                            <h1 className="text-6xl sm:text-8xl font-semibold leading-tight tracking-tight mt-[-1rem] ">
                                <TextRotator words={["Películas", "Series", "YouTube"]}/>
                            </h1>

                            <button
                                onClick={scrollToContent}
                                className="text-md hover:text-white/80 cursor-pointer absolute bottom-20 z-10 text-white rounded-full flex flex-col gap-2 items-center">
                                Ver más
                                <FaChevronDown ref={arrowRef}/>
                            </button>
                        </div>
                        {/*<div className="w-full h-full fixed inset-0" id="laptop-container">*/}
                        {/* <Canvas camera={{position: [0, 2, 20], fov: 20}} gl={{antialias: true}}>*/}
                        {/* <ambientLight intensity={1}/>*/}
                        {/* /!*<Environment*!/*/}
                        {/* /!* files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr"/>*!/*/}
                        {/* <directionalLight position={[10, 10, 0]} intensity={1}/>*/}

                        {/* <LaptopModel/>*/}

                        {/* /!* Shadows to make it feel grounded *!/*/}
                        {/* /!*<ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4}/>*!/*/}
                        {/* </Canvas>*/}
                        {/*</div>*/}
                    </section>


                    {/* --- CONTENT SECTION --- */}
                    <section className="w-full h-screen flex justify-end bg-black flex-col items-center z-1"
                             ref={contentRef}
                             id="content">
                        <h1 className="text-5xl font-semibold leading-tight mb-20 tracking-tight text-white">
                            Lorem ipsum dolor sit amet
                        </h1>


                        {/*<WaveCard*/}
                        {/* title="Ecommerce website"*/}
                        {/* year="2025"*/}
                        {/* description="I designed this web for Núria, a space to present and sell her acting courses and therapies online. Features several sections, among them two testimonial pages that Núria can easily update directly from the website."*/}
                        {/* buttonText="Visit website"*/}
                        {/* link="https://nuriamartinezabad.com/"*/}
                        {/* className="mt-12 w-full max-w-2xl"*/}
                        {/* contentColor="white/80"*/}
                        {/* hrColor="white/20"*/}
                        {/* buttonTextColor="black"*/}
                        {/* buttonBgColor="white"*/}
                        {/*/>*/}

                        {/* Placeholder for more content to ensure page is scrollable enough to see animation */}
                    </section>
                    <section className="h-screen w-full"></section>

                </main>
            </div>
        </>
    );
}