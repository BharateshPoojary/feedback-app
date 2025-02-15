import "@/app/globals.css";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
const Home = () => {
  return (
    <div>
      <h2 className="text-center text-2xl md:text-5xl my-5 font-bold">
        Welcome to the world of Mystery message
      </h2>
      <h5 className="text-center text-lg md:text-3xl my-5 font-bold">
        Get your first anonymous message now !!
      </h5>
      <Carousel className=" max-w-full flex  flex-col justify-center items-center">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div>
                <Card className="max-w-full">
                  <CardContent className="flex w-full items-center justify-center p-24">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Home;
