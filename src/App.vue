<template>
  <div id="app">
    <v-app>
      <v-container fluid grid-list-lg>
        <v-layout column>
          
          <v-layout row>
            <v-flex xs4>
              <autocomplete
                placeholder="Search..."
                name="autocomplete"
                :initValue="query"
                :suggester="'titlesuggester'"
                :customParams="{ token: 'dev' }"
                :classes="{ input: 'form-control', wrapper: 'input-wrapper'}"
                :onSelect="handleSelect"
              ></autocomplete>
            </v-flex>
            <template v-if="token">
              <v-flex xs5>
                <h3 class="font-weight-light pt-4">Logged in [{{ token }}]</h3>
              </v-flex>
              <v-flex xs1>
                <v-btn raised single-line color="primary lighten-2" class="mt-3" @click="logout()">Logout</v-btn>
              </v-flex>
            </template>
            <template v-else>
              <v-flex xs2> 
                <v-text-field v-model="credentials.username" :label="'username'" ></v-text-field>
              </v-flex>
              <v-flex xs2>
                <v-text-field 
                  v-model="credentials.password" 
                  :label="'password'" 
                  :append-icon="psvis ? 'visibility' : 'visibility_off'"
                  @click:append="toggleVisibility"
                  :type="psvis ? 'password' : 'text'"
                ></v-text-field>
              </v-flex>
              <v-flex xs1>
                <v-btn raised single-line color="primary lighten-2" class="mt-3" @click="login()">Login</v-btn>
              </v-flex>
            </template>
            <v-spacer></v-spacer>
            <h1 class="text-lg-right display-3 font-weight-light mb-3 grey--text">{{name}}</h1>
          </v-layout> 

          <v-flex xs4>
            <v-alert v-for="(alert, i) in alerts" :type="(alert.type === 'danger' ? 'error' : alert.type)" :value="true" transition="slide-y-transition" :key="i">
              <v-layout row><v-flex class="pa-3">{{alert.msg}}</v-flex><v-spacer></v-spacer><v-btn icon @click.native="dismiss(alert)"><v-icon>close</v-icon></v-btn></v-layout>
            </v-alert>
          </v-flex>

          <v-flex xs10>
            <transition name="fade" mode="out-in">
              <keep-alive>
                <router-view></router-view>
              </keep-alive>
            </transition>
          </v-flex>

        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'
import Autocomplete from '@/components/Autocomplete'

export default {
  name: 'app',
  components: {
    Autocomplete
  },
  computed: {
    token: function() {
      return this.$store.state.user.token
    },
    alerts: function () {
      return this.$store.state.alerts.alerts
    },
    query: function () {
      return this.$store.state.search.q
    },
    name: function() {
      return this.$store.state.settings.global.name
    },
    searchsettings: function() {
      return this.$store.state.settings.global.search.state
    }
  },
  data () {
    return {
      credentials: {
        username: '',
        password: ''
      },
      psvis: true
    }
  },
  methods: {
    handleSelect: function (query) {
      this.$store.commit('setQuery', query.term)
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
      var value = "; " + document.cookie
      var parts = value.split("; " + name + "=")
      if (parts.length == 2) {
        var val = parts.pop().split(";").shift()
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
    this.$store.commit('initStore')
    this.$vuetify.theme.primary = this.$store.state.settings.instance.primary
    if(this.searchsettings.owner){
      this.$store.dispatch('setOwnerFilter', this.searchsettings.owner)
    }
    this.$store.dispatch('search')
  }
}
</script>

<style>
#app {
  font-family: "Roboto", sans-serif, Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.right {
  float: right;
}
</style>