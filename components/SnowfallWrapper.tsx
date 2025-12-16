'use client';

import React, { useEffect, useState } from 'react';

interface Snowflake {
    id: number;
    left: number;
    size: number;
    animationDuration: number;
    animationDelay: number;
    opacity: number;
}

export default function SnowfallWrapper() {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Generate snowflakes - bigger sizes
        const flakes: Snowflake[] = [];
        const count = 60; // Number of snowflakes

        for (let i = 0; i < count; i++) {
            flakes.push({
                id: i,
                left: Math.random() * 100, // Random horizontal position (0-100%)
                size: Math.random() * 8 + 4, // Size between 4-12px (bigger!)
                animationDuration: Math.random() * 6 + 10, // Duration between 10-16s
                animationDelay: Math.random() * 8, // Delay between 0-8s
                opacity: Math.random() * 0.5 + 0.5, // Opacity between 0.5-1
            });
        }

        setSnowflakes(flakes);
    }, []);

    // Don't render on server or before mount
    if (!mounted) return null;

    return (
        <>
            {/* Snowfall */}
            <div className="snowfall-container">
                {snowflakes.map((flake) => (
                    <div
                        key={flake.id}
                        className="snowflake"
                        style={{
                            left: `${flake.left}%`,
                            width: `${flake.size}px`,
                            height: `${flake.size}px`,
                            animationDuration: `${flake.animationDuration}s`,
                            animationDelay: `${flake.animationDelay}s`,
                            opacity: flake.opacity,
                        }}
                    />
                ))}
            </div>

            {/* Snow accumulation at bottom */}
            <div className="fixed bottom-0 left-0 right-0 h-8 z-40 pointer-events-none md:block hidden">
                <svg
                    viewBox="0 0 1440 40"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,40 L0,25 Q60,15 120,22 T240,18 T360,24 T480,16 T600,22 T720,18 T840,25 T960,17 T1080,23 T1200,19 T1320,24 T1440,20 L1440,40 Z"
                        fill="white"
                        opacity="0.95"
                    />
                    <path
                        d="M0,40 L0,30 Q80,22 160,28 T320,24 T480,29 T640,23 T800,28 T960,25 T1120,30 T1280,26 T1440,28 L1440,40 Z"
                        fill="white"
                        opacity="0.8"
                    />
                </svg>
            </div>
        </>
    );
}
