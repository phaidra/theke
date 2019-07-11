<template>
  <v-flex>
    <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{$t('Edit') }} {{pid}}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p-i-form 
          :form="editform"
          :targetpid="pid"
          :templating="false"
          v-on:object-saved="objectSaved($event)"
        ></p-i-form>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'

export default {
  name: 'edit',
  computed: {
    pid () {
      return this.$route.params.pid
    },
    breadcrumbs () {
      let bc = [
        {
          text: this.$t('HOME/SEARCH'),
          to: { name: 'search', path: '/' }
        },
        {
          text: this.$t('Detailpage') + ' ' + this.parentpid,
          to: { name: 'detail', params: { pid: this.parentpid } },
        },
        {
          text: this.$t('Metadata editor') + ' ' + this.pid,
          disabled: true
        }
      ]
      return bc
    },
  },
  data () {
    return {
      editform: {},
      form: {},
      parentpid: ''
    }
  },
  methods: {
    objectSaved: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: 'Metadata for object ' + event + ' saved' }])
      this.$router.push({ name: 'detail', params: { pid: this.parentpid } })
    },
    loadJsonld (self, pid) {
      var url = self.$store.state.settings.instance.api + '/object/' + pid + '/metadata?mode=resolved'
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
      .then(function (response) { return response.json() })
      .then(function (json) {
        self.editform = self.json2form(json.metadata['JSON-LD'])
      })
      .catch(function (error) {
        console.log(error)
      })

      return promise
    },
    json2form: function (jsonld) {
      return jsonLd.json2form(jsonld)
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.parentpid = from.params.pid
      vm.editform = {}
      vm.loadJsonld(vm, to.params.pid).then(() => {
        next()
      })
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.parentpid = from.params.pid
    this.editform = {}
    this.loadJsonld(this, to.params.pid).then(() => {
      next()
    })
  }
}
</script>

