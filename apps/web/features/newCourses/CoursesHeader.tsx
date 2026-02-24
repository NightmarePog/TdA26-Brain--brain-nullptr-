import PageTitle from "@/components/typography/pageTitle";
import Text from "@/components/typography/text";
import { Card } from "@/components/ui/card";
import { getRandomFact } from "@/const/cool-facts";
import Image from "next/image";

const COURSES_MOTIVATIONAL_TEXT =
  "Studium není povinnost, ale investice do vlastní svobody. Každá nová dovednost rozšiřuje tvé možnosti, každý pochopený koncept ti dává větší kontrolu nad světem kolem tebe. Mozek se učením doslova mění a sílí – není to jen obraz, je to biologický fakt. To, co se dnes zdá těžké, je zítřejší samozřejmost, pokud vytrváš. Nejde o to být dokonalý, jde o to být zvědavý a vytrvalý. Každá minuta soustředění je krokem k lepší verzi sebe sama, která má širší rozhled, větší jistotu a více příležitostí tvořit vlastní budoucnost.";

const CoursesHeader = () => {
  return (
    <div>
      <div className="md:flex justify-between">
        <div>
          <PageTitle>Kurzy</PageTitle>
          <Text className="text-foreground/80 md:max-w-100 lg:max-w-200 text-lg pb-10">
            {COURSES_MOTIVATIONAL_TEXT}
          </Text>
        </div>
        <Card className="p-5 shadow-xl min-w-120 max-h-50 bg-foreground/10">
          <div className="flex">
            <Image
              width="200"
              height="200"
              alt="zarivka"
              src={"/Icons/raster/Idea/zarivka_idea_modre.png"}
            />
            <div className="p-5">
              <Text className="text-2xl font-bold">Věděl jsi že?</Text>
              <Text>{getRandomFact()}</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoursesHeader;
