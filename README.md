# Tour de App - NextJS + Express boiler plate

Šablona pro vývoj aplikace v soutěži Tour de App společně s frontendovou částí ve frameworku [NextJS](https://nextjs.org/), a backendovou částí v [Express](https://expressjs.com/).

## Prvotní nastavení

V složkách pro frontend a backend jsou `.env.example` soubory, které je potřeba přejmenovat na `.env` a upravit hodnoty dle potřeby.

Pro produkční vývoj je potřeba nastavit `NEXT_PUBLIC_API_URL` na URL API serveru na obou místech v souboru `tourdeapp.yaml` na URL kterou najdete na hlavní stránce Vašeho projektu na [tourde.cloud](https://tourde.cloud/).

> [!WARNING]
> Pokud chcete měnit heslo od databáze, je potřeba ho změnit v souboru `tourdeapp.yaml`, `apps/server/.env` a pro lokální vývoj v souboru `apps/server/package.json`.

## Lokální vývoj

Pro lokální vývoj je potřeba pustit
- **frontend** (`apps/web`), pomocí `npm run dev` (ve správném adresáři - `apps/web`), pustí se na [http://localhost:3001](http://localhost:3001)
- **backend** (`apps/server`), pomocí `npm run dev` (ve správném adresáři - `apps/server`), pustí se na [http://localhost:3000](http://localhost:3000)
- **MySQL** databázi, která je definována v `docker-compose.yaml`, pomocí `npm run db` (v adresáři `apps/server`), databáze poběží na portu 3306

> [!WARNING]
> Databáze není perzistentní, data se z ní po vypnutí Docker kontejneru ztratí.

## Produkční setup (jak se to spouští na našich servrech?)

Jak se aplikace spustí na [tourde.cloud](https://tourde.cloud/) je definováno v souboru `tourdeapp.yaml` v kořenovém adresáři tohoto repozitáře. V tomto boiler plate jsou předpřipravené služby:
```
- caddy (reverse proxy pro frontend a backend) - stará se o to aby dotazy na Vaší aplikaci byly směrovány na správné místo (tj. /* na frontend a /api/* na backend)
- web (frontend aplikace)
- server (backend aplikace)
- mysql (MySQL databáze)
```

> [!WARNING]
> Databáze není perzistentní, data se z ní po nahrání nové verze aplikace ztratí.

> [!NOTE]
> Reverse proxy je defaultně nastaven tak, že dotazy na `/*` jdou na frontend a `/api/*` pokud by jste chtěli api mít na jiné adresy je nutné změnit soubor `Caddyfile` v adresáři `apps/caddy`.

Co může `tourdeapp.yaml` obsahovat je napsáno v [kde??]().

Do Tour de Cloud se aplikace nahrávají přes [GitHub action](https://github.com/Student-Cyber-Games/upload-app?tab=readme-ov-file), pro nahrání je potřeba zadat **TDC_TOKEN**:
- Settings -> (Security) Secrets and variables -> Actions -> New repository secret.
- Name: `TDC_TOKEN` Secret: [váš secret vygenerovaný v [tourde.cloud](https://tourde.cloud/)]


### Prerekvizity

#### Windows

- Nainstalovaný [WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install)
- Nainstalovaný a běžící [Docker](https://www.docker.com/)
- Nainstalovaný [Node.js](https://nodejs.org/en/download/)
- Nainstalovaný [npm](https://www.npmjs.com/get-npm) (bývá součástí Node.js)

#### Linux / MacOS

- Nainstalovaný a běžící [Docker](https://www.docker.com/)
- Nainstalovaný [Node.js](https://nodejs.org/en/download/)
- Nainstalovaný [npm](https://www.npmjs.com/get-npm) (bývá součástí Node.js)

## Odevzdání

Jak odevzdat svojí aplikaci můžete najít v našich [kde??]()
