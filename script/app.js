let KEY = "2784376f43f24035bfe51ea8f4a4ced9";

// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const time = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = time.getHours().toString();
  // Minutes part from the timestamp
  const minutes = time.getMinutes().toString();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`; //  als hours of minutes geen 2 tekens lang is gaat hij dit aanvullen met nullen tot dit wel zo is
}

// 5 TODO: maak updateSun functie
const updateSun = (sunElement, left, bottom, now) => {
  sunElement.style.left = `${left}%`;
  sunElement.style.bottom = `${bottom}%`;

  const currentTimeStamp = `${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  sunElement.setAttribute("data-time", currentTimeStamp);
};

let itBeNight = () => {
  document.querySelector("html").classList.add("is-night");
};

let itBeDay = () => {
  document.querySelector("html").classList.remove("is-night");
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const sun = document.querySelector(".js-sun");
  const minutesLeft = document.querySelector(".js-time-left");

  // Bepaal het aantal minuten dat de zon al op is.
  const now = new Date();
  let currentTimeInSeconds = Math.round(Date.now() / 1000); //unix timestamp in seconds
  let minutesSunUp = (currentTimeInSeconds - sunrise) / 60; //sunUpTime berekenen in minuten

  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  // Bekijk of de zon niet nog onder of reeds onder is
  if (minutesSunUp > totalMinutes) {
    itBeNight();
  } else if (minutesSunUp < 0) {
    //kijken of de zon al op is
    itBeNight();
  }
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  else {
    itBeDay();
  }
  const sunLeft = (100 / totalMinutes) * minutesSunUp; //in percentage
  const sunBottom = sunLeft < 50 ? sunLeft * 2 : (100 - sunLeft) * 2;
  //korte if else
  // condition ? true : false;
  updateSun(sun, sunLeft, sunBottom, now);
  document.querySelector("body").classList = "is-loaded";

  // Vergeet niet om het resterende aantal minuten in te vullen.
  let minutesSunLeft = totalMinutes - minutesSunUp;
  if (minutesSunLeft < 0) {
    minutesSunLeft = 0;
  }
  minutesLeft.innerText = Math.round(minutesSunLeft);
  
  // Nu maken we een functie die de zon elke minuut zal updaten
  const t = setInterval(() => {
    // Bekijk of de zon niet nog onder of reeds onder is
    if (minutesSunUp > totalMinutes) {
      clearInterval(t);
      itBeNight();
    } else if (minutesSunUp < 0) {
      //kijken of de zon al op is
      itBeNight();
    }
    // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
    else {
      itBeDay();
      const sunLeft = (100 / totalMinutes) * minutesSunUp;
      const sunBottom = sunLeft < 50 ? sunLeft * 2 : (100 - sunLeft) * 2;

      //ps vergeet weer niet om het resterend aantal minuten te berekenen
      updateSun(sun, sunLeft, sunBottom, now);

      let minutesSunLeft = totalMinutes - minutesSunUp;
      if (minutesSunLeft < 0) {
        minutesSunLeft = 0;
      }
      minutesLeft.innerText = Math.round(minutesSunLeft);
      minutesSunUp++;
    }
  }, 60000); //in ms

  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  document.querySelector(
    ".js-location"
  ).innerText = `${queryResponse.city.name}, ${queryResponse.city.country}`;
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  document.querySelector(
    ".js-sunrise"
  ).innerText = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
  document.querySelector(
    ".js-sunset"
  ).innerText = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  const timeDifference =
    (queryResponse.city.sunset - queryResponse.city.sunrise) / 60; //api geeft weer in seconde, /60 voor minuten
  placeSunAndStartMoving(timeDifference, queryResponse.city.sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric&lang=nl&cnt=1`;
  // Met de fetch API proberen we de data op te halen.
  const data = await fetch(url)
    .then((res) => res.json())
    .catch((err) => console.error(err));
  //console.log(data);
  // Als dat gelukt is, gaan we naar onze showResult functie.
  showResult(data);
};

document.addEventListener("DOMContentLoaded", function () {
  // 1 We will query the API with longitude and latitude.
  getAPI(51.127903, 3.323636);
});