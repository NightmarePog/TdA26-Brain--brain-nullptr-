"use client";
import Icon from "@/components/ui/icon";
import Logo from "@/public/Icons/vector/Idea/zarivka_idea_bile.svg";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full overflow-hidden">
      {/* Background */}
      <div>
        <Image
          src="/landing-background.svg"
          alt="Landing Background"
          fill
          priority
          className="object-cover -z-10"
        />
        <div className="bg-primary object-cover" />
      </div>

      {/* Content */}
      <main className="">
        <div className="text-left m-10 space-y-4 max-w-3xl ">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight drop-shadow-lg">
            Odemkni svůj vzdělávací potenciál!
          </h1>

          <p className="text-3xl md:text-4xl font-semibold drop-shadow-md">
            Když se zábava spojí se vzděláním!
          </p>

          <p className="text-2xl md:text-3xl  leading-snug drop-shadow-md">
            Připoj se k nám a objev stovky interaktivních kurzů, které tě budou
            opravdu bavit.
          </p>

          <div className="pt-4">
            <button className="px-8 py-4 text-2xl font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl transition">
              Začít teď
            </button>
          </div>
        </div>

        <div className="absolute right-10 bottom-10">
          <Icon src={Logo} size="huge" alt="Think Academy Logo" />
        </div>
      </main>
    </div>
  );
}
