"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

import { cn } from "@/lib/utils";
// const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
// here [emblaRef, emblaApi] is the return value of custom react hook form named useEmblaCarousel used for creating carousel in react It returns as tuple
// where [0] => emblaRef and [1] => emblaAPI
//useEmblaCarouselType represents the return value type of useEmblaCarousel which  is the one I mentioned above

type CarouselApi = UseEmblaCarouselType[1];
// here I am assigning the UseEmblaCarouselType[1] which is the emblaAPi type  to Carousel API which provides method like scrollNext(), scrollPrev()
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
//here above UseCarouselParameters represents the type of parameters of useEmblaCarousel() hook. This types are represented in a tuple
// where [0]=>options  like {loop:false},[1]=>plugins like Autoplay
type CarouselOptions = UseCarouselParameters[0]; //assigning the options type to carousel Options
type CarouselPlugin = UseCarouselParameters[1]; //assigning the plugins  type to carousel Plugins

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  autoplayInterval?: number;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      autoplayInterval = 3000,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    );
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [slideCount, setSlideCount] = React.useState(0);

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }
      setSlideCount(api.scrollSnapList().length);

      const autoplay = () => {
        if (api.selectedScrollSnap() === slideCount - 1) {
          api.scrollTo(0);
        } else {
          api.scrollNext();
        }
      };

      const interval = setInterval(autoplay, autoplayInterval);
      return () => clearInterval(interval);
    }, [api, autoplayInterval, slideCount]);

    React.useEffect(() => {
      const select = () => {
        if (!api) return;
        const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
        api.on("select", onSelect);
        return () => api.off("select", onSelect);
      };
      select();
    }, [api]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          selectedIndex,
          setSelectedIndex,
        }}
      >
        <div
          ref={ref}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
          <CarouselIndicators />
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselIndicators = () => {
  const { selectedIndex, setSelectedIndex, api } = useCarousel();
  const [slideCount, setSlideCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setSlideCount(api.scrollSnapList().length);
  }, [api]);

  return (
    <div className="flex justify-center space-x-2 mt-4">
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "h-2 w-2 rounded-full bg-gray-400",
            selectedIndex === index && "bg-gray-900"
          )}
          onClick={() => api?.scrollTo(index)}
        />
      ))}
    </div>
  );
};

export { type CarouselApi, Carousel, CarouselContent, CarouselItem };
