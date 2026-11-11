# Imbustai: media per il blog (11 novembre 2026)

Fonte: `Imbustai/imbustai-app`, main a `6b456d2`, e il database di sviluppo. Solo dati di prova: nessun Giocatore vero, nessuna email, nessuna chiave. Nessuna scrittura sul database e nessuna chiamata a modelli: spesa $0.

## Le immagini

Le immagini 01–09 sono del prototipo `/prototype/fixed-pieces`. Sono state catturate da Chrome a 1440 px CSS di larghezza con deviceScaleFactor 2, quindi i PNG sono larghi 2880 px, e coprono la pagina intera. Il prototipo esiste solo sul branch `wayfinder/fixed-pieces-ui` (commit `f9364cf`) e legge i testi dal documento della Storia Voss nel DB di sviluppo.

**Spoiler.** Nelle immagini 01–09 ogni testo oltre la premessa è stato sostituito con lettere a caso, poi sfocato, quindi non si può ricostruire. Restano leggibili:
- la carta delle regole;
- il decreto di trasferimento;
- il primo paragrafo della lettera d'apertura di Voss;
- la lettera segnaposto del Giocatore;
- i contatti, le note del prototipo, le etichette e le date (tranne quelle del 1988).

Sono sfocati i ritagli, le lettere successive, gli allegati e i loro titoli.

| File | Cosa mostra |
|---|---|
| `01-fixed-pieces-oggi.png` | Variante «Oggi: resa semplice»: com'era la pagina di gioco prima del lavoro sui pezzi fissi. Una colonna di lettere, la più recente in alto, e i contatti a sinistra. Regole e decreto non arrivano al Giocatore. |
| `02-fixed-pieces-A-carta-in-linea.png` | Variante A «Carta in linea»: la carta delle regole in cima, chiudibile, poi ogni consegna come oggetto (busta iniziale con il decreto dattiloscritto, ritagli di giornale, allegati spillati sotto la lettera). |
| `03-fixed-pieces-B1-regole.png` | Variante B «La busta e il lettore», passo 1: la carta delle regole a tutto schermo con «Apri la busta». |
| `04-fixed-pieces-B2-busta.png` | Variante B, passo 2: la busta aperta, con due fogli da scegliere (il decreto e la lettera da Roma). |
| `05-fixed-pieces-B3-lettera.png` | Variante B, passo 3: la posta, con l'elenco delle buste a sinistra e il lettore a schede a destra, aperto sulla lettera di Voss. |
| `06-fixed-pieces-B4-decreto.png` | Variante B, scheda «Decreto di trasferimento»: il foglio dattiloscritto. |
| `07-fixed-pieces-B5-ritaglio.png` | Variante B, un ritaglio del Messaggero: testata, titolo, occhiello e carta di giornale. |
| `08-fixed-pieces-C-fascicolo.png` | Variante C «Il fascicolo»: le lettere a sinistra; a destra il fascicolo, dove finisce tutto ciò che non è una lettera (decreto, ritagli, allegati), in ordine di arrivo. In cima una striscia con le regole in breve. |
| `09-fixed-pieces-C-regole.png` | Variante C con il pannello delle regole aperto. |
| `10-tester-mailbox-voss-1987.png` | La casella del Tester com'è su main (PR #54), sulla Partita di prova di «Voss — Roma, 1987». Contiene solo la busta d'apertura: mittenti a sinistra, la lettera di Voss sulla carta di una persona, il decreto come allegato in una scheda. Screenshot di Paolo, 2000×976, non sfocato: si legge la lettera d'apertura fino alla rapina del '77. L'interfaccia era in inglese (Senders, Timeline, Letter, Opening). |

Note sulle immagini:
- **Prototipo, varianti A e B4.** Il prototipo non manda a capo le righe dattiloscritte, quindi la pagina è più larga di 1440 px (2666 e 2696 px CSS). Le catture sono tagliate a 1440, quindi nella parte bassa di A i ritagli escono a destra. La casella del Tester su main (#54) ha risolto il problema: il decreto va a capo e non scorre di lato.
- **Il prototipo non è stato unito, per scelta.** Paolo ha scelto la variante B e l'ha ricostruita come casella del Tester in #54. Le lettere arrivano ai Giocatori paganti su carta, quindi quella schermata serve al Tester.

## Cosa manca e perché

- **Pannello admin con una bozza generata: non c'è.** Su main, `generateTurn` e `validateDraft` di engine-voss lanciano `NotBuiltYet` (ticket #41). L'unica Partita di Voss 1987 nel DB di sviluppo non ha Turni. Ci sono bozze solo sulla vecchia Voss (engine-classic), in Partite di account non admin, e non le ho usate.
- **Run del giocatore IA: non c'è.** La tabella `runs` del DB di sviluppo è vuota. La PR #55 dice che non è stata giocata nessuna Run vera: Paolo ha saltato la Run a pagamento su engine-classic, e la prima sarà su engine-voss dopo #41.

## Numeri (11 novembre 2026)

- **Test**: `pnpm test` su main `6b456d2`: 38 file e 363 test, tutti passati (Vitest 4.1.6, Node 24.11.1, 3,05 s).
- **PR #52, «engine-voss: the mechanics»**:
  - unita il 10 novembre 2026 alle 17:09 ora italiana (merge `3644ac0`);
  - +2207 −21 righe in 15 file, 1 commit;
  - ticket #40, 318 test passati al momento della PR;
  - codice puro, senza chiamate a modelli: $0.
- **PR #54, «Tester mailbox: senders, timeline and the fixed pieces as paper»**:
  - unita il 10 novembre 2026 alle 17:04 (merge `fd42f4a`);
  - +1327 −358 righe in 20 file, 1 commit;
  - chiude la metà costruttiva del ticket #43, che resta aperto;
  - 282 test al momento della PR, $0.
- **PR #55, «Runs: an AI player that plays any Engine under a cost cap»**:
  - unita l'11 novembre 2026 alle 02:03 (merge `6b456d2`);
  - +2689 −68 righe in 30 file, 3 commit;
  - chiude #31 e aggiunge la migrazione `20261110120000_runs.sql`;
  - 363 test, $0.
- **Ticket #41, «engine-voss: the writing pipeline, and Paolo plays Turn 1 in the app»**: aperto (`wayfinder:task`), 3 commenti, ultimo aggiornamento il 13 ottobre 2026. Su GitHub non ha ancora una PR.
- **Mappa #9, «Il quarto nome»**: aperta.

## Su main e non su main

Su main (`6b456d2`):
- **Meccaniche di engine-voss (#52)**: calendario, uffici, stato di Voss, indizi, Finali. Sono codice puro e deterministico: i Finali li decide il codice, non un modello.
- **Casella del Tester (#54)**: mittenti, linea del tempo, carta delle regole, e i pezzi fissi su carta (foglio dattiloscritto per uffici e documenti, ritaglio per i giornali, una calligrafia per persona).
- **Runs (#55)**: un giocatore IA con tre personalità (metodico, caloroso, impulsivo) e un tetto di spesa controllato prima di ogni chiamata. Ci sono una scheda «Start a Run» e un pannello Run nell'admin, e la CLI `pnpm run:story`.

Non su main:
- **La pipeline di scrittura di engine-voss (#41)**: senza di essa un Turno di Voss 1987 non si può ancora generare.
- **Il prototipo `/prototype/fixed-pieces`**: solo sul branch `wayfinder/fixed-pieces-ui`.
- **Nessuna Run giocata.**
