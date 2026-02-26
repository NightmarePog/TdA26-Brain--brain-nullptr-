import { LockIcon } from "lucide-react";

const BaseCardLock = () => {
  return (
    <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
      <div className="text-center">
        <LockIcon size={80} className="mx-auto text-white" />
        <p className="text-2xl text-background">Kurz je zamčený do</p>
        <p className="text-2xl text-background">10. 10. 2023</p>
      </div>
    </div>
  );
};

export default BaseCardLock;
