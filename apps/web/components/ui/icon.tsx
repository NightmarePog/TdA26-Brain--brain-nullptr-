import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  size?: "smallest" | "small" | "medium" | "big";
  className?: string;
}

const Icon = ({ src, alt, size = "small", className }: Props) => {
  const sizeMap = {
    smallest: 25,
    small: 30,
    medium: 40,
    big: 300,
  };

  const dimension = sizeMap[size];

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={className}
    />
  );
};

export default Icon;
