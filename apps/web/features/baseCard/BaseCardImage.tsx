import Image from "next/image";
import { ReactNode } from "react";

type BaseCardImageProps = {
  src: string;
  alt: string;
  badge?: string;
  children?: ReactNode;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

export function BaseCardImage({
  src,
  alt,
  badge,
  children,
  onError,
}: BaseCardImageProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden">
      <Image
        fill
        src={src}
        alt={alt}
        className="object-cover brightness-60 grayscale dark:brightness-40"
        onError={(e) => onError!(e)}
      />

      <div className="absolute inset-0 bg-black/35" />

      {children && <div className="absolute inset-0 z-20 m-3">{children}</div>}
    </div>
  );
}
