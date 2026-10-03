# Návod na nasazení do Google Cloud Platform (GCP)

Tento dokument popisuje, jak nasadit aplikaci **Robot Karel - Prolog Edition** na GCP s minimálními náklady (ideálně **0 USD/měsíc** pro vývojářské účely a lehké užívání).

Pro tento účel je zvolena služba **Google Cloud Run**, protože:
1. **Škáluje na nulu (Scale-to-Zero):** Pokud nikdo aplikaci nepoužívá, neběží žádné servery a neplatíte nic.
2. **Štědrý Free Tier:** Cloud Run nabízí zdarma 2 miliony požadavků měsíčně a desítky hodin výpočetního času.
3. **Plně spravovaná (Serverless):** Google se stará o HTTPS certifikáty, operační systém i škálování.

---

## 1. Lokální spuštění přes Docker

Než aplikaci nasadíte, můžete si ověřit, že se kontejner sestaví a spustí správně lokálně.

```bash
# 1. Sestavení Docker obrazu
docker build -t karel-prolog .

# 2. Spuštění kontejneru lokálně na portu 3000
docker run -p 3000:3000 karel-prolog
```

Po spuštění přejděte v prohlížeči na adresu `http://localhost:3000`.

---

## 2. Příprava GCP prostředí (Jednorázové nastavení)

Ujistěte se, že máte nainstalované rozhraní [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install) a přihlaste se:

```bash
# Přihlášení do Google Cloud účtu
gcloud auth login

# Vytvoření nového projektu (pokud ještě žádný nemáte)
gcloud projects create karel-prolog-ide --set-as-default

# Povolení potřebných API služeb pro Cloud Run a Cloud Build
gcloud services enable run.googleapis.com build.googleapis.com
```

---

## 3. Nasazení do Google Cloud Run (Jediný příkaz!)

Díky modernímu příkazu `gcloud run deploy` s parametrem `--source` nemusíte ručně nahrávat Docker obrazy. Google automaticky přenese kód, sestaví kontejner přes **Cloud Build** v cloudu a rovnou ho nasadí:

```bash
gcloud run deploy karel-prolog-service \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --max-instances 1 \
  --memory 256Mi \
  --cpu 1
```

### Vysvětlení parametrů pro úspornost:
* `--region europe-west1`: Vybere region v Evropě (Belgie) pro rychlou odezvu.
* `--allow-unauthenticated`: Umožní veřejný přístup k aplikaci z internetu.
* `--max-instances 1`: Zamezí nadbytečnému škálování. Drží maximálně 1 běžící kontejner pro úsporu nákladů.
* `--memory 256Mi` & `--cpu 1`: Konfiguruje nejnižší a nejlevnější výpočetní výkon potřebný pro běh Express + Tau Prolog.

Po dokončení sestavení a nasazení vám terminál vypíše **Service URL** (např. `https://karel-prolog-service-xxxxx.a.run.app`), na které vaše aplikace okamžitě běží!

---

## 4. Kalkulace nákladů (MVP rozpočet)

Při tomto nastavení je výsledná cena **0,00 USD / měsíc**, pokud zůstanete v mezích bezplatného tarifu GCP (Free Tier):

| Služba | Free Tier limit | Spotřeba této aplikace za 1 zapnutí | Cena |
| :--- | :--- | :--- | :--- |
| **Cloud Run** | 2 mil. požadavků/měsíc | 1 požadavek na načtení | **Zdarma** |
| **Cloud Run vCPU** | 180 000 vCPU-sekund/měsíc | ~0.1 s CPU času na krok redukce | **Zdarma** |
| **Cloud Run RAM** | 360 000 GiB-sekund/měsíc | Alokováno pouhých 256 MB | **Zdarma** |
| **Cloud Build** | 120 minut sestavení/den | ~1.5 minuty na jedno nasazení | **Zdarma** |

Pokud limity překročíte, platíte pouze zlomky haléřů za další požadavky. Tím pádem se jedná o naprosto bezkonkurenční a nejlevnější řešení pro hostování plnohodnotného Prolog serveru.
