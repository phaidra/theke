<template>
  <v-flex>
    <v-btn :to="{ name: 'search'}" raised>{{ $t('Back to search results') }}</v-btn>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{$t('Detail')}} {{pid}}</v-toolbar-title>
        <v-spacer></v-spacer>
        
      </v-toolbar>
      <v-card-text>
        <p-d-jsonld 
          ref="display"
          :jsonld="displayjsonld"
          v-on:load-jsonld="displayjsonld = $event"
        ></p-d-jsonld>
      </v-card-text>
      <v-divider light></v-divider>
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn :to="{ name: 'edit'}" raised>{{ $t('Edit') }}</v-btn>
        <template v-if="viewable">
          <v-btn :href="instance.api + '/object/' + pid + '/diss/Content/get'" primary>{{ $t('View') }}</v-btn>
        </template>
        <template v-if="downloadable">
          <v-btn :href="instance.api + '/object/' + pid + '/diss/Content/download'" primary>{{ $t('Download') }}</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
import qs from 'qs'

export default {
  name: 'detail',
  computed: {
    pid () {
      return this.$route.params.pid
    },
    instance () {
      return this.$store.state.settings.instance
    },
    downloadable: function () {
      switch (this.doc.cmodel) {
        case 'PDFDocument':
        case 'Video':
        case 'Audio':
        case 'Picture':
        case 'Unknown':
        case 'Book':
          return true
        default:
          return false
      }
    },
    viewable: function () {
      switch (this.doc.cmodel) {
        case 'PDFDocument':
        case 'Video':
        case 'Audio':
        case 'Picture':
        case 'Book':
          return true
        default:
          return false
      }
    }
  },
  data () {
    return {
      displayjsonld: {},
      doc: {}
    }
  },
  methods: {
    loadDoc: function (pid) {
      var self = this
      var params = {
        q: 'pid:"' + pid + '"',
        defType: 'edismax',
        wt: 'json',
        qf: 'pid^5'
      }

      var query = qs.stringify(params, { encodeValuesOnly: true, indices: false })
      var url = this.instance.solr + '/select?' + query
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
      .then(function (response) { return response.json() })
      .then(function (json) {
        if (json.response.numFound > 0) {
          self.doc = json.response.docs[0]
        }
      })
      .catch(function (error) {
        console.log(error)
      })

    }
  },
  mounted () {
    this.$refs.display.loadMetadata(this.pid)
    this.loadDoc(this.pid)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$refs.display.loadMetadata(to.params.pid)
      vm.loadDoc(to.params.pid)
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$refs.display.loadMetadata(to.params.pid)
    this.loadDoc(to.params.pid)
  }
}
</script>

