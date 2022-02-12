// Google objects
let map, panorama, sv, candidate, timer;

// initialize answer and guess objects
let answer;
let guess;
let cities;
let guessed = [];

function initialize() {
  d3.json(`/files/subset.json?rand=${Math.random()}`).then(function (data) {
    cities = data
    makeMap()
  })
}

function makeMap() {
  resetTimer()
  sv = new google.maps.StreetViewService();
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("pano"), {
      showRoadLabels: false,
  });
  sv.getPanorama({
    location: randomLocation(),
    radius: 50,
    preference: "best"
  }, processSVData);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function loc(x_origin, y_origin, rad) {
  let x_offset, y_offset
  x_offset = random(-rad, rad)
  y_offset = random(-rad,rad)
  return {lat: x_origin + x_offset, lng: y_origin + y_offset}
}

function randomLocation() {
  const city = cities[parseInt(random(0, cities.length))]
  const shortName = city.name.substring(0, city.name.indexOf(","));
  candidate = ({ name: shortName.toLowerCase(), score: null })
  cities = cities.filter(c => c.name !== city.name)
  return loc(city.lat, city.lng, 0.025)
}

function processSVData(data, status) {
  if (status === "OK") {
    guessed.push(candidate)
    setTimeout(() => {
      answer = panorama.location.description
    }, 500);

    panorama.setPano(data.location.pano);
    panorama.setPov({
      heading: 0,
      pitch: 0
    });
  } else {
    sv.getPanorama({
      location: randomLocation(),
      radius: 5000
    }, processSVData);
  }
}

function finish() {
  timer = ""
  document.getElementById("countdown").style.display = 'none';
  document.getElementById("guess").style.display = 'none';
  document.getElementById("submit").style.display = 'none';
  document.getElementById("well-done").innerHTML  = 'you did it!';
}

function addToList() {
  let u = `city-${guessed.length}`
  let v = `score-${guessed.length}`
  document.getElementById(u).innerHTML = guessed[guessed.length - 1].name
  document.getElementById(v).innerHTML = guessed[guessed.length - 1].score.toString()
  if (guessed.length === 10) {
    finish()
  } else {
    makeMap()
  }
}

function guessTheCity(e){
  const answer = document.getElementById("guess").value.toLowerCase()
  let score
  if (answer === guessed[guessed.length - 1 ].name) {
    score = timer > 60 ? 100 : parseInt(timer / 0.60)
    timer = '';
    guessed[guessed.length - 1 ].score = score
    document.getElementById("countdown").innerHTML = ""
    total()
    next()
  }
 }

function total() {
  let total = guessed.map(li => li.score).reduce((sum, val) => sum + val, 0);
  if (total === null) {
    total = 0
  }
  document.getElementById('total').innerHTML = total
}

function startTimer() {
    let minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("countdown").innerHTML = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = '';
            next()
        }
    }, 1000);
}

function resetTimer() {
  timer = 75
}

function next(){
  if (guessed[guessed.length - 1 ].score == null) {
    guessed[guessed.length - 1 ].score = 0
  }
  document.getElementById("answer").innerHTML = ''
  document.getElementById("guess").value = ''
  addToList()
  total()
}

startTimer()
