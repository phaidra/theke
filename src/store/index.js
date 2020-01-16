import Vue from 'vue'
import Vuex from 'vuex'
import vocabulary from 'phaidra-vue-components/src/store/modules/vocabulary'
import search from './modules/search'
import config from '../config/theke'
import axios from 'axios'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    instanceconfig: {
      api: '',
      solr: '',
      baseurl: '',
      institution: '',
      impressum: {
        orgname: ''
      }
    },
    appconfig: {
      suggesters: {}
    },
    user: {
      username: '',
      token: ''
    },
    alerts: {
      alerts: []
    },
    breadcrumbs: []
  },
  mutations: {
    updateBreadcrumbs (state, transition) {
      let pagetitle
      state.breadcrumbs = [
        {
          text: config.instances[config.defaultinstance].institution,
          external: true,
          to: 'https://www.univie.ac.at'
        },
        {
          text: config.instances[config.defaultinstance].impressum.orgname,
          external: true,
          to: 'https://romanistik.univie.ac.at/'
        },
        {
          text: config.global.breadcrumbsname,
          to: '/'
        }
      ]
      if (transition.to.name === 'detail') {
        pagetitle = 'Detail ' + transition.to.params.pid
        state.breadcrumbs.push(
          {
            text: pagetitle,
            to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
            disabled: true
          }
        )
      }
      if (transition.to.name === 'edit') {
        pagetitle = 'Edit ' + transition.to.params.pid
        if (transition.from.name === 'detail') {
          state.breadcrumbs.push(
            {
              text: 'Detail ' + transition.from.params.pid,
              to: { name: transition.from.name, params: { pid: transition.from.params.pid } }
            }
          )
        }
        state.breadcrumbs.push(
          {
            text: pagetitle,
            to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
            disabled: true
          }
        )
      }
      if (transition.to.name === 'addmember') {
        pagetitle = 'Add member ' + transition.to.params.pid
        if (transition.from.name === 'detail') {
          state.breadcrumbs.push(
            {
              text: 'Detail ' + transition.from.params.pid,
              to: { name: transition.from.name, params: { pid: transition.from.params.pid } }
            }
          )
        }
        state.breadcrumbs.push(
          {
            text: pagetitle,
            to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
            disabled: true
          }
        )
      }
      if (transition.to.name === 'manage') {
        pagetitle = 'Manage ' + transition.to.params.pid
        if (transition.from.name === 'detail') {
          state.breadcrumbs.push(
            {
              text: 'Detail ' + transition.from.params.pid,
              to: { name: transition.from.name, params: { pid: transition.from.params.pid } }
            }
          )
        }
        state.breadcrumbs.push(
          {
            text: pagetitle,
            to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
            disabled: true
          }
        )
      }
      if (transition.to.name === 'submit') {
        pagetitle = 'Submit'
        state.breadcrumbs.push(
          {
            text: pagetitle,
            disabled: true
          }
        )
      }
      if (transition.to.name === 'contact') {
        pagetitle = 'Contact'
        state.breadcrumbs.push(
          {
            text: pagetitle,
            disabled: true
          }
        )
      }
      if (transition.to.name === 'impressum') {
        pagetitle = 'Impressum'
        state.breadcrumbs.push(
          {
            text: pagetitle,
            disabled: true
          }
        )
      }
  
      if (pagetitle) {
        state.pagetitle = state.appconfig.name + ' - ' + pagetitle
      } else {
        state.pagetitle = state.appconfig.name
      }
  
      if (process.browser) {
        document.title = state.pagetitle
      }
    },
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
      state.user.username = ''
      state.user.token = ''
    },
    setToken (state, token) {
      state.user.token = token
    },
    setLoginData (state, logindata) {
      Vue.set(state.user, 'username', logindata.username)
      Vue.set(state.user, 'firstname', logindata.firstname)
      Vue.set(state.user, 'lastname', logindata.lastname)
      Vue.set(state.user, 'email', logindata.email)
      Vue.set(state.user, 'org_units_l1', logindata.org_units_l1)
      Vue.set(state.user, 'org_units_l2', logindata.org_units_l2)
    },
    initStore (state) {
      state.user.username = ''
      state.user.token = ''
      state.alerts.alerts = []
    },
    initSettings (state) {
      state.instanceconfig = config.instances[config.defaultinstance]
      state.appconfig = config.global
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
              dispatch('getLoginData')
            }
            dispatch('initSearch')
            resolve()
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
    },
    async getLoginData ({ commit, dispatch, state }) {
      try {
        let response = await axios.get(state.instanceconfig.api + '/directory/user/data', {
          headers: {
            'X-XSRF-TOKEN': state.user.token
          }
        })
        if (response.data.alerts && response.data.alerts.length > 0) {
          commit('setAlerts', response.data.alerts)
        }
        console.log('[' + state.user.username + '] got user data firstname[' + response.data.user_data.firstname + '] lastname[' + response.data.user_data.lastname + '] email[' + response.data.user_data.email + ']')
        commit('setLoginData', response.data.user_data)
      } catch (error) {
        //if (error.response.status === 401) {
          // this token is invalid
        //  dispatch('logout')
        //}
        console.log(error)
      }
    }
  },
  modules: {
    search,
    vocabulary
  },
  strict: debug
})
