<template>
  <div id="app">
    <v-app>
      <v-container fluid>

        <quicklinks :showquicklinks="quicklinksenabled"></quicklinks>

        <v-row no-gutters>

          <v-col cols="12" md="10" offset-md="1">

            <v-row justify="end">
              <icon v-if="token" class="personicon mr-2 univie-grey" name="material-social-person" width="24px" height="24px"></icon>
              <template v-if="token">
                <span v-if="user.firstname || user.lastname" class="subheading displayname univie-grey">{{ user.firstname }} {{ user.lastname }}</span>
                <span v-else class="subheading displayname univie-grey">{{ user.username }}</span>
              </template>
              <v-menu bottom transition="slide-y-transition" class="v-align-top">
                <template v-slot:activator="{ on }">
                  <v-btn text v-on="on" class="top-margin-lang">
                    <span class="grey--text text--darken-1">{{$i18n.locale}}</span>
                    <icon name="univie-sprache" class="lang-icon grey--text text--darken-1"></icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="$i18n.locale='eng'">
                    <v-list-item-title>English</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="$i18n.locale='deu'">
                    <v-list-item-title>Deutsch</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <a id="quicklinks-button" class="ph-button hidden-sm-and-down" v-on:click="quicklinksenabled = !quicklinksenabled">Quicklinks</a>
            </v-row>

            <v-row no-gutters>

              <v-col class="text-left mt-4" md="3" cols="9">
                <a :href="appconfig.logolink" target="_blank">
                  <img src="./assets/Uni_Logo_2016.png" class="logo" alt="logo" />
                </a>
              </v-col>

              <v-col md="9" cols="3" :align-self="'center'">

                <v-app-bar-nav-icon class="hidden-md-and-up">
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-btn text icon color="grey lighten-1" v-on="on"><icon name="material-navigation-menu" width="24px" height="24px"></icon></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="$router.push({ path: '/' })"><v-list-item-title>{{ $t("Search") }}</v-list-item-title></v-list-item>
                      <v-list-item v-if="isowner || isuploader" @click="$router.push({ name: 'submit' })"><v-list-item-title>{{ $t("Submit") }}</v-list-item-title></v-list-item>
                      <v-list-item @click="$router.push({ path: '/contact' })"><v-list-item-title>{{ $t("Contact") }}</v-list-item-title></v-list-item>
                      <v-list-item v-if="!token" @click="$router.push('login')"><v-list-item-title>{{ $t("Login") }}</v-list-item-title></v-list-item>
                      <v-list-item v-if="token" @click="logout()"><v-list-item-title>{{ $t("Logout") }}</v-list-item-title></v-list-item>
                    </v-list>
                  </v-menu>
                </v-app-bar-nav-icon>

                <span class="text-left hidden-sm-and-down" v-if="appconfig.name">
                  <icon left dark name="univie-right" color="#a4a4a4" width="14px" height="14px" class="mb-1"></icon>
                  <a class="name primary--text ma-3" @click="resetSearch()" :title="appconfig.nametooltip">{{ appconfig.name }}</a>
                  <div class="ml-6 mt-2" v-if="appconfig.headernotice1">{{ appconfig.headernotice1 }}</div>
                  <div class="ml-6" v-if="appconfig.headernotice2">{{ appconfig.headernotice2 }}</div>
                </span>
              </v-col>
            </v-row>

            <v-row no-gutters class="hidden-md-and-up pb-1">
              <span class="text-left ml-3 mt-4" v-if="appconfig.name">
                <icon left dark name="univie-right" color="#a4a4a4" width="14px" height="14px" class="mb-1"></icon>
                <a class="name primary--text ma-3" @click="resetSearch()">{{ appconfig.name }}</a>
                <div class="ml-6 mt-2" v-if="appconfig.headernotice1">{{ appconfig.headernotice1 }}</div>
                <div class="ml-6" v-if="appconfig.headernotice2">{{ appconfig.headernotice2 }}</div>
              </span>
            </v-row>

            <v-row no-gutters class="hidden-sm-and-down header">

              <v-toolbar flat color="white" dense>
                <v-spacer></v-spacer>
                <v-toolbar-items class="hidden-sm-and-down no-height-inherit">
                  <v-hover v-slot:default="{ hover }">
                    <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ path: '/' }">{{ $t("Search") }}</router-link>
                  </v-hover>
                  <v-hover v-slot:default="{ hover }">
                    <router-link v-if="isowner || isuploader" :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ name: 'submit' }">{{ $t("Submit") }}</router-link>
                  </v-hover>
                  <v-hover v-slot:default="{ hover }">
                    <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ path: '/contact' }">{{ $t("Contact") }}</router-link>
                  </v-hover>
                  <v-hover v-slot:default="{ hover }">
                    <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" v-if="!token" :to="{ path: '/login' }">{{ $t("Login") }}</router-link>
                  </v-hover>
                  <v-hover v-slot:default="{ hover }">
                    <a class="flat dark ph-button grey" v-if="token" @click="logout()" >{{ $t("Logout") }}</a>
                  </v-hover>
                </v-toolbar-items>
              </v-toolbar>

            </v-row>

            <v-row>
              <v-col cols="12">
                <p-breadcrumbs :items="breadcrumbs" class="ml-1"></p-breadcrumbs>
                <v-row justify="center" v-for="(alert, i) in alerts" :key="i">
                  <v-col cols="12">
                    <v-alert prominent :type="(alert.type === 'danger' ? 'error' : alert.type)" :value="true" transition="slide-y-transition">
                      <v-row align="center">
                        <v-col class="grow">{{alert.msg}}</v-col>
                        <v-col class="shrink">
                          <v-btn icon @click.native="dismiss(alert)"><v-icon>mdi-close</v-icon></v-btn>
                        </v-col>
                      </v-row>
                    </v-alert>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            
          </v-col>
        </v-row>

        <v-row class="content mx-4" justify="center">
          <v-col cols="12" md="10">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <router-view></router-view>
            </keep-alive>
          </transition>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <quicklinks-footer></quicklinks-footer>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="10" offset-md="1">
            <v-row>
              <v-col class="text-left" >
                <span class="grey--text text--darken-2"><address>{{ instanceconfig.address }} | <abbr title="Telefon">T</abbr> {{ instanceconfig.phone }}</address></span>
              </v-col>
              <v-col class="text-right" >
                <router-link class="navlink" :to="{ name: 'impressum' }">{{$t('Impressum')}}</router-link> | <router-link class="navlink" :to="{ name: 'contact' }">{{$t('Contact')}}</router-link>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

      </v-container>
    </v-app>
  </div>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'
