# Unde e Bubu?

Joc de Crăciun pentru clasa pregătitoare (6–7 ani), pentru exersat **clicul**. Copilul nu trebuie să citească nimic.

Bubu se joacă de-a v-ați ascunselea în opt locuri, pe rând unul în casă și unul afară: **casa cu bradul** 🏠, **pădurea înzăpezită** 🌲, **bucătăria** 🍪, **piața satului** 🏘️, **atelierul lui Moș Crăciun** 🎁, **lacul înghețat** ⛸️, **grajdul renilor** 🦌 și **Polul Nord** 🐧. Ninge doar în locurile de afară. În fiecare loc se ascunde de 3 ori, de fiecare dată după alt lucru: brad, ciorap, perdea, omul de zăpadă, căsuța din pădure, frigider, oală, cufăr, sac, butoi, baloți de fân, iglu, cutia poștală a lui Moș Crăciun… Copilul face clic pe lucruri:

- dacă acolo nu e Bubu, iese pentru o clipă un alt prieten (o pisicuță, o vulpiță, un ursuleț…);
- dacă acolo e Bubu, ea iese, iar o steluță zboară sus.

Apoi se stinge lumina 🙈 și Bubu se ascunde în alt loc. După 3 steluțe se trece în locul următor. Sunt 24 de runde în total și jocul durează cam 7–8 minute. La final, toți prietenii ies să petreacă împreună cu Bubu și apare „Crăciun fericit!”. Butonul 🔁 pornește jocul din nou.

Din clipa în care se aprinde lumina, Bubu trage cu ochiul de după ascunzătoare: i se văd căciulița roșie și creștetul capului (ochii nu), iar restul ei rămâne ascuns. Ea se leagănă puțin. Așa jocul are o dificultate medie. Jocul nu are mânuță care să arate unde trebuie dat clic, nu are sunet, nu are cronometru și nu se poate greși.

## Pentru profesor

Butonul **📖** din colțul din stânga jos deschide **povestea** (4 pagini cu text mare), pe care o poți citi la tablă. Paginile se schimbă cu săgețile de pe ecran sau de la tastatură. Butonul verde de pe ultima pagină pornește jocul.

## Tehnic

HTML + CSS + JavaScript, fără biblioteci și fără sunet. Desenele se fac pe un canvas de 1600×900, scalat după ecran. Fundalul continuă până la marginile ecranului, deci jocul umple tot ecranul, fără benzi negre, iar ascunzătorile rămân întregi pe orice ecran.

```
js/engine.js   canvas, buclă, clicuri, ninsoare, scântei, mânuța
js/art.js      desene: Bubu, bradul, cadourile, omul de zăpadă…
js/game.js     jocul (cele opt locuri și ascunzătorile lor)
js/main.js     ecranul de start, povestea, butoanele
```

`engine.js` și `art.js` sunt aceleași (copiate) ca în „Sania lui Bubu” și „Bubu salvează Crăciunul”, ca fiecare joc să poată fi publicat separat.
