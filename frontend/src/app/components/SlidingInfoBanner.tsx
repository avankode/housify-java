"use client";
import React, { useState, useEffect } from 'react';

interface InfoItem {
    id: string | number; // Based on item.id
    text: string;        // Based on item.text
}

// --- 2. Define the shape of the component's props ---
interface SlidingInfoBannerProps {
    items: InfoItem[];
}

const SlidingInfoBanner = ({ items } : SlidingInfoBannerProps) => {


    const [currentIndex, setCurrentIndex] = useState(0);
    const [monthPercentage, setMonthPercentage] = useState(0);

    // Effect for the "Month Progress" bar (Req 3)
    useEffect(() => {
        const now = new Date();
        const currentDay = now.getDate(); 
        const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const percentage = (currentDay/totalDays) * 100;
        const timer = setTimeout(() => {
            setMonthPercentage(percentage);
        }, 100); 

        return () => clearTimeout(timer);
    }, []);

    // Effect for the sliding text
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(intervalId);
    }, [items.length]);

    if (!Array.isArray(items) || items.length === 0) {
        return <div className="h-40" />; // keep layout height consistent if desired
    }
 return (


        <div className="relative w-full h-40 bg-lime-100 overflow-hidden shadow-lg text-lime-900">
            <div
                className="absolute bottom-0 left-0 w-full bg-black/75 z-10 transition-all ease-out duration-[2500ms]"
                style={{
                    height: `${monthPercentage}%`
                }}
            />

            {/* 2. Sliding Text Container */}
            {/* Sits on top of the "fill" with z-20 */}
            <div
                className="absolute top-0 left-0 h-full flex transition-transform duration-1000 ease-in-out z-20"
                style={{
                    width: `${items.length * 100}%`,
                    transform: `translateX(-${(currentIndex * 100) / items.length}%)`
                }}
            >
                {/* Render all slides */}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="w-full h-full flex items-center justify-center p-8"
                        style={{ width: `${100 / items.length}%` }}
                    >
                        <p className="text-2xl md:text-3xl font-medium text-center truncate">
                            {item.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* 3. Pagination Dots */}
            {/* Sits on top with z-20. New color scheme. */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full ${
                            currentIndex === index ? 'bg-lime-800' : 'bg-lime-800/30'
                        } transition-colors`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* The old side-bar progress is now removed. */}
        </div>
    );
};

export default SlidingInfoBanner;
