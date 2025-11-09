"use client";

import * as React from "react";
import Image from "next/image";
import { CoursePreviewProps } from "@/types/course";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "phosphor-react";
import Text from "@/components/ui/typography/text";

interface CoursePreviewCarouselProps {
  coursePreviewInfo: CoursePreviewProps[];
}

const CoursePreviewCarousel: React.FC<CoursePreviewCarouselProps> = ({
  coursePreviewInfo,
}) => {
  return (
    <div className="relative w-full">
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-4">
          {coursePreviewInfo.map((info, index) => (
            <CarouselItem
              key={index}
              className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <Card className="group h-[440px] pt-0 overflow-hidden border text-foreground border-card-foreground hover:shadow-lg transition-all rounded-2xl">
                <div className="relative h-50 w-full overflow-hidden">
                  <Image
                    src={info.image}
                    alt={info.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <CardContent className="flex flex-col justify-between h-[200px] p-4">
                  <div>
                    <Text className="text-lg font-semibold mb-1 line-clamp-1">
                      {info.name}
                    </Text>
                    <Text className="text-sm text-foreground/70 line-clamp-2">
                      {info.description}
                    </Text>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="secondary"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 rounded-full px-3 py-1"
                    >
                      <span>Explore</span>
                      <ArrowRight size={18} weight="bold" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md" />
      </Carousel>
    </div>
  );
};

export default CoursePreviewCarousel;
