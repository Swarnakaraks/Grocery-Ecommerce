import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { image: "banner2.jpeg" },
  { image: "banner3.jpeg" },
  { image: "banner1.jpeg" },
];

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  // auto slide
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <div className="pt-5  ">
      <div className="relative min-h-[140px] overflow-hidden rounded-3xl sm:min-h-[430px] lg:min-h-[480px]">
        {/* banner image */}
        <img src={slide.image} alt="banner" className="absolute inset-0 h-full w-full object-contain" />

        {/* slider dots */}
        <div className="absolute bottom-6 left-6 z-10 hidden md:flex gap-2 sm:left-12">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-1.5 bg-white/40"}`} />
          ))}
        </div>

        {/* previous button */}
        <button onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)} aria-label="Previous slide" className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white sm:flex">
          <ChevronLeft size={18} />
        </button>

        {/* next button */}
        <button onClick={() => setIndex((i) => (i + 1) % slides.length)} aria-label="Next slide" className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white sm:flex">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}