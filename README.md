# Unde e Bubu?

Joc de Crăciun pentru clasa pregătitoare (6–7 ani), pentru exersat **clicul**. Copilul nu trebuie să citească nimic.

Bubu se joacă de-a v-ați ascunselea în zece locuri, pe rând unul în casă și unul afară: **casa cu bradul** 🏠, **pădurea înzăpezită** 🌲, **bucătăria** 🍪, **piața satului** 🏘️, **atelierul lui Moș Crăciun** 🎁, **lacul înghețat** ⛸️, **grajdul renilor** 🦌, **țara dulciurilor** 🍭, **clasa** 🏫 și **Polul Nord** 🐧. Ninge doar în locurile de afară. În fiecare loc se ascunde de 3 ori, de fiecare dată după alt lucru: brad, ciorap, perdea, omul de zăpadă, căsuța din pădure, frigider, oală, cufăr, sac, butoi, baloți de fân, iglu, cutia poștală a lui Moș Crăciun, acadea, căsuța din turtă dulce, tort, catedră, ghiozdan… Copilul face clic pe lucruri:

- dacă acolo nu e Bubu, iese pentru o clipă un alt prieten (o pisicuță, o vulpiță, un ursuleț…);
- dacă acolo e Bubu, ea iese, iar o steluță zboară sus.

Apoi se stinge lumina 🙈 și Bubu se ascunde în alt loc. După 3 steluțe se trece în locul următor. Sunt 30 de runde și un nivel durează cam 9–10 minute. La final, toți prietenii ies să petreacă împreună cu Bubu și apare „Crăciun fericit!”.

Din clipa în care se aprinde lumina, Bubu trage cu ochiul de după ascunzătoare și se leagănă puțin. Restul ei rămâne ascuns.

Jocul are **3 niveluri**, ca acei copii care termină repede să nu se plictisească. Nivelul se vede în cercul colorat din stânga sus (1, 2, 3):

1. Lui Bubu i se văd căciulița roșie și creștetul capului (ochii nu).
2. Bubu se ascunde și mai bine: i se vede doar vârful căciuliței.
3. La fel de ascunsă ca la nivelul 2, dar la fiecare câteva secunde se pitește și fuge în altă ascunzătoare.

La finalul unui nivel apare jos un buton mare, verde, cu Bubu, o săgeată ▶ și steluțele nivelului următor (⭐⭐ sau ⭐⭐⭐). Butonul pornește nivelul următor. După nivelul 3, butonul are 🔁 și jocul o ia de la capăt, cu nivelul 1. Butonul ▶ de pe ecranul de start pornește tot nivelul 1.

Jocul nu are mânuță care să arate unde trebuie dat clic, nu are sunet, nu are cronometru și nu se poate greși.

## Pentru profesor

Butonul **📖** din colțul din stânga jos deschide **povestea** (4 pagini cu text mare), pe care o poți citi la tablă. Paginile se schimbă cu săgețile de pe ecran sau de la tastatură. Butonul verde de pe ultima pagină pornește jocul.

## Pentru testare

Nivelul și planșa de început se pot alege din adresă, cu `nivel` (1–3) și `plansa` (1–10), de exemplu:

```
index.html?nivel=3&plansa=9
```

Butonul ▶ pornește atunci direct nivelul 3, de la planșa 9 (clasa). Fără acești parametri, jocul începe ca de obicei, cu nivelul 1 și planșa 1. Planșele sunt, în ordine: 1 casa cu bradul, 2 pădurea, 3 bucătăria, 4 piața satului, 5 atelierul, 6 lacul, 7 grajdul, 8 țara dulciurilor, 9 clasa, 10 Polul Nord.

## Tehnic

HTML + CSS + JavaScript, fără biblioteci și fără sunet. Desenele se fac pe un canvas de 1600×900, scalat după ecran. Fundalul continuă până la marginile ecranului, deci jocul umple tot ecranul, fără benzi negre, iar ascunzătorile rămân întregi pe orice ecran.

```
js/engine.js   canvas, buclă, clicuri, ninsoare, scântei, mânuța
js/art.js      desene: Bubu, bradul, cadourile, omul de zăpadă…
js/game.js     jocul (cele zece locuri și ascunzătorile lor)
js/main.js     ecranul de start, povestea, butoanele
```

`engine.js` și `art.js` sunt aceleași (copiate) ca în „Sania lui Bubu” și „Bubu salvează Crăciunul”, ca fiecare joc să poată fi publicat separat.
