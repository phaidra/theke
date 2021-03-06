<template>
  <v-col>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('Add member of') }} {{this.parentpid}}</v-toolbar-title>
        <v-divider class="mx-3" inset vertical></v-divider>
        <v-checkbox class="pt-4 pl-4" v-model="isthumbnail" :label="$t('Container thumbnail')"></v-checkbox>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <p-i-form
          :form="form"
          :templating="false"
          :importing="false"
          :debug="false"
          :enablerights="false"
          :validate="validate"
          v-on:object-created="objectCreated($event)"
          v-on:load-form="form = $event"
          v-on:form-input-p-file="handleMimeSelect($event)"
        ></p-i-form>
      </v-card-text>
    </v-card>
  </v-col>
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
      form: {
        sections: [
          {
            title: '',
            id: 1,
            type: 'general',
            fields: []
          }
        ]
      }
    }
  },
  computed: {
    breadcrumbs () {
      const bc = [
        {
          text: this.$t('HOME/SEARCH'),
          to: { name: 'search', path: '/' }
        },
        {
          text: this.$t('Detailpage') + ' ' + this.parentpid,
          to: { name: 'detail', params: { pid: this.parentpid } }
        },
        {
          text: this.$t('Add member of') + ' ' + this.parentpid,
          disabled: true
        }
      ]
      return bc
    },
    vocabularies: function () {
      return this.$store.state.vocabulary.vocabularies
    }
  },
  methods: {
    validate: function () {
      return true
    },
    getResourceTypeFromMimeType: function (mime) {
      switch (mime) {
        case 'image/jpeg':
        case 'image/tiff':
        case 'image/gif':
        case 'image/png':
        case 'image/x-ms-bmp':
          // picture
          return 'https://pid.phaidra.org/vocabulary/44TN-P1S0'

        case 'audio/wav':
        case 'audio/mpeg':
        case 'audio/flac':
        case 'audio/ogg':
          // audio
          return 'https://pid.phaidra.org/vocabulary/8YB5-1M0J'

        case 'application/pdf':
          // document
          return 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX'

        case 'video/mpeg':
        case 'video/avi':
        case 'video/mp4':
        case 'video/quicktime':
        case 'video/x-matroska':
          // video
          return 'https://pid.phaidra.org/vocabulary/B0Y6-GYT8'

        // eg application/x-iso9660-image
        default:
          // data
          return 'https://pid.phaidra.org/vocabulary/7AVS-Y482'
      }
    },
    handleMimeSelect: function (val) {
      var i
      var j
      var k
      if (val.predicate === 'ebucore:filename') {
        for (i = 0; i < this.form.sections.length; i++) {
          var mime = val.mimetype
          var resourcetype = this.getResourceTypeFromMimeType(mime)
          if (this.form.sections[i].fields) {
            for (j = 0; j < this.form.sections[i].fields.length; j++) {
              if (this.form.sections[i].fields[j].predicate === 'dcterms:type') {
                var rt = this.form.sections[i].fields[j]
                rt.value = resourcetype
                var preflabels
                for (k = 0; k < this.vocabularies.resourcetype.terms.length; k++) {
                  if (this.vocabularies.resourcetype.terms[k]['@id'] === rt.value) {
                    preflabels = this.vocabularies.resourcetype.terms[k]['skos:prefLabel']
                  }
                }
                rt['skos:prefLabel'] = []
                Object.entries(preflabels).forEach(([key, value]) => {
                  rt['skos:prefLabel'].push({ '@value': value, '@language': key })
                })
              }
            }
          }
          this.form.sections.splice(i, 1, this.form.sections[i])
        }
        if (this.$store.state.appconfig.upload) {
          if (this.$store.state.appconfig.upload.accessrights) {
            if (this.$store.state.appconfig.upload.accessrights[resourcetype]) {
              for (k = 0; k < this.form.sections.length; k++) {
                if (typeof this.form.sections[k].id === 'string') {
                  if (this.form.sections[k].id.startsWith('autoaccessrights_')) {
                    this.form.sections.splice(k, 1)
                  }
                }
              }
              this.form.sections.push(
                {
                  title: 'Access rights',
                  type: 'accessrights',
                  id: 'autoaccessrights_' + resourcetype,
                  rights: this.$store.state.appconfig.upload.accessrights[resourcetype]
                }
              )
            } else {
              for (k = 0; k < this.form.sections.length; k++) {
                if (typeof this.form.sections[k].id === 'string') {
                  if (this.form.sections[k].id.startsWith('autoaccessrights_')) {
                    this.form.sections.splice(k, 1)
                  }
                }
              }
            }
          }
        }
      }
    },
    objectCreated: function (event) {
      this.memberpid = event
      this.$store.commit('setAlerts', [{ type: 'success', msg: this.$t('Upload successful') + ' ' + event }])
      // add membership relation
      var self = this
      var httpFormData = new FormData()
      this.loading = true
      httpFormData.append('predicate', 'http://pcdm.org/models#hasMember')
      httpFormData.append('object', 'info:fedora/' + self.memberpid)
      var url = self.$store.state.instanceconfig.api + '/object/' + self.parentpid + '/relationship/add'
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
          if (self.isthumbnail) {
            httpFormData = new FormData()
            httpFormData.append('predicate', 'http://phaidra.org/XML/V1.0/relations#isThumbnailFor')
            httpFormData.append('object', 'info:fedora/' + self.parentpid)
            url = self.$store.state.instanceconfig.api + '/object/' + self.memberpid + '/relationship/add'
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
    const mrt = fields.getField('resource-type')
    mrt.value = 'https://pid.phaidra.org/vocabulary/44TN-P1S0'
    this.form.sections[0].fields.push(mrt)
    this.form.sections[0].fields.push(fields.getField('file'))
    this.form.sections[0].fields.push(fields.getField('title'))
    const lic = fields.getField('license')
    lic.value = 'http://rightsstatements.org/vocab/InC/1.0/'
    this.form.sections[0].fields.push(lic)
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
