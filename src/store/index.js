import Vue from 'vue'
import Vuex from 'vuex'
import vocabulary from 'phaidra-vue-components/src/store/modules/vocabulary'
import search from './modules/search'
import config from '../config/theke'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    instanceconfig: {
      api: '',
      solr: '',
      baseurl: ''
    },
    appconfig: {
      suggesters: {}
    },
    /*
    settings: {
      instance: {
        api: '',
        solr: ''
      },
      global: {
        suggesters: {}
      }
    },
    */
    user: {
      username: '',
      token: ''
    },
    alerts: {
      alerts: []
    }
  },
  mutations: {
    setAlerts (state, alerts) {
      state.alerts.alerts = alerts
    },
    clearAlert (state, alert) {
      state.alerts.alerts = state.alerts.alerts.filter(e => e !== alert)
    },
    setUsername (state, username) {
      state.user.username = username
    },
    clearUser (state) {
      state.user.username = '',
      state.user.token = ''
    },
    setToken (state, token) {
      state.user.token = token
    },
    initStore (state) {
      state.user.username = '',
      state.user.token = '',
      state.alerts.alerts = []
    },
    initSettings (state) {
      state.instanceconfig = config.instances[config.defaultinstance]
      state.appconfig = config.global
    },
    clearUser (state) {
      state.settings.username = '',
      state.settings.token = ''
    },
    setInstanceApi (state, api) {
      state.instanceconfig.api = api
    },
    setInstanceSolr (state, solr) {
      state.instanceconfig.solr = solr
    },
    setSuggester (state, data) {
      Vue.set(state.appconfig.suggesters, data.suggester, data.url)
    }
  },
  actions: {
    initSettings ({ commit, rootState }) {
      commit('initSettings', rootState)
    },
    login ({ commit, dispatch, state, rootState }, credentials) {
      return new Promise((resolve, reject) => {
        commit('initStore')

        commit('setUsername', credentials.username)

        fetch(rootState.instanceconfig.api + '/signin', {
          method: 'GET',
          mode: 'cors',
          headers: {
            Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
          }
        })
          .then(function (response) { return response.json() })
          .then(function (json) {
            if (json.alerts && json.alerts.length > 0) {
              commit('setAlerts', json.alerts)
            }
            if (json.status === 200) {
              commit('setToken', json['XSRF-TOKEN'])
              document.cookie = 'X-XSRF-TOKEN=' + json['XSRF-TOKEN']
            }

            dispatch('initSearch')
          })
          .catch(function (error) {
            console.log(error)
            reject()
          })
      })
    },
    logout ({ commit, dispatch, state, rootState }) {
      return new Promise((resolve, reject) => {
        fetch(rootState.instanceconfig.api + '/signout', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'X-XSRF-TOKEN': state.token
          }
        })
          .then(function (response) { return response.json() })
          .then(function (json) {
            commit('initStore')
            dispatch('initSearch')
            resolve()
          })
          .catch(function (error) {
            console.log(error)
            commit('initStore')
            dispatch('initSearch')
            resolve()
          })
      })
    }
  },
  modules: {
    search,
    vocabulary
  },
  strict: debug
})
