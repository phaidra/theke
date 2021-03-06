import 'core-js'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import moment from 'moment'
import eng from './i18n/eng'
import deu from './i18n/deu'
import ita from './i18n/ita'
import router from './router'
import store from './store'
import PhaidraVueComponents from 'phaidra-vue-components/src/components'
import * as svgicon from 'vue-svgicon'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import axios from 'axios'

Vue.config.productionTip = false

Vue.prototype.$http = axios

Vue.use(VueI18n)
Vue.use(PhaidraVueComponents)

Vue.filter('truncate', function (text, length, clamp) {
  clamp = clamp || '...'
  length = length || 30

  if (text.length <= length) return text

  var tcText = text.slice(0, length - clamp.length)
  var last = tcText.length - 1

  while (last > 0 && tcText[last] !== ' ' && tcText[last] !== clamp[0]) last -= 1

  // Fix for case when text does not have any space
  last = last || length - clamp.length

  tcText = tcText.slice(0, last)

  return tcText + clamp
})

Vue.filter('unixtime', function (value) {
  if (value) {
    return moment.unix(String(value)).format('DD.MM.YYYY hh:mm:ss')
  }
})

Vue.filter('date', function (value) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY')
  }
})

Vue.use(svgicon, {
  tagName: 'icon',
  defaultWidth: '1em',
  defaultHeight: '1em'
})

const messages = { eng, deu, ita }
const i18n = new VueI18n({
  locale: 'deu',
  messages: messages
})

router.afterEach((to, from) => {
  store.commit('updateBreadcrumbs', { to, from })
})

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')
