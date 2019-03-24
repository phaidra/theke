<template>
  <v-flex>
    <v-flex>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-flex>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('Add member of') }} {{this.parentpid}}</v-toolbar-title>        
        <v-divider class="mx-3" inset vertical></v-divider>
        <v-select
          :items="contentmodels"
          v-model="contentmodel"
          label="Object type"
          single-line
        ></v-select>
        <v-checkbox class="pt-4 pl-4" v-if="contentmodel === 'https://pid.phaidra.org/vocabulary/44TN-P1S0'" v-model="isthumbnail" :label="$t('Container thumbnail')"></v-checkbox>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <p-i-form
          :form="form"
          :contentmodel="contentmodel" 
          v-on:object-created="objectCreated($event)"
          v-on:load-form="form = $event"
        ></p-i-form>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'

export default {
  name: 'add-member',
  data () {
    return {
      parentpid: '',
      memberpid: '',
      isthumbnail: false,
      contentmodel: 'https://pid.phaidra.org/vocabulary/44TN-P1S0',
      contentmodels: [
        { 
          text: 'Data', 
          value: 'https://pid.phaidra.org/vocabulary/7AVS-Y482',
        }, 
        { 
          text: 'Picture', 
          value: 'https://pid.phaidra.org/vocabulary/44TN-P1S0' 
        }, 
        { 
          text: 'Audio', 
          value: 'https://pid.phaidra.org/vocabulary/8YB5-1M0J' 
        }, 
        { 
          text: 'Video', 
          value: 'https://pid.phaidra.org/vocabulary/B0Y6-GYT8' 
        }, 
        { 
          text: 'Document',
           value: 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX' 
        }
      ],
      form: {
        sections: [
          {
            title: 'Member',
            id: 1,
            type: 'general',
            multiplicable: true,
            fields: []
          }
        ]
      }
    }
  },
  computed: {
    breadcrumbs () {
      let bc = [
        {
          text: 'Search',
          to: { name: 'search', path: '/' }
        },
        {
          text: 'Detail ' + this.parentpid,
          to: { name: 'detail', params: { pid: this.parentpid } },
        },
        {
          text: 'Add member of ' + this.parentpid,
          disabled: true
        }
      ]
      return bc
    }
  },
  watch: {
    contentmodel: function (val) {
      for (var i = 0; i < this.form.sections.length; i++) {
        for (var j = 0; j < this.form.sections[i].fields.length; j++) {
          if (this.form.sections[i].fields[j].predicate === 'dcterms:type') {
            this.form.sections[i].fields[j].value = this.contentmodel
          }
        }
      }
    }
  },
  methods: {
    objectCreated: function (event) {
      this.memberpid = event
      this.$store.commit('setAlerts', [{ type: 'success', msg: 'Object ' + this.memberpid + ' created' }])
      // add membership relation
      var self = this
      var httpFormData = new FormData()
      this.loading = true
      httpFormData.append('predicate', 'http://pcdm.org/models#hasMember')
      httpFormData.append('object', 'info:fedora/' + self.memberpid)
      var url = self.$store.state.settings.instance.api + '/object/' + self.parentpid + '/relationship/add'
      var promise = fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'X-XSRF-TOKEN': self.$store.state.user.token
        },
        body: httpFormData
      })
      .then(function (response) { return response.json() })
      .then(function (json) {
        if (json.alerts && json.alerts.length > 0) {
          self.$store.commit('setAlerts', json.alerts)
        }
        if (self.isthumbnail) {
          httpFormData = new FormData()
          httpFormData.append('predicate', 'http://phaidra.org/XML/V1.0/relations#isThumbnailFor')
          httpFormData.append('object', 'info:fedora/' + self.parentpid)
          url = self.$store.state.settings.instance.api + '/object/' + self.memberpid + '/relationship/add'
          var promise2 = fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'X-XSRF-TOKEN': self.$store.state.user.token
            },
            body: httpFormData
          })
          .then(function (response) { return response.json() })
          .then(function (json) {
            if (json.alerts && json.alerts.length > 0) {
              self.$store.commit('setAlerts', json.alerts)
            }
            self.loading = false
            self.$router.push({ name: 'detail', params: { pid: self.parentpid } })
          })
          .catch(function (error) {
            console.log(error)
          })

          return promise2
        } else {
          self.loading = false
          self.$router.push({ name: 'detail', params: { pid: self.parentpid } })
        }
      })
      .catch(function (error) {
        console.log(error)
      })
      return promise
    }
  },
  mounted: function () {
    let mrt = fields.getField('resource-type')
    mrt.value = 'https://pid.phaidra.org/vocabulary/44TN-P1S0'
    this.form.sections[0].fields.push(mrt)
    this.form.sections[0].fields.push(fields.getField('file'))
    this.form.sections[0].fields.push(fields.getField('title'))
    let mt = fields.getField('mime-type')
    mt.required = true
    this.form.sections[0].fields.push(mt)
    this.form.sections[0].fields.push(fields.getField('license'))
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.parentpid = from.params.pid
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.parentpid = from.params.pid
  }
}
</script>

