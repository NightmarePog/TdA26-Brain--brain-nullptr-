"use client";

import * as React from "react";
import Image from "next/image";
import { CoursePreviewProps } from "@/types/course";
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
    <div className="flex flex-wrap -mx-4">
      {coursePreviewInfo.map((info, index) => (
        <div
          key={index}
          className="px-4 mb-6 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
        >
          <Card className="group h-[500px] p-0 overflow-hidden border border-card-foreground hover:shadow-xl transition-all rounded-3xl">
            <div className="relative h-[250px] w-full overflow-hidden">
              <Image
                src={info.image}
                alt={info.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <CardContent className="flex flex-col justify-between h-[250px] p-6">
              <div>
                <Text className="text-xl font-semibold mb-2 line-clamp-1">
                  {info.name}
                </Text>
                <Text className="text-base text-foreground/70 line-clamp-3">
                  {info.description}
                </Text>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="secondary"
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 rounded-full px-4 py-2"
                >
                  <span>Explore</span>
                  <ArrowRight size={20} weight="bold" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default CoursePreviewCarousel;
