# Restaurant Reservation System – CI/CD, Security & Monitoring

## Opis projekta
Projekt *Restaurant Reservation System* je spletna aplikacija za upravljanje rezervacij v restavraciji.  
Aplikacija vključuje frontend (HTML, CSS, JavaScript) in backend (Node.js, Express) ter je zapakirana v Docker zabojnik.  
V okviru te naloge je bil poudarek na CI/CD cevovodu, varnosti kode, analizi ranljivosti in nadzoru procesov.

---

## CI/CD cevovod
CI/CD cevovod je implementiran z **GitHub Actions** in vključuje naslednje faze:

- Frontend: nameščanje odvisnosti, testiranje in build
- Backend: testiranje, build in preverjanje pokritosti
- SonarCloud analiza kakovosti kode
- Docker build in objava slik na Docker Hub:
  - `dev` za okolje Development
  - `prod` za okolje Production
- Production okolje je zaščiteno z ročno potrditvijo (Environment approval)

Cevovod je razdeljen po vejah:
- `main` → Development
- `production` → Production

---

## Datadog – monitoring CI/CD procesov

### Integracija
Datadog je bil integriran z GitHub repozitorijem preko **GitHub App integracije**.

### Nadzorna plošča
Ustvarjena je bila osnovna nadzorna plošča *CI/CD Monitoring – GitHub Actions*, namenjena spremljanju:
- trajanja izvajanja CI/CD cevovodov,
- uspešnosti in pogostosti izvajanj,
- morebitnih odstopanj ali težav v procesih.

### Analiza in optimizacija
Na podlagi opazovanja CI/CD izvajanj so bila identificirana naslednja ozka grla:
- zaporedno izvajanje frontend in backend opravil.

#### Izboljšave
- frontend in backend opravila se izvajajo **sočasno (parallel jobs)**,
- Docker build faze se sprožijo šele po uspešnih testih,
- Production faza je dodatno zaščitena z ročno potrditvijo.

S tem se je skrajšal celotni čas izvajanja cevovoda in izboljšala zanesljivost nameščanja.

---

## SonarCloud – analiza kakovosti kode

SonarCloud je bil integriran v CI/CD cevovod in se izvaja samodejno ob vsakem pushu ali pull requestu.

Analiza vključuje:
- frontend in backend kodo,
- preverjanje varnosti,
- zanesljivosti,
- vzdržljivosti kode,
- tehničnega dolga.

Za Production okolje je nastavljen **Quality Gate**, ki prepreči nadaljevanje cevovoda, če pogoji kakovosti niso izpolnjeni.

---

## GitHub Code Scanning (CodeQL)

V zavihku **Security** je omogočen **CodeQL code scanning**.

- Analiza se izvaja ob pushih in pull requestih na vejo `main`.
- Pregledane so bile zaznane ranljivosti.
- CodeQL analiza se izvaja samodejno preko GitHub Actions.

---

## Snyk – analiza ranljivosti

### Snyk Code
Snyk je bil uporabljen za analizo izvorne kode (JavaScript):
- zaznane so bile nekatere opozorilne ranljivosti (npr. DOM-based XSS, hardcoded vrednosti),
- ranljivosti so bile analizirane in dokumentirane.

### Snyk Dockerfile / IaC scan
Izveden je bil tudi **Snyk Dockerfile (Infrastructure as Code) scan** za:
- `backend/Dockerfile`

Rezultati:
- preverjena je bila osnovna slika Docker zabojnika,
- kritične ranljivosti niso bile zaznane (oziroma so bile nizke resnosti).

S tem je bila izpolnjena zahteva za **Container / Dockerfile scan**.

---

## Povzetek stanja in izboljšav

- CI/CD cevovod je avtomatiziran, pregleden in zaščiten.
- Varnost kode je preverjena z več orodji:
  - SonarCloud
  - GitHub Code Scanning (CodeQL)
  - Snyk (Code + Dockerfile)
- Identificirana ozka grla v cevovodu so bila odpravljena z uporabo sočasnosti.
- Production okolje je dodatno zaščiteno z ročno potrditvijo in quality gate preverjanjem.

---

## Uporabljena orodja
- GitHub Actions
- Docker & Docker Hub
- SonarCloud
- Datadog
- Snyk
- GitHub Code Scanning (CodeQL)

---

## Avtor
Sladjana Peković
