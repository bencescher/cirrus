import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentWeather: {},
    changeCode: '',
    hazards: []
  },
  mutations: {
    'GET_WEATHER' (state, cityId) {
      // clear previous weather data
      state.currentWeather = {}
      state.hazards = []

      const currentTime = new Date().getTime()

      // convert wind direction from degrees into abbrevations
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

      // determine hazardous weather conditions
      let checkHazard = dataToCheck => {
        // RULES FOR HAZARDOUS WEATHER
        // min/max temperatures
        if (dataToCheck.tempMin < -10) {
          state.hazards.push({
            category: 'cold',
            text: 'Possibility of very low temperature'
          })
        }
        if (dataToCheck.tempMax > 35) {
          state.hazards.push({
            category: 'heat',
            text: 'Possibility of very hot temperature'
          })
        }
        // current temperature
        if (dataToCheck.tempCurrent < -10) {
          state.hazards.push({
            category: 'cold',
            text: 'Very low temperature'
          })
        } else if (dataToCheck.tempCurrent > 35) {
          state.hazards.push({
            category: 'heat',
            text: 'Very hot temperature'
          })
        }
        // wind speed
        if (dataToCheck.windSpeed > 8) {
          state.hazards.push({
            category: 'wind',
            text: 'Very windy weather'
          })
        }
        // UV index
        if (dataToCheck.uvindex > 7) {
          state.hazards.push({
            category: 'uv',
            text: 'Very high UV index'
          })
        }
        // condition
        if (dataToCheck.condition === 'Thunderstorm') {
          state.hazards.push({
            category: 'storm',
            text: 'Stormy weather'
          })
        }
      }
        
      axios.get('https://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&units=metric&APPID=' + process.env.VUE_APP_OWM_APIKEY)
        .then(res => {
          let weatherData = res.data

          // handle missing wind direction
          if (weatherData.wind.deg === undefined) {
            weatherData.wind.deg = 'n/a'
          }

          state.changeCode                    = Math.random()

          state.currentWeather.timestamp      = currentTime
          state.currentWeather.cityName       = weatherData.name
          state.currentWeather.tempCurrent    = Math.round(weatherData.main.temp)
          state.currentWeather.tempMax        = Math.round(weatherData.main.temp_max)
          state.currentWeather.tempMin        = Math.round(weatherData.main.temp_min)
          state.currentWeather.pressure       = weatherData.main.pressure
          state.currentWeather.humidity       = weatherData.main.humidity
          state.currentWeather.windSpeed      = weatherData.wind.speed
          state.currentWeather.windDirection  = convertWindDirection(weatherData.wind.deg)
          state.currentWeather.sunrise        = (new Date(weatherData.sys.sunrise*1000)).toTimeString().slice(0,5)
          state.currentWeather.sunset         = (new Date(weatherData.sys.sunset*1000)).toTimeString().slice(0,5)
          state.currentWeather.condition      = weatherData.weather[0].main
          state.currentWeather.description    = weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1).toLowerCase()
          state.currentWeather.uvindex = 'n/a'

          // determine day phase based on current time and sunrise/sunset
          if (weatherData.sys.sunrise * 1000 > currentTime || weatherData.sys.sunset * 1000 < currentTime ) {
            state.currentWeather.dayPhase = 'night'
          } else {
            state.currentWeather.dayPhase = 'day'
          }

          checkHazard(state.currentWeather)

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
    futureWeather: state => {
      return state.futureWeather
    },
    changeIndicator: state => {
      return state.changeCode
    },
    hazards: state => {
      return state.hazards
    }
  }
})
