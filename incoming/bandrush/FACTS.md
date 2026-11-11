# BandRush: media per il blog (11 novembre 2026)

Fonte: il progetto BandRush sul Mac di Paolo, con la build attuale: `game/EBOOT.PBP`, 330 526 byte, compilata l'11/11/2026 alle 01:45, SHA-1 `cea1d2b74681e0b0ba7bb39497595cd121877b23` (identica a `dist/PSP/GAME/BANDRUSH/EBOOT.PBP`). Niente è stato ricompilato. Codice, tool e canzoni del progetto non sono stati modificati e nel progetto non è stato fatto nessun commit.

**Tutti questi media vengono dall'emulatore PPSSPP 1.20.4 (macOS), non da una PSP vera.** In ogni scena suona il bot del gioco o una sequenza di tasti scriptata, mai una persona.

## I file

Gli screenshot sono a 480×272, la risoluzione della PSP. In `2x/` c'è una copia di ciascuno a 960×544, ingrandita con nearest-neighbor: ogni pixel diventa un blocco 2×2, verificato pixel per pixel.

| File | Cosa mostra |
|---|---|
| `01-lista-canzoni.png` | La lista canzoni in Hard, modalità Solo Drums, raccolta «Tutte»: 6 brani dei Nine Inch Nails su 11 righe, ordinati per difficoltà (il numero a sinistra, da 1 a 100). Il cursore è su *Discipline*. In alto a destra «44/51»: nell'emulatore c'erano solo le 51 canzoni demo con licenza libera (vedi sotto), 44 delle quali hanno una parte di batteria. |
| `02-scheda-brano.png` | La scheda di *Discipline* in Expert, modalità Band. Mostra la difficoltà della band (Easy 29, Medium 55, Hard 66, Expert 75), una barra per strumento, gli accordi di chitarra (2 note 40%, 3 note 15%) e i tasti: Sx Su Dx Quadrato Triangolo Cerchio, Traccia Giù/X, Overdrive Select, Vibrato L/R. |
| `03-intro-crediti.png` | L'inizio del brano: il gioco mostra titolo, artista e licenza («CC BY-NC-SA 3.0 US - nin.com») e il conto alla rovescia. |
| `04-gameplay.png` | Modalità Band, Expert: le quattro tracce in prospettiva (batteria, basso, chitarra, voce). Si suona la voce, con una nota tenuta su ↑. Moltiplicatore x4, 32 note di fila. |
| `05-accordo.png` | Chitarra in Expert: un accordo da tre note (← ↑ △) preso sulla linea di colpo. In arrivo altri accordi da tre. |
| `06-x4-fuoco.png` | Batteria: il moltiplicatore arriva a x4, l'anello si accende e le note colpite prendono fuoco lungo la linea. |
| `07-errore-tremolio.png` | Un errore sulla chitarra, con una serie di 46 note persa. Lo schermo è spostato di circa 5 px a sinistra e 2 px in basso, c'è un flash rosso, la corsia □ è rossa e il moltiplicatore torna da x4 a x1. Il tremolio dura un quarto di secondo: da fermo si vede solo lo spostamento, nel video si vede muoversi (a 19,5 s). |
| `08-risultati.png` | La schermata dei risultati di *Same Boat* (Josh Woodward), Easy, Solo Drums: 61 note prese su 65 (93%), tutte perfette, 4 stelle, 14 740 punti, «NUOVO RECORD», errore medio +0 ms. Vedi «Limiti». |
| `09-pipeline-discipline.png` | 1600×1100. La pipeline vera su *Discipline*, chitarra, per 4 battute (11,6–19,7 s). Mostra la traccia della band, gli attacchi rilevati, la griglia dei battiti dal MIDI dei tempi della band e le note per corsia, Easy ed Expert affiancati. |
| `10-gameplay-nin-discipline.mp4` | 29,5 s: 25,5 s di gioco più 4 s di crediti. Il brano è *Discipline*, Expert, modalità Band, con l'audio del gioco. Formato: H.264 High, yuv420p, 960×544 (2× nearest-neighbor), 59,94 fps, AAC 160 kbit/s, 4,2 MB. |

