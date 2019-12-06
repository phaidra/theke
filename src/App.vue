<template>
  <div id="app">
    <v-app>
      <v-container fluid grid-list-lg>
        <v-row>
          <v-col cols="4">
            <autocomplete
              placeholder="Search..."
              name="autocomplete"
              :initValue="query"
              :suggester="'titlesuggester'"
              :customParams="{ token: 'dev' }"
              :classes="{ input: 'form-control', wrapper: 'input-wrapper' }"
              :onSelect="handleSelect"
              :loading="loading"
            ></autocomplete>
          </v-col>
          <v-spacer></v-spacer>
          <template v-if="token">
            <v-col>
              <v-btn v-if="isowner || isuploader" :to="{ name: 'submit' }" color="primary" raised>{{ $t('Submit') }}</v-btn>
              <v-btn class="grey--text" raised single-line @click="logout()">{{ $t('Logout') }}</v-btn>
            </v-col>
          </template>
          <template v-else>
            <v-col>
              <v-text-field v-model="credentials.username" :label="$t('u:account userID')" ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="credentials.password"
                :label="$t('u:account password')"
                :append-icon="psvis ? 'visibility' : 'visibility_off'"
                @click:append="toggleVisibility"
                :type="psvis ? 'password' : 'text'"
              ></v-text-field>
            </v-col>
            <v-col cols="1">
              <v-btn raised single-line color="primary" class="mt-3" @click="login()">{{ $t('Login') }}</v-btn>
            </v-col>
          </template>
          <v-spacer></v-spacer>
          <h1 class="text-lg-right display-3 font-weight-light mb-3 grey--text"><router-link class="grey--text logo" :to="{ name: 'search', path: '/' }">{{name}}</router-link></h1>
        </v-row>
        <v-row>
          <v-alert v-for="(alert, i) in alerts" :type="(alert.type === 'danger' ? 'error' : alert.type)" :value="true" transition="slide-y-transition" :key="i">
            <span class="pa-3">{{alert.msg}}</span><v-spacer></v-spacer><v-btn icon @click.native="dismiss(alert)"><v-icon>close</v-icon></v-btn>
          </v-alert>
        </v-row>
        <v-row>
          <transition name="fade" mode="out-in">
            <keep-alive>
              <router-view></router-view>
            </keep-alive>
          </transition>
        </v-row>
      </v-container>
      <v-footer class="pa-3" color="#fafafa">
        <v-spacer></v-spacer>
        <span style="width: 150px">
          <v-select
            v-model="lang"
            :items="languages"
            :label="$t('Language')"
            @change="$i18n.locale=$event"
            prepend-icon="language"
            single-line
          ></v-select>
        </span>
        <router-link class="ml-4 navlink" :to="{ name: 'impressum' }">{{$t('Impressum')}}</router-link>
        <router-link class="ml-4 navlink" :to="{ name: 'contact' }">{{$t('Contact')}}</router-link>
        <a class="ml-4 navlink" href="https://github.com/phaidra/theke" target="_blank">v {{ version }}</a>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'
import Autocomplete from '@/components/Autocomplete'
import { version } from '../package.json'

export default {
  name: 'app',
  components: {
    Autocomplete
  },
  computed: {
    token: function () {
      return this.$store.state.user.token
    },
    isowner: function () {
      return this.$store.state.user.username === this.$store.state.appconfig.owner
    },
    isuploader: function () {
      for (const uploader of this.$store.state.appconfig.uploaders) {
        if (uploader === this.$store.state.user.username) {
          return true
        }
      }
      return false
    },
    alerts: function () {
      return this.$store.state.alerts.alerts
    },
    query: function () {
      return this.$store.state.search.q
    },
    name: function () {
      return this.$store.state.appconfig.name
    },
    searchsettings: function () {
      return this.$store.state.appconfig.search.state
    }
  },
  data () {
    return {
      version: version,
      lang: 'deu',
      languages: [
        { text: 'english', value: 'eng' },
        { text: 'deutsch', value: 'deu' }
      ],
      credentials: {
        username: '',
        password: ''
      },
      psvis: true,
      loading: false
    }
  },
  methods: {
    handleSelect: function (query) {
      var self = this
      this.loading = true
      this.$store.commit('setQuery', query.term)
      this.$store.commit('setPage', 1)
      this.$store.dispatch('search').then(function () {
        self.loading = false
        if (self.$route.name !== 'search') {
          self.$router.push({ name: 'search' })
        }
      })
    },
    login: function () {
      this.$store.dispatch('login', this.credentials)
    },
    logout: function () {
      this.$store.dispatch('logout')
      document.cookie = 'X-XSRF-TOKEN='
    },
    toggleVisibility: function () {
      this.psvis = !this.psvis
    },
    dismiss: function (alert) {
      this.$store.commit('clearAlert', alert)
    },
    getCookie: function (name) {
      var value = '; ' + document.cookie
      var parts = value.split('; ' + name + '=')
      if (parts.length == 2) {
        var val = parts.pop().split(';').shift()
        return val === ' ' ? null : val
      }
    },
    setSort: function (sort) {
      this.$store.dispatch('setSort', sort)
    },
    sortIsActive: function (sort) {
      for (var i = 0; i < this.$store.state.search.sortdef.length; i++) {
        if (this.$store.state.search.sortdef[i].id === sort) {
          return this.$store.state.search.sortdef[i].active
        }
      }
    },
    removeCollectionFilter: function () {
      this.$store.dispatch('setCollection', '')
    },
    initLanguages: function () {
      this.$store.commit('setLangTerms', this.$store.state.appconfig.vocabularies.lang)
    }
  },
  mounted: function () {
    var token = this.getCookie('X-XSRF-TOKEN')
    if (token) {
      this.$store.commit('setToken', token)
    }
  },
  created: function () {
    this.$store.dispatch('initSettings')
    document.title = this.$store.state.appconfig.name
    this.$store.commit('initStore')
    this.$store.dispatch('initSearch')
    this.initLanguages()
    this.$vuetify.theme.themes.light.primary = this.$store.state.instanceconfig.primary
  }
}
</script>

<style>
#app {
  font-family: "Roboto", sans-serif, Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app .v-btn {
  text-transform: none;
}

#app .v-tabs__div {
  text-transform: none;
  font-weight: 300;
}

.right {
  float: right;
}

.theme--light.v-btn:not(.v-btn--icon):not(.v-btn--flat) {
  background-color: white;
}

.theme--light.v-card>.v-card__text {
  color: #333333;
}

.title {
  font-weight: 300
}

.navlink {
  text-decoration: none;
  font-weight: 300;
}

.pdlabel {
  max-width: 100% !important;
}

.logo {
  text-decoration: none;
}
</style>
