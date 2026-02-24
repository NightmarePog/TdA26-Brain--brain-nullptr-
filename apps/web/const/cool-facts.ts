export const coolFacts = [
  "Chobotnice mají tři srdce a jejich krev je modrá kvůli mědi v hemocyaninu.",
  "Venuše je teplejší než Merkur, přestože je dál od Slunce, kvůli extrémnímu skleníkovému efektu.",
  "Lidský mozek spotřebuje asi 20 % energie těla, i když tvoří jen kolem 2 % jeho hmotnosti.",
  "Na Saturnu a Jupiteru může pršet diamanty – alespoň podle laboratorních simulací.",
  "Existuje druh medúzy, který dokáže biologicky „omládnout“ a vrátit se do vývojové fáze polypu.",
  "Banány jsou z botanického hlediska bobule, ale jahody ne.",
  "Neutronová hvězda o velikosti města může mít hmotnost větší než Slunce.",
  "V lidském těle je víc bakteriálních buněk než lidských buněk, přibližně v poměru 1:1.",
  "Den na Venuši trvá déle než její rok.",
  "Žraloci existovali dříve než stromy.",
  "Voda může současně existovat ve třech skupenstvích v tzv. trojném bodě.",
  "Největší organismus na Zemi je houba – podhoubí v Oregonu se rozkládá na několika kilometrech čtverečních.",
  "Světlo ze Slunce dorazí na Zemi přibližně za 8 minut a 20 sekund.",
  "DNA v jediné lidské buňce by po rozvinutí měřila asi 2 metry.",
  "Na Měsíci jsou otisky bot z mise Apollo, které tam zůstanou miliony let, protože tam není atmosféra.",
  "Chobotnice mají neurony i v chapadlech, takže každé může částečně „myslet“ samostatně.",
  "Antarktida je největší poušť na světě podle množství srážek.",
  "Existují bakterie, které přežijí ve vakuu vesmíru.",
  "Srdce modré velryby je tak velké, že jeho tep by mohl být slyšitelný na několik metrů.",
  "Některé kovy, například galium, se mohou roztavit v dlani, protože tají těsně nad pokojovou teplotou.",
];

export function getRandomFact(): string {
  const randomIndex = Math.floor(Math.random() * coolFacts.length);
  return coolFacts[randomIndex];
}