Nel video:
- 0–3,8 s: il gioco mostra il credito del brano.
- 15,5 s: arriva x4, con il fuoco.
- 15,9 s: accordi da tre note.
- 19,5 s: un errore con il tremolio.
- dopo 25,5 s: il cartello dei crediti.

## Come sono stati fatti

- **Metodo.** È lo stesso usato per verificare le build: `game/test/run_emu.sh`, cioè PPSSPP con il renderer software (`game/test/software_render.ini`) e l'autotest del gioco (`autotest.cfg`). Ho usato una copia dello script in una cartella temporanea, per due motivi: caricare solo le canzoni con licenza libera e attivare il dump video/audio di PPSSPP. Lo script del progetto non è stato toccato.
- **Canzoni caricate.** Nell'emulatore c'erano solo le 51 canzoni demo con licenza libera. Così ogni brano che compare ha la licenza elencata qui sotto.
- **03–07 e video.** Una partita del bot (*Discipline*, Expert, Band, imprecisione 12 ms, 4% di note mancate apposta, overlay diagnostico spento). È stata registrata col dump di PPSSPP: video FFV1 senza perdita a 480×272 e audio WAV. Ho controllato che i fotogrammi del dump siano identici byte per byte allo screenshot che il gioco stesso salva (`shot=`) della stessa scena.
- **Sincronia del video.** L'audio del dump parte 21 ms prima del video, e il video lo compensa. Il valore viene dai tempi nel log di PPSSPP (inizio e fine tornano entrambi a 21 ms): non è stato misurato sul contenuto.
- **01, 02, 08.** Corse scriptate nei menu veri (`key=`), con gli screenshot del gioco (`shot=`).
- **09.** Le fasi 1–3 sono state calcolate rilanciando le funzioni vere di `tools/bandrush` sulle multitracce, con le stesse impostazioni del brano (`bandrush.json`):
  - decode e bilanciamento;
  - `detect_all` e `snap_all`;
  - la griglia da `Discipline Markers and Tempo.mid`.

  La fase 4 mostra le note del file `.brs` che il gioco carica, con la regola dei pollici che il gioco applica in Hard ed Expert. Nel progetto non è stato scritto niente: bytecode Python disattivato, file intermedi in una cartella temporanea.

## Numeri attuali

**Canzoni demo:** 51, con licenza libera, tutte nel formato 4. Sono le sole che compaiono in questi media.
- 36 di Josh Woodward (CC BY 4.0);
- 4 di Muldjord (CC BY-SA 3.0);
- 4 di Sectoid (licenza stile MIT);
- 7 dei Nine Inch Nails da *The Slip* (CC BY-NC-SA 3.0 US): *1,000,000*, *Letting You*, *Discipline*, *Echoplex*, *Head Down*, *The Four of Us Are Dying*, *Demon Seed*. *Lights in the Sky* è stata tolta.

**Test**, eseguiti oggi su questo Mac da una cartella temporanea:
- 19 test nativi in C del motore (`game/test/test_core.c`, clang con AddressSanitizer e UBSan): tutti passati.
- 73 test Python dei tool (`tools/tests`, unittest): tutti passati.

**Formato `.brs`, versione 4:**
- Magic `BRS1`, little-endian.
- Intestazione da 512 byte: titolo, artista, album, anno, charter, BPM; difficoltà 0–100 per strumento e livello e per la band; percentuali di accordi da 2 e 3 note; tag «Ideale per» e «Gioco»; posizione dei testi.
- Sezione chart:
  - intestazione da 264 byte;
  - lista dei battiti, con un bit per l'inizio battuta;
  - per 4 livelli × 4 strumenti, le note (12 byte: inizio, durata, corsie come bitmask quindi un accordo è più bit, flag Overdrive, frase) e le frasi (16 byte);
  - testi facoltativi (`LYR1`).
- Audio: 4 tracce (batteria, basso, chitarra, voce), 44,1 kHz stereo, compresse in QOA a blocchi di 5120 campioni. Circa 8,5 MB al minuto.

