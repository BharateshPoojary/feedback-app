"use client";
import EmblaCarousel from "@/app/(app)/EmblaCarousel";
import { EmblaOptionsType } from "embla-carousel";
import "../base.css";
import "../embla.css";
import "../sandbox.css";

const Home = () => {
  const OPTIONS: EmblaOptionsType = {};
  const SLIDE_COUNT = 5;
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys());
  // console.log(SLIDES);
  return (
    <div>
      <h2 className="text-center text-2xl md:text-5xl my-5 font-bold">
        Welcome to the world of Mystery message
      </h2>
      <h5 className="text-center text-lg md:text-3xl my-5 font-bold">
        Get your first anonymous message now !!
      </h5>
      <>
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </>
    </div>
  );
};

export default Home;
