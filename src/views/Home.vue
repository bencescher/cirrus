<template>
  <div class="home">
    <h1 class="light">Cirrus</h1>
    <form class="form">
      <div class="form__group">
        <input v-model="city" id="city" type="text" class="form__input" placeholder="Search for a city">
        <label for="city" class="form__label">Search for a city</label>
      </div>
      <div class="form__group">
        <button class="btn btn-light" @click.prevent="getCity()">Get weather</button>
      </div>
    </form>
  </div>
</template>

<script>
import citylist from '../store/citylist'

export default {
  name: 'home',
  data() {
    return {
      city: '',
      cities: citylist
    }
  },
  created() {
    window.scrollTo(0,0)
  },
  methods: {
    getCity() {
      // format input and reroute to '/weather' if it matches any citiy in the database
      let cityName = ''
      let cityId = ''
      
      cityName = this.city.charAt(0).toUpperCase() + this.city.slice(1).toLowerCase()

      this.cities.forEach(city => {
        if (city.name === cityName) {
          cityId = city.id
        }
      })
      
      if (cityId) {
        this.$router.push({name: 'weather', params: { city: cityId }})
      } else {
        alert('Sorry, but there is no weather data for the city ' + cityName + '. Please try another one!')
      }
    }
  }
}
</script>
