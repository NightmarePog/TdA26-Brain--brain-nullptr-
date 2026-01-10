"use client";
import Image from "next/image";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        height={256}
        width={256}
        src="/Icons/vector/Duck/Duck.svg"
        alt="img"
        className="pb-10"
      />
      <div className="z-10 text-center">
        <p className="font-bold text-3xl">ajaj</p>
        <p className="font-bold text-2xl">
          hledali jsme všude, ale nikde nic jsme nenašli!
        </p>
      </div>
    </div>
  );
};

interface httpErrorProps {
  code: number;
}

export const HttpError = ({ code }: httpErrorProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        height={512}
        width={512}
        src={`https://http.cat/${code}`}
        alt="img"
        className="pb-10"
      />
      <div className="z-10 text-center">
        <p className="font-bold text-3xl">ajaj</p>
        <p className="font-bold text-2xl">nastala chyba!</p>
        <Button
          className="m-5 cursor-pointer"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowLeft />
          zpět
        </Button>
      </div>
    </div>
  );
};

interface MessageErrorProps {
  message: string;
}

export const MessageError = ({ message }: MessageErrorProps) => {
  const router = useRouter();
  return (
    <div className="flex mx-auto flex-col items-center justify-center">
      <div className="z-10 text-center">
        <p className="font-bold text-3xl">ajaj</p>
        <p className="font-bold text-2xl">nastala chyba!</p>
        <p className="font-bold text-2xl">{message}</p>
        <Button
          className="m-5 cursor-pointer"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowLeft />
          zpět
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
