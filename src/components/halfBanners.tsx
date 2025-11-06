import React from "react";
import Slider from "react-slick";

interface SlideProps {
  id: number;
  img: string;
  url: string | null;
}

interface CarouselProps {
  slides: SlideProps[];
}

const HalfBanners: React.FC<CarouselProps> = ({ slides }) => {
  const sliderSettings = {
    dots: slides.length > 1,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: slides.length > 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 3000,
  };
  return (
    <div className="md:container">
      <div className="md:container mx-auto w-11/12 md:w-9/12 py-6 lg:pt-0">
        <div className="container mx-auto px-4 py-5">
          {slides.length > 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
              <Slider {...sliderSettings}>
                {slides.map((slide, index) => (
                  <a
                    key={index}
                    href="https://ezichoice.lk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={slide.img}
                      alt={`Banner ${index + 1}`}
                      className="rounded-lg"
                    />
                  </a>
                ))}
              </Slider>
              <Slider {...sliderSettings}>
                {slides.map((slide, index) => (
                  <a
                    key={index}
                    href="https://ezichoice.lk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={slide.img}
                      alt={`Banner ${index + 1}`}
                      className="rounded-lg"
                    />
                  </a>
                ))}
              </Slider>
            </div>
          ) : slides.length === 1 ? (
            <a
              href="https://ezichoice.lk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={slides[0].img}
                alt="Single Banner"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </a>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default HalfBanners;
