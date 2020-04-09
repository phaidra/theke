<template>

  <v-card>
    <v-tabs v-model="tab" background-color="grey" dark>
      <v-tab>{{ $t('Edit') }}</v-tab>
      <v-tab>{{ $t('Import') }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card-text>
          <p-i-form
            :form="editform"
            :targetpid="pid"
            :templating="false"
            :importing="false"
            :debug="false"
            :enablerights="false"
            :validate="validate"
            :floatingsavebutton="true"
            v-on:object-saved="objectSaved($event)"
          ></p-i-form>
        </v-card-text>
      </v-tab-item>
      <v-tab-item>
        <tmdb-import :preselect="false" v-on:tmdb-import="importTmdbData($event)"></tmdb-import>
      </v-tab-item>
    </v-tabs-items>
  </v-card>

</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'
import TmdbImport from '@/components/TmdbImport'

export default {
  name: 'edit',
  components: {
    TmdbImport
  },
  computed: {
    pid () {
      return this.$route.params.pid
    }
  },
  data () {
    return {
      tab: 0,
      editform: {},
      form: {},
      parentpid: ''
    }
  },
  methods: {
    validate: function () {
      return true
    },
    importTmdbData: function (tmdbImportData) {
      this.addToForm(tmdbImportData)
      this.tab = 0
      this.$vuetify.goTo(0)
    },
    objectSaved: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: 'Metadata for object ' + event + ' saved' }])
      this.$router.push({ name: 'detail', params: { pid: this.parentpid } })
    },
    addToForm: function (tmdbImportData) {
      if (tmdbImportData) {

        let kws = []
        for (let f of tmdbImportData) {
          if ((f.field === 'dce:subject') && (f.import)) {
            kws.push(f.value)
          }
        }
        if (kws.length > 0 ) {
          let kw = fields.getField('keyword')
          kw.value = kws
          this.editform.sections[0].fields.push(kw)
        }

        for (let f of tmdbImportData) {
          if ((f.field === 'bf:Title') && (f.import)) {
            const tit = fields.getField('title')
            tit.titleLabel = 'Original title'
            tit.hideSubtitle = true
            tit.title = f.value
            this.editform.sections[0].fields.push(tit)
          }

          if ((f.field === 'bf:ParallelTitle') && (f.import)) {
            const paralelltitle = fields.getField('title')
            paralelltitle.type = 'bf:ParallelTitle'
            paralelltitle.hideSubtitle = true
            paralelltitle.title = f.value
            this.editform.sections[0].fields.push(paralelltitle)
          }

          if (f.field.startsWith('role') && f.import) {
            if (f.field === 'role:prn') {
              let role = fields.getField('production-company')
              role.organizationText = f.value
              this.editform.sections[0].fields.push(role)
            } else {
              if (f.field === 'role:prp') {
                let role = fields.getField('production-place')
                role.organizationText = f.value
                this.editform.sections[0].fields.push(role)
              } else {
                let role = fields.getField('role')
                role.role = f.field
                role.name = f.value
                role.showname = true
                this.editform.sections[0].fields.push(role)
              }
            }
          }

          if ((f.field === 'rdau:P60071') && (f.import)) {
            let prodyear = fields.getField('date-edtf')
            prodyear.type = 'rdau:P60071'
            prodyear.hideType = true
            prodyear.dateLabel = 'Production year'
            prodyear.value = f.value
            this.editform.sections[0].fields.push(prodyear)
          }

          if ((f.field === 'schema:duration') && (f.import)) {
            let dur = fields.getField('duration')
            dur.hideHours = true
            dur.hideSeconds = true
            dur.value = 'PT0H' + f.value + 'M0S'
            this.editform.sections[0].fields.push(dur)
          }

          if ((f.field === 'dcterms:language') && (f.import)) {
            let l = fields.getField('language')
            l.value = f.valueId
            this.editform.sections[0].fields.push(l)
          }

          if ((f.field === 'bf:note') && (f.import)) {
            let desc = fields.getField('description')
            desc.label = 'Content description'
            desc.value = f.value
            desc.language = f.lang
            this.editform.sections[0].fields.push(desc)
          }

          if ((f.field === 'role:aut') && (f.import)) {
            let adp = fields.getField('movieadaptation')
            adp.role = 'role:aut'
            adp.name = f.value
            adp.showname = true
            this.editform.sections[0].fields.push(adp)
          }

          if ((f.field === 'schema:genre') && (f.import)) {
           let genre = fields.getField('genre')
            genre.vocabulary = 'moviegenre'
            genre.value = f.valueId
            this.editform.sections[0].fields.push(genre)
          }
        }
      }
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

