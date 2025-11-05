import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  size?: "smallest" | "small" | "medium" | "big";
}

const Icon = ({ src, alt, size = "small" }: Props) => {
  const sizeMap = {
    smallest: 30,
    small: 42,
    medium: 50,
    big: 60,
  };

  const dimension = sizeMap[size];

  return <Image src={src} alt={alt} width={dimension} height={dimension} />;
};

export default Icon;
