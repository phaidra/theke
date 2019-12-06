<template>
  <v-container>
    <v-row>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-row>
    <v-row v-if="loggedin">
      <v-card flat color="#fafafa">
        <v-card-actions>
          <v-btn v-if="isowner" :to="{ name: 'addmember', params: { pid: pid }}" color="primary" raised>{{ $t('Add file') }}</v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark v-on="on">{{ $t('Download') }}<v-icon right dark>arrow_drop_down</v-icon></v-btn>
            </template>
            <v-list>
              <v-list-tile v-for="(member, index) in members" :key="index" :href="getMemberDownloadUrl(member)">
                <v-list-tile-title>{{ getFilename(member.pid) }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-card-actions>
      </v-card>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-card>
          <v-card-text>
            <p-d-jsonld :jsonld="displayjsonld[pid]" :pid="pid"></p-d-jsonld>
          </v-card-text>
          <v-divider light v-if="isowner"></v-divider>
          <v-card-actions v-if="isowner" class="pa-3">
            <v-spacer></v-spacer>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn color="primary" dark v-on="on">{{ $t('Edit') }}<v-icon right dark>arrow_drop_down</v-icon></v-btn>
              </template>
              <v-list>
                <v-list-tile :to="{ name: 'edit'}">
                  <v-list-tile-title>{{ $t('Edit metadata') }}</v-list-tile-title>
                </v-list-tile>
                <v-list-tile :to="{ name: 'manage'}">
                  <v-list-tile-title>{{ $t('Manage object') }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="8" v-if="members">
        <v-row  >
          <v-col cols="12" md="6" v-for="(member) in members" :key="'member_'+member.pid" >
            <v-card class="mb-3 pt-4">
              <a target="_blank" :href="'https://' + instance.baseurl + '/imageserver/' + member.pid">
                <v-img max-height="200" contain v-if="member.cmodel === 'PDFDocument'" :src="'https://' + instance.baseurl + '/preview/' + member.pid + '/Document/preview/480'" />
                <v-img max-height="200" contain v-else-if="member.cmodel === 'Picture' || member.cmodel === 'Page'" :src="'https://' + instance.baseurl + '/preview/' + member.pid + '/ImageManipulator/boxImage/480/png'" />
              </a>
              <v-card-text class="ma-2">
                <p-d-jsonld :jsonld="displayjsonld[member.pid]" :pid="member.pid"></p-d-jsonld>
                <v-container v-if="getMD5(member.pid)">
                  <v-row>
                    <v-col md="2" cols="12" class="pdlabel primary--text text-right">md5</v-col>
                    <v-col md="10" cols="12">{{ getMD5(member.pid) }}</v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-divider light v-if="isowner"></v-divider>
              <v-card-actions v-if="loggedin" class="pa-3">
                <v-spacer></v-spacer>
                <v-btn v-if="member.cmodel === 'Picture'" target="_blank" :href="'https://' + instance.baseurl + '/imageserver/' + member.pid" primary>{{ $t('View') }}</v-btn>
                <v-btn :href="getMemberDownloadUrl(member)" primary>{{ $t('Download') }}</v-btn>
                <v-menu v-if="isowner" offset-y>
                  <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark v-on="on">{{ $t('Edit') }}<v-icon right dark>arrow_drop_down</v-icon></v-btn>
                  </template>
                  <v-list>
                    <v-list-tile :to="{ name: 'edit', params: { pid: member.pid } }">
                      <v-list-tile-title>{{ $t('Edit metadata') }}</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile :to="{ name: 'manage', params: { pid: member.pid } }">
                      <v-list-tile-title>{{ $t('Manage object') }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import qs from 'qs'
import Vue from 'vue'

export default {
  name: 'detail',
  computed: {
    loggedin: function () {
      return this.$store.state.user.token
    },
    isowner: function () {
      return this.$store.state.user.username === this.$store.state.appconfig.owner
    },
    pid () {
      return this.$route.params.pid
    },
    breadcrumbs () {
      const bc = [
        {
          text: this.$t('HOME/SEARCH'),
          to: { name: 'search', path: '/' }
        },
        {
          text: this.$t('Detailpage') + ' ' + this.$route.params.pid,
          disabled: true,
          to: { name: 'detail', params: { pid: this.$route.params.pid } }
        }
      ]
      return bc
    },
    instance () {
      return this.$store.state.instanceconfig
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
      if (this.doc.datastreams) {
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
      doc: {},
      md5: {}
    }
  },
  methods: {
    loadJsonld (self, pid) {
      var url = self.$store.state.instanceconfig.api + '/object/' + pid + '/metadata?mode=resolved'
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
      for (const member of self.members) {
        member.jsonld = {}
      }

      var params = {
        q: 'ismemberof:"' + pid + '"',
        defType: 'edismax',
        wt: 'json',
        qf: 'ismemberof^5',
        fl: 'pid,cmodel',
        sort: 'pos_in_' + pid.replace(':', '_') + ' asc'
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
            for (const mem of self.members) {
              self.loadJsonld(self, mem.pid)
              self.loadMD5(self, mem.pid)
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
    loadMD5 (self, pid) {
      var url = self.$store.state.instanceconfig.api + '/object/' + pid + '/md5'
      var promise = fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'X-XSRF-TOKEN': self.$store.state.user.token
        }
      })
        .then(function (response) { return response.json() })
        .then(function (json) {
          Vue.set(self.md5, pid, json.md5)
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
    },
    getMD5: function (pid) {
      if (this.md5[pid]) {
        const md5s = [] // there might be more versions of octets
        for (const md5 of this.md5[pid]) {
          if (md5.path.replace('_', ':').match(new RegExp(pid + '\\+OCTETS', 'g'))) {
            md5s.push(md5.md5)
          }
        }
        return md5s.join(', ')
      }
    },
    getFilename: function (pid) {
      if (this.displayjsonld[pid]) {
        if (this.displayjsonld[pid]['ebucore:filename']) {
          if (this.displayjsonld[pid]['ebucore:filename'].length > 0) {
            return this.displayjsonld[pid]['ebucore:filename'][0]
          }
        }
      }
      return ''
    },
    getMemberDownloadUrl: function (member) {
      if (member.cmodel === 'Asset' || member.cmodel === 'Video') {
        return this.instance.fedora + '/objects/' + member.pid + '/methods/bdef:Content/download'
      } else {
        return this.instance.api + '/object/' + member.pid + '/diss/Content/download'
      }
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.displayjsonld = {}
      vm.loadDetail(vm, to.params.pid).then(() => {
        next()
      })
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.displayjsonld = {}
    this.loadDetail(this, to.params.pid).then(() => {
      next()
    })
  }
}
</script>
