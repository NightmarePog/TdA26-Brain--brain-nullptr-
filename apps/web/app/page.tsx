import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import StartButton from "@/components/ui/startButton";
import Logo from "@/public/Icons/vector/Idea/zarivka_idea_bile.svg";

export default async function Home() {
  return (
    <main className="bg-linear-to-br from-primary via-brand-2 to-secondary w-full h-screen flex justify-between items-center pr-40">
      <StartButton />
      <div className="flex justify-center items-center">
        <div>
          <h1 className="text-7xl font-bold">Think Academy</h1>
          <p className="text-4xl">Když se zábava spojí se vzděláním!</p>
        </div>
        <Icon src={Logo} size="big" alt="Think Academy Logo" />
      </div>
    </main>
  );
}
