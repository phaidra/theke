<template>

  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>{{$t('Edit') }} {{pid}}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <p-i-form
        :form="editform"
        :targetpid="pid"
        :templating="false"
        :floatingsavebutton="true"
        v-on:object-saved="objectSaved($event)"
      ></p-i-form>
    </v-card-text>
  </v-card>

</template>

<script>
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'

export default {
  name: 'edit',
  computed: {
    pid () {
      return this.$route.params.pid
    }
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
      var url = self.$store.state.instanceconfig.api + '/object/' + pid + '/metadata?mode=resolved'
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
        .then(function (response) { return response.json() })
        .then(function (json) {
          self.editform = self.json2form(json.metadata['JSON-LD'], { role: { component: 'p-entity' } })
        })
        .catch(function (error) {
          console.log(error)
        })

      return promise
    },
    json2form: function (jsonld, options) {
      return jsonLd.json2form(jsonld, options)
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
