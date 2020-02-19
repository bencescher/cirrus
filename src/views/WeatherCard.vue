<template>
  <section class="card" :class="getClass()">
    <header class="header">
      <div class="title">
        <h3>{{ actualWeather.description }}</h3>
      </div>
      <div class="header__left">
        <p>Min<br/>{{ actualWeather.tempMin }}°C</p>
      </div>
      <div class="header__right">
        <p>Max<br/>{{ actualWeather.tempMax }}°C</p>
      </div>
    </header>
    <section class="hazard">
      <div v-for="(hazard, index) in hazards" :key="index" :hazard="hazard" class="hazard__alert">
        <i class="fas fa-exclamation-triangle"></i> {{ hazard.text }}
      </div>
    </section>
    <section class="main">
      <div class="main__side main__front">
        <h1>{{ actualWeather.tempCurrent }}°C</h1>
        <h2>{{ actualWeather.cityName }}</h2>
        <button class="btn-flipcard">
          <i class="fas fa-redo-alt"></i>
        </button>
      </div>
      <div class="main__side main__back">
        <div class="main__back--left">
          <h1>
            <i v-if="actualWeather.condition === 'Clear' && actualWeather.dayPhase === 'day'" class="fas fa-sun"></i>
            <i v-else-if="actualWeather.condition === 'Clear' && actualWeather.dayPhase === 'night'" class="fas fa-moon"></i>
            <i v-else-if="actualWeather.condition === 'Clouds' && actualWeather.dayPhase === 'day'" class="fas fa-cloud-sun"></i>
            <i v-else-if="actualWeather.condition === 'Clouds' && actualWeather.dayPhase === 'night'" class="fas fa-cloud-moon"></i>
            <i v-else-if="actualWeather.condition === 'Rain'" class="fas fa-cloud-rain"></i>
            <i v-else-if="actualWeather.condition === 'Drizzle'" class="fas fa-cloud-showers-heavy"></i>
            <i v-else-if="actualWeather.condition === 'Thunderstorm'" class="fas fa-bolt"></i>
            <i v-else-if="actualWeather.condition === 'Fog' || actualWeather.condition === 'Mist' || actualWeather.condition === 'Haze'" class="fas fa-smog"></i>
            <i v-else-if="actualWeather.condition === 'Snow'" class="far fa-snowflake"></i>
          </h1>
          <p class="description">{{ actualWeather.condition }}</p>
        </div>
        <div class="main__back--right">
          <p>Humidity: {{ actualWeather.humidity }}%</p>
          <p>Wind: {{ actualWeather.windSpeed }}km/h {{ actualWeather.windDirection }}</p>
          <p>Pressure: {{ actualWeather.pressure }} hPa</p>
          <p>UV index: {{ actualWeather.uvindex }}</p>
          <p>Sunrise: {{ actualWeather.sunrise }}</p>
          <p>Sunset: {{ actualWeather.sunset }}</p>
        </div>
      </div>
    </section>
    <footer class="footer">
      <router-link to="/" tag="button" class="btn btn-light btn-back"><i class="fas fa-arrow-left"></i></router-link>
    </footer>
  </section>
</template>

<script>
export default {
  data() {
    return {
      cityId: this.$route.params.city,
      actualWeather: {},
      hazards: []
    }
  },
  created() {
    window.scrollTo(0,0)
    this.$store.dispatch('initWeather', this.cityId)
  },
  watch: {
    '$store.getters.changeIndicator': function() {
      this.actualWeather = this.$store.getters.weather
      this.hazards = this.$store.getters.hazards
    }
  },
  methods: {
    getClass() {
      if (this.actualWeather.condition) {
        if (this.actualWeather.condition === 'Haze') {
          return 'mist'
        } else if (this.actualWeather.condition === 'Clear') {
          if (this.actualWeather.dayPhase === 'day') {
            return 'clear__day'
          } else {
            return 'clear__night'
          }
        } 
        else {
          return this.actualWeather.condition.toLowerCase()
        }
      } else {
        return ''
      }
    }
  }
}
</script>
