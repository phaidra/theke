<template>
  <v-layout column>
    <v-flex>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-flex>
    <v-layout row>
    
      <v-flex xs6>
        <v-card>
          <v-card-text>
            <p-d-jsonld :jsonld="displayjsonld[pid]"></p-d-jsonld>
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
  
      <v-flex xs6 v-if="members">
        <v-card v-for="(member) in members" :key="'member_'+member.pid">
          <a :href="instance.api + '/object/' + member.pid + '/diss/Content/get'">
            <v-img max-height="400" contain v-if="member.cmodel === 'PDFDocument'" :src="'https://' + instance.baseurl + '/preview/' + member.pid + '/Document/preview/480'" />
            <v-img max-height="400" contain v-else-if="member.cmodel === 'Picture' || member.cmodel === 'Page'" :src="'https://' + instance.baseurl + '/preview/' + member.pid + '/ImageManipulator/boxImage/480/png'" />
          </a>
          <v-card-text class="ma-2">
            <p-d-jsonld :jsonld="displayjsonld[member.pid]"></p-d-jsonld>
          </v-card-text>
          <v-divider light></v-divider>
          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn :to="{ name: 'edit', params: { pid: member.pid } }" raised>{{ $t('Edit') }}</v-btn>
            <template>
              <v-btn :href="'https://' + instance.baseurl + '/imageserver/' + member.pid" primary>{{ $t('View') }}</v-btn>
            </template>
            <template>
              <v-btn :href="instance.api + '/object/' + member.pid + '/diss/Content/download'" primary>{{ $t('Download') }}</v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-flex>

    </v-layout>
  </v-layout>
</template>

<script>
import qs from 'qs'
import Vue from 'vue'

export default {
  name: 'detail',
  computed: {
    pid () {
      return this.$route.params.pid
    },
    breadcrumbs () {
      let bc = [
        {
          text: 'Search',
          to: { name: 'search', path: '/' }
        },
        {
          text: 'Detail ' + this.$route.params.pid,
          disabled: true,
          to: { name: 'detail', params: { pid: this.$route.params.pid } },
        }
      ]
      return bc
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
    },
    dshash: function () {
      var dshash = {}
      if(this.doc.datastreams){
        for (var i = 0; i < this.doc.datastreams.length; i++) {
          dshash[this.doc.datastreams[i]] = true
        }
      }
      return dshash
    }
  },
  data () {
    return {
      displayjsonld: {},
      members: [],
      doc: {}
    }
  },
  methods: {
    loadJsonld (self, pid) {
      var url = self.$store.state.settings.instance.api + '/object/' + pid + '/metadata?mode=resolved'
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
      .then(function (response) { return response.json() })
      .then(function (json) {
        Vue.set(self.displayjsonld, pid, json.metadata['JSON-LD'])
      })
      .catch(function (error) {
        console.log(error)
      })

      return promise
    },
    loadMembers (self, pid) {
      for (let member of self.members) {
        member['jsonld'] = {}
      }

      var params = {
        q: 'ismemberof:"' + pid + '"',
        defType: 'edismax',
        wt: 'json',
        qf: 'ismemberof^5',
        fl: 'pid,cmodel'
      }

      var query = qs.stringify(params, { encodeValuesOnly: true, indices: false })
      var url = self.instance.solr + '/select?' + query
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
      .then(function (response) { return response.json() })
      .then(function (json) {
        if (json.response.numFound > 0) {
          self.members = json.response.docs
          for (let mem of self.members) {
            self.loadJsonld(self, mem.pid)
          }
        } else {
          self.members = []
        }
      })
      .catch(function (error) {
        console.log(error)
      })

      return promise
    },
    loadDetail: function (self, pid) {

      self.displayjsonld = {}
      self.members = []

      var params = {
        q: 'pid:"' + pid + '"',
        defType: 'edismax',
        wt: 'json',
        qf: 'pid^5'
      }

      var query = qs.stringify(params, { encodeValuesOnly: true, indices: false })
      var url = self.instance.solr + '/select?' + query
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors'
      })
      .then(function (response) { return response.json() })
      .then(function (json) {
        if (json.response.numFound > 0) {
          self.doc = json.response.docs[0]
        }
        if (self.dshash['JSON-LD']) {
          self.loadJsonld(self, pid)
          self.loadMembers(self, pid)
        }
      })
      .catch(function (error) {
        console.log(error)
      })
      return promise
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.loadDetail(vm, to.params.pid).then(() => {
        next()
      })
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.loadDetail(this, to.params.pid).then(() => {
      next()
    })
  }
}
</script>

