'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat. long ]
    this.distance = distance; // in Km
    this.duration = duration; // Mins
  }

  calcSpeed() {}
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

const run1 = new Running([26.130483570566426, 91.78048252964005], 10, 1, 20);
const cyc1 = new Cycling([26.129162314232033, 91.777435540819], 150, 2, 0);

///////////////////////////////
//APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getPosition(); //since the constructor is called immediately when the page loads

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevField.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("couldn't find your location");
        }
      );
  }
  _loadMap(position) {
    //   console.log(position.coords);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //   console.log(longitude, latitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const validInput = (...inputs) =>
      inputs.every(numEl => Number.isFinite(numEl));

    const allPositive = (...num) => num.every(n => n > 0);

    e.preventDefault();

    // 1. Get data from the form

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // 2. Check if the data is valid
    // 3. If workout is running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('value must be a positive number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // 4. If workout is cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //check here as well
      if (
        !validInput(distance, duration, elevation) ||
        !validInput(distance, duration)
      )
        return alert('values must be a positive number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // 5. Add new Object to workout Array
    this.#workout.push(workout);
    // console.log(workout);

    // 6. Render workout marker on map
    this.renderWorkoutMarker(workout);

    // 7. Render workout on list

    // 8. Hide form & clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
  renderWorkoutMarker(workout) {
    console.log(workout.coords);

    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.type)
      .openPopup();
  }
}

const app = new App();
