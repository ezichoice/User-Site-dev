// components/carousel.tsx
"use client";
import Image from "next/image";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

interface SlideProps {
  id: number;
  img: string;
  url: string | null;
}

interface CarouselProps {
  slides: SlideProps[];
}

const Carousel: React.FC<CarouselProps> = ({ slides }) => {
  const router = useRouter();
  console.log("here baner");
  const settings = {
    dots: true,
    infinite: slides.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: slides.length > 1,
    pauseOnHover: false,
  };

  const handleBannerLink = (item: string | null) => {
    console.log(item, "banner");

    // Navigate to a different route
    if (item) {
      window.open(item, "_blank");
    }
  };
  return (
    <div className="md:container">
      <div className="md:container mx-auto w-11/12 md:w-9/12 py-6 lg:pt-0">
        <Slider {...settings}>
          {slides.map((item) => (
            <div
              key={item.id}
              className={`relative w-full aspect-[6/4] md:aspect-[10/4] ${
                item?.url ? "cursor-pointer" : ""
              }`}
              onClick={() => handleBannerLink(item.url)}
            >
              <Image
                className="rounded-xl object-cover"
                src={item.img}
                alt={`Slide ${item.id}`}
                unoptimized
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Carousel;
