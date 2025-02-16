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
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]; //Ref to attach to the carousel container
  api: ReturnType<typeof useEmblaCarousel>[1]; //embla api  object for controlling the carousel
  selectedIndex: number; //Keeps track of the currently selected slide index.
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  //Dispatch includes  the function which is going to update the state often used with useState setstateaction represents the function which updates the state  and this state will
  // only change the state of number type
  //e.g const [count,setCount] =  useState(0);
  // here setCount(count+1):React.Dispatch<React.SetStateAction<number>>
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);
// create context is used so that state can be accessed by the components which are residing inside carousel compoenent
// here we will wrap the carousel component with context.provider

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
    // forwardRef allows to pass the ref to child component  which mean if Carousel compoent get some ref it will can be used bycomponent residing inside Carousel component
    // HTMLDivElement the ref will be attached to div element
    // React.HTMLAttributes<HTMLDivElement> this div will contain all the attributes that a normal div element contains like className=,id= etc.
    {
      // This are destructured props
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      autoplayInterval = 3000,
      ...props // this are the extra  props a component can get I am directly giving  all props without explicitly specifying it
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts, //spreading the opts object which contain various properties and one property I am overriding here
        axis: orientation === "horizontal" ? "x" : "y", //i.e axis if horizonatal then x else y
      },
      plugins //It includes various plugins
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
      // The length of this array represents the total number of slides.

      const autoplay = () => {
        if (api.selectedScrollSnap() === slideCount - 1) {
          //api.selectedScrollSnap() This returns the index of the currently selected slide.
          // if there are 5 slide 0,1,2,3,4 then 5-1 = 4 that time it will again start from 0
          api.scrollTo(0);
        } else {
          api.scrollNext();
        }
      };

      const interval = setInterval(autoplay, autoplayInterval); //here it will call the setInterval call back after the given seconds it is not dependent on useEffect running
      return () => clearInterval(interval); //here when any of the dependencies changed it will clear the old interval and start with new interval by setting it again using
      // setInterval using setInterval
    }, [api, autoplayInterval, slideCount]);

    React.useEffect(() => {
      if (!api) return;
      const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
      api.on("select", onSelect); //when a particular slide is selected the onSelect() callback will run and will move to that index where the slide currently present
      // this is usefull for indicators to know where the slide is currently present
      return () => {
        api.off("select", onSelect);
      }; //It should be wrapped in a {} to explictly tell that it returns a callback or else it will throw an error
      // as useEffect only returns a  callback function
    }, [api]);

    return (
      <CarouselContext.Provider
        value={{
          //The value prop includes the functions and various option which we passed as object {} so that when we use this context we can destructure it
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
          ref={ref} //here it includes the forwarded ref sent fram parent    <CarouselContext.Provider
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
  //...props means any props sent to this compoenent we are directly accessing it inside return()
  const { carouselRef, orientation } = useCarousel(); //using the context value
  return (
    <div ref={carouselRef} className="overflow-hidden w-3/4 h-1/2">
      <div
        ref={ref} //forwarded ref here
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
CarouselContent.displayName = "CarouselContent"; //custom name for component

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
        "w-full shrink-0 grow-0 ",
        orientation === "horizontal" ? "pl-4 " : "pt-4 ",
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