import PBreadcrumbs from '@/components/PBreadcrumbs'
import Quicklinks from '@/components/Quicklinks'
import QuicklinksFooter from '@/components/QuicklinksFooter'
import { version } from '../package.json'
import '@/compiled-icons/material-social-person'
import '@/compiled-icons/material-navigation-menu'
import '@/compiled-icons/univie-sprache'

export default {
  name: 'app',
  components: {
    Quicklinks,
    QuicklinksFooter,
    PBreadcrumbs
  },
  computed: {
    instanceconfig: function () {
      return this.$store.state.instanceconfig
    },
    token: function () {
      return this.$store.state.user.token
    },
    user () {
      return this.$store.state.user
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
    appconfig: function () {
      return this.$store.state.appconfig
    },
    breadcrumbs () {
      return this.$store.state.breadcrumbs
    }
  },
  data () {
    return {
      quicklinksenabled: 0,
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
    logout: function () {
      this.$store.dispatch('logout')
      document.cookie = 'X-XSRF-TOKEN='
    },
    resetSearch: function () {
      this.$store.dispatch('resetSearch')
      this.$router.push({ name: 'search', path: '/' })
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
    initLanguages: function () {
      this.$store.commit('setLangTerms', this.$store.state.appconfig.vocabularies.lang)
    }
  },
  mounted: function () {
    var token = this.getCookie('X-XSRF-TOKEN')
    if (token) {
      this.$store.commit('setToken', token)
      if (!this.user.username) {
        this.$store.dispatch('getLoginData')
      }
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

.name {
  font-size: 18.6667px;
  font-weight: 400;
}
.name:hover {
  text-decoration: underline;
}

.right {
  float: right;
}

.theme--light.v-btn:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined)  {
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


.no-padding {
  padding: 0px;
}

.svg-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  color: inherit;
  vertical-align: middle;
  fill: none;
  stroke: currentColor;
}

.svg-fill {
  fill: currentColor;
  stroke: none;
}

.svg-up {
  transform: rotate(0deg);
}

.svg-right {
  transform: rotate(90deg);
}

.svg-down {
  transform: rotate(180deg);
}

.svg-left {
  transform: rotate(-90deg);
}

.ie-fixMinHeight {
    display:flex;
}

html, body{
    height:100%;
}

section { overflow: auto; }

#app {
  font-family: "Roboto", sans-serif, Arial, Helvetica, sans-serif;
  font-size: 11.5pt;
  line-height: 1.42857143;
  color: black;
  background-color: white;
  font-weight: 300;
  text-rendering: optimizeLegibility;
}

a {
  text-decoration: none;
}

.logo {
  height: auto;
  width: auto;
  max-width: 250px;
  max-height: 150px;
}

.header {
  -webkit-box-shadow: 48px 0 0 0 white, -48px 0 0 0 white, 0 30px 30px -16px rgba(70, 70, 70, 0.3);
  box-shadow: 48px 0 0 0 white, -48px 0 0 0 white, 0 30px 30px -16px rgba(70, 70, 70, 0.3);
  background-color: white;
  z-index: 1;
}

address {
  font-style: normal;
}

.v-align-top {
  vertical-align: top;
}

.theme--light.v-card > .v-card__text {
  color: black;
}

.lang-icon {
  margin-left: 5px;
}

.displayname {
  vertical-align: top;
  display: inline-block;
  margin-top: 10px;
}

.ph-button  {
  color: white !important;
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: relative;
  outline: 0;
  border: 0;
  border-radius: 0px;
  display: inline-block;
  -ms-flex-align: center;
  align-items: center;
  padding: 0 6px;
  margin: 6px 1px 6px 0px;
  height: 30px;
  line-height: 30px;
  min-height: 30px;
  white-space: nowrap;
  min-width: 88px;
  text-align: center;
  font-weight: 300;
  font-size: 14px;
  font-style: inherit;
  font-variant: inherit;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  letter-spacing: .010em;
  font-weight: 400;
}

.ph-button:hover {
  background-color: #267ab3;
  text-decoration: none;
  color: white;
  font-weight: 400;
}

#quicklinks-button {
  background-color: #1a74b0;
  text-decoration: none;
  color: white;
  margin-top: 0px;
  width: 263px;
}

#quicklinks-button:hover {
  color: white;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}

.select-instance {
  max-width: 300px;
}

.border-bottom {
  border-bottom: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-right {
  border-right: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-left {
  border-left: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-top {
  border-top: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

#app .v-btn {
  text-transform: none;
}
#app .v-tabs__div {
  text-transform: none;
  font-weight: 300;
}

.v-application .subtitle-1 {
  line-height: 1.25rem;
}

.univie-grey {
  color: #7b7b7b
}
</style>

<style scoped>
.top-margin-lang {
  margin-top: 0px;
}

.content {
  min-height: 800px;
}

.container {
  padding: 0px;
}

.no-height-inherit {
  height: unset;
}

.personicon {
  align-self: center;
}

.float-right {
  float: right;
}

</style>