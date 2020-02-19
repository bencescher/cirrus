import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import db from '../firebase/init'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentWeather: {},
    changeCode: '',
    hazards: []
  },
  mutations: {
    'GET_WEATHER' (state, cityId) {
      state.currentWeather = {}
      state.hazards = []

      db.collection('weathercards').doc(cityId).get()
      .then(storedWeather => {
        const currentTime = new Date().getTime()
        let convertWindDirection = deg => {
          if (deg < 11.25 || deg >= 348.75) {
            return 'N'
          } else if (deg < 33.75) {
            return 'NNE'
          } else if (deg < 56.25) {
            return 'NE'
          } else if (deg < 78.75) {
            return 'ENE'
          } else if (deg < 101.25) {
            return 'E'
          } else if (deg < 123.75) {
            return 'ESE'
          } else if (deg < 146.25) {
            return 'SE'
          } else if (deg < 168.75) {
            return 'SSE'
          } else if (deg < 191.25) {
            return 'S'
          } else if (deg < 213.75) {
            return 'SSW'
          } else if (deg < 236.25) {
            return 'SW'
          } else if (deg < 258.75) {
            return 'WSW'
          } else if (deg < 281.25) {
            return 'W'
          } else if (deg < 303.75) {
            return 'WNW'
          } else if (deg < 326.25) {
            return 'NW'
          } else if (deg < 348.75) {
            return 'NNE'
          }
        }
        let convertData = rawData => {
          // determine day phase based on current time and sunrise/sunset
          if (rawData.sunrise * 1000 > currentTime || rawData.sunset * 1000 < currentTime ) {
            state.currentWeather.dayPhase = 'night'
          } else {
            state.currentWeather.dayPhase = 'day'
          }
          // converting timestamps to date format
          rawData.sunrise = new Date(rawData.sunrise * 1000)
          rawData.sunset = new Date(rawData.sunset * 1000)

          state.currentWeather.cityName = rawData.city
          state.currentWeather.tempCurrent = Math.round(rawData.tempcurrent)
          state.currentWeather.tempMin = Math.round(rawData.tempmin)
          state.currentWeather.tempMax= Math.round(rawData.tempmax)
          state.currentWeather.condition = rawData.condition
          state.currentWeather.description = rawData.description.charAt(0).toUpperCase() + rawData.description.slice(1).toLowerCase()
          state.currentWeather.humidity = rawData.humidity
          state.currentWeather.windSpeed = rawData.windspeed
          state.currentWeather.windDirection = convertWindDirection(rawData.winddirection)
          state.currentWeather.pressure = rawData.pressure
          state.currentWeather.sunrise = rawData.sunrise.toTimeString().slice(0,5)
          state.currentWeather.sunset = rawData.sunset.toTimeString().slice(0,5)
          state.currentWeather.uvindex = 'n/a'

          checkHazard(rawData)

          state.changeCode = Math.random()
        }
        let checkHazard = rawData => {
          // RULES FOR HAZARDOUS WEATHER
          // min/max temperatures
          if (rawData.tempmin < -10) {
            state.hazards.push({
              category: 'cold',
              text: 'Possibility of very low temperature'
            })
          }
          if (rawData.tempmax > 35) {
            state.hazards.push({
              category: 'heat',
              text: 'Possibility of very hot temperature'
            })
          }
          // current temperature
          if (rawData.tempcurrent < -10) {
            state.hazards.push({
              category: 'cold',
              text: 'Very low temperature'
            })
          } else if (rawData.tempcurrent > 35) {
            state.hazards.push({
              category: 'heat',
              text: 'Very hot temperature'
            })
          }
          // wind speed
          if (rawData.windspeed > 10) {
            state.hazards.push({
              category: 'wind',
              text: 'Very windy weather'
            })
          }
          // UV index
          if (rawData.uvindex > 7) {
            state.hazards.push({
              category: 'uv',
              text: 'Very high UV index'
            })
          }
          // condition
          if (rawData.condition === 'Thunderstorm') {
            state.hazards.push({
              category: 'storm',
              text: 'Stormy weather'
            })
          }
        }
        
        if (currentTime - storedWeather.data().timestamp > 1800000) {
          axios.get('https://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&units=metric&APPID=' + process.env.VUE_APP_OWM_APIKEY)
            .then(res => {
              let weatherData = res.data
              // wind direction can be empty
              if (weatherData.wind.deg === undefined) {
                weatherData.wind.deg = 'n/a'
              }
              // update timestamp and database
              db.collection('weathercards').doc(cityId).update({
                timestamp: currentTime,
                tempcurrent: weatherData.main.temp,
                tempmax: weatherData.main.temp_max,
                tempmin: weatherData.main.temp_min,
                pressure: weatherData.main.pressure,
                humidity: weatherData.main.humidity,
                windspeed: weatherData.wind.speed,
                winddirection: weatherData.wind.deg,
                sunrise: weatherData.sys.sunrise,
                sunset: weatherData.sys.sunset,
                condition: weatherData.weather[0].main,
                description: weatherData.weather[0].description
              })
                .then(() => {
                  db.collection('weathercards').doc(cityId).get()
                    .then(updatedData => {
                      convertData(updatedData.data())
                    })
                })
                .catch(() => {
                  convertData(storedWeather.data())
                })
            })
            .catch(() => convertData(storedWeather.data()))
        } else {
          convertData(storedWeather.data())
        }
      })
    }
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    initWeather: ({ commit }, cityId) => {
      commit('GET_WEATHER', cityId)
    }
  },
  getters: {
    weather: state => {
      return state.currentWeather
    },
    changeIndicator: state => {
      return state.changeCode
    },
    hazards: state => {
      return state.hazards
    }
  }
})