**Tasti** (in vigore dall'11/11/2026):

| Livello | Tasti, da sinistra a destra |
|---|---|
| Easy | 4: ← ↑ △ ○ |
| Medium | 6 corsie, 5 usate: ← ↑ → □ △ ○, il Cerchio non ha mai note |
| Hard ed Expert | 6: ← ↑ → □ △ ○ (Expert ha più note e finestre più strette) |

- Ogni pollice tiene un tasto o due vicini. Le canzoni fatte prima del cambio non sono state rigenerate: il gioco adatta gli accordi quando le carica.
- Select è l'Overdrive (in Easy anche → e □).
- L/R tenuti su una nota lunga fanno il vibrato.
- Giù/X cambiano traccia in modalità Band. START è la pausa.

**Finestre di colpo:** ±100 ms in Easy, ±95 in Medium, ±85 in Hard, ±75 in Expert. «Perfetta» vuol dire entro ±32 ms.

**«Lasco»:** si trova in Opzioni > «Lasco (anticipo colpi)» e corrisponde a `Settings.slack_ms`.
- Dice al gioco dove cadono in media i colpi del giocatore: negativo vuol dire in anticipo.
- Sposta solo il giudizio, non le note a schermo e non l'audio.
- Va da −100 a +100 ms, un millisecondo alla volta. Il valore di partenza è −25 ms, perché sulla PSP vera i colpi di Paolo cadevano in media a −22 ms.
- Il bot del gioco non lo usa; la corsa scriptata di `08` sì.

**Motore:**
- Input a 180 Hz su un thread dedicato.
- Mix audio a blocchi di 320 campioni (7,3 ms); l'audio fa da orologio.
- Buffer di lettura di 7,4 s.
- Il decoder QOA costa circa l'8% della CPU a 333 MHz. È una stima dal codice compilato, non una misura sulla PSP.

## Cosa è provato sulla PSP vera e cosa solo su PPSSPP

**Provato sulla PSP vera:**
- **4/11/2026:** Paolo ha giocato la build a sei corsie (formato 2) e la modalità Solo. La chitarra in Solo era «davvero bella». Il primo Medium, con L e R come corsie esterne, era ingiocabile; poi è stato sostituito.
- **9/11/2026:** Paolo ha giocato il pubblico, il tremolio, il nuovo moltiplicatore, i preferiti («Le migliori») e i brani dei Nine Inch Nails. Il suo giudizio: musica troppo bassa rispetto al pubblico e voce dei Nine Inch Nails bassissima. L'11/11 ha riferito che sulla PSP vera i suoi colpi cadevano in media a −22 ms.

**Solo su PPSSPP:**
- Note stonate, accordi di chitarra e lista ordinata per difficoltà (il README del progetto li dà come provati solo sull'emulatore).
- Tutto quello che è venuto dopo il 9 novembre:
  - il nuovo bilanciamento del mix, con le multitracce dei Nine Inch Nails rimesse ai livelli di un mix finito;
  - i suoni rock veri al posto di quelli sintetizzati;
  - Medium a sei corsie;
  - gli stessi sei tasti per Medium, Hard ed Expert;
  - il vibrato con L/R e l'Overdrive su Select;
  - l'opzione «Lasco»;
  - i testi delle canzoni a schermo, come un karaoke.

**La build di questi media (11/11, 01:45).** Secondo le note di lavoro del progetto è stata copiata sulla Memory Stick e verificata byte per byte quella notte. Oggi la Memory Stick non era collegata e non l'ho ricontrollata. Nessuno l'ha ancora giocata sulla PSP.

**Mai misurati su hardware:** latenza, uso della CPU e tempi dei frame sulla PSP sono stime.

## Crediti e licenze di ogni brano che compare

| Brano | Dove compare | Autore e licenza | Fonte |
|---|---|---|---|
| *Discipline* | 01, 02, 03–07, 09, video (audio) | Nine Inch Nails, *The Slip* (2008). CC BY-NC-SA 3.0 US. Stem e chart di BandRush sono derivati con la stessa licenza, per uso non commerciale. | Multitracce pubblicate dalla band: https://archive.org/details/NineInchNails-TheSlipMulti-trackStems, licenza https://creativecommons.org/licenses/by-nc-sa/3.0/us/ |
| *1,000,000*, *Head Down*, *Letting You*, *Demon Seed*, *The Four of Us Are Dying* | 01 (solo il titolo in lista) | Nine Inch Nails, *The Slip* (2008), CC BY-NC-SA 3.0 US | come sopra |
| *Same Boat* | 08 | Josh Woodward, CC BY 4.0 | https://www.joshwoodward.com/ |
| *To Lose The War*, *Gallows Hill*, *Shot Down*, *Omaha* | 01 (solo il titolo in lista) | Josh Woodward, CC BY 4.0 | https://www.joshwoodward.com/ |
| *Metal madness* | 01 (solo il titolo in lista) | Sectoid (Carlos Viola Iborra), musica e chart; licenza stile MIT, «Copyright (c) 2007 by Sectoid» | pacchetto Frets on Fire di Debian `fretsonfire-songs-sectoid`; testo della licenza in `songs/CREDITS.txt` del progetto |

Nell'audio del video si sentono anche suoni del gioco che non vengono dal brano:
- pubblico, bacchette del conteggio e fischio dell'ampli: BigSoundBank di Joseph Sardin, CC0 (https://bigsoundbank.com);
- gli accordi di chitarra elettrica a ogni salto del moltiplicatore: ritagliati dalla traccia di chitarra di *Internal Degeneration* di Muldjord, CC BY-SA 3.0 (www.muldjord.com).

Il cartello finale del video li elenca.

Credito pronto da incollare sotto il video:

> Musica: Nine Inch Nails, «Discipline», da *The Slip* (2008), CC BY-NC-SA 3.0 US (https://creativecommons.org/licenses/by-nc-sa/3.0/us/), multitracce su archive.org. Suoni del gioco: BigSoundBank (CC0) e accordi da «Internal Degeneration» di Muldjord (CC BY-SA 3.0). Gameplay di BandRush sull'emulatore PPSSPP; suona il bot del gioco.

**Due cose da sapere sulle licenze:**
- **NC.** La licenza dei Nine Inch Nails è non commerciale. Video, figura 09 e screenshot con il brano vanno bene su un blog senza scopo commerciale, rilasciati anche loro in CC BY-NC-SA.
- **SA.** Nel video la clausola «condividi allo stesso modo» vale sia per i Nine Inch Nails (BY-NC-SA) sia per gli accordi di Muldjord (BY-SA), e le due licenze non coincidono. Gli accordi sono frammenti di pochi decimi di secondo. Gli effetti del gioco non seguono l'opzione «Pubblico», quindi dal gioco non si possono spegnere. Se vuoi un video senza nessun dubbio, va rifatto con l'audio montato a parte, senza quegli accordi.

## Limiti

- **La schermata dei risultati non viene dal bot.** L'autotest del bot non arriva mai ai risultati, perché finisce senza passare dai menu. Così ho usato i menu veri, con 61 pressioni di tasto calcolate dal chart di *Same Boat* (Easy, Solo Drums, 65 note), messe a tempo con una corsa di misura.
  - Il gioco legge al massimo 64 tasti e 1023 byte di `autotest.cfg`, quindi le ultime 4 note non sono state premute.
  - Il primo tentativo è arrivato in media 31 ms in ritardo, con 13 820 punti e il consiglio di calibrazione a schermo; il secondo è quello pubblicato.
  - «NUOVO RECORD» compare perché il primo tentativo aveva lasciato un record nell'emulatore.
- **Corsa senza giocatore.** Esiste anche una schermata dei risultati di una corsa senza nessun tasto: «BAND KO» dopo 41 note, 0 punti. Non è nel pacchetto.
- **Figura 09.** Il codice attuale della pipeline (11/11) riproduce esattamente il file di *Discipline* spedito il 9/11 per i tempi di tutte le note e per le corsie di Easy e Medium. In Hard ed Expert sceglierebbe corsie diverse: per 451 note su 701 in Hard e 560 su 936 in Expert. Il motivo è che il charting è cambiato per i sei tasti, mentre i brani dei Nine Inch Nails apposta non sono stati rigenerati: il gioco adatta gli accordi quando li carica. La figura mostra le corsie che il gioco usa davvero.
- **Lista canzoni.** Sulla PSP la lista contiene tutte le canzoni caricate, quindi ordine e conteggio sono diversi da quelli di `01`.
