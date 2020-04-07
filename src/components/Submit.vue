<template>
  <v-col>
    <v-tabs v-model="tab" background-color="grey" dark>
      <v-tab>{{ $t('Metadata') }}</v-tab>
      <v-tab>{{ $t('Import') }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card>
          <v-card-text>
            <p-i-form
              :form="form"
              :templating="false"
              :importing="false"
              :debug="false"
              :enablerights="false"
              :owner="isuploader ? owner : null"
              :contentmodel="contentmodel"
              v-on:object-created="objectCreated($event)"
              v-on:load-form="form = $event"
            ></p-i-form>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <tmdb-import v-on:tmdb-import="importTmdbData($event)"></tmdb-import>
      </v-tab-item>
    </v-tabs-items>
  </v-col>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'
import TmdbImport from '@/components/TmdbImport'

export default {
  name: 'submit',
  components: {
    TmdbImport
  },
  data () {
    return {
      loading: false,
      loadingDetail: false,
      tab: 0,
      contentmodel: 'https://pid.phaidra.org/vocabulary/8MY0-BQDQ',
      form: {
        sections: [
          {
            title: 'Movie metadata',
            id: 1,
            fields: []
          }
        ]
      }
    }
  },
  computed: {
    isuploader: function () {
      for (const uploader of this.$store.state.appconfig.uploaders) {
        if (uploader === this.$store.state.user.username) {
          return true
        }
      }
      return false
    },
    owner: function () {
      return this.$store.state.appconfig.owner
    }
  },
  methods: {
    objectCreated: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: this.$t('Record created') + ' ' + event }])
    },
    importTmdbData: function (tmdbImportData) {
      this.createForm(tmdbImportData)
      this.tab = 0
      this.$vuetify.goTo(0)
    },
    createForm: function (tmdbImportData) {
      this.form = {
        sections: [
          {
            title: 'Movie metadata',
            id: 1,
            fields: []
          }
        ]
      }

      const rt = fields.getField('resource-type')
      rt.value = 'https://pid.phaidra.org/vocabulary/8MY0-BQDQ'
      this.form.sections[0].fields.push(rt)

      const tit = fields.getField('title')
      tit.titleLabel = 'Original title'
      tit.hideSubtitle = true
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'bf:Title') && (f.import)) {
            tit.title = f.value
          }
        }
      }
      this.form.sections[0].fields.push(tit)

      const paralelltitle = fields.getField('title')
      paralelltitle.type = 'bf:ParallelTitle'
      paralelltitle.hideSubtitle = true
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'bf:ParallelTitle') && (f.import)) {
            paralelltitle.title = f.value
          }
        }
      }
      this.form.sections[0].fields.push(paralelltitle)

      const ser = fields.getField('series')
      ser.label = 'Series title'
      ser.hideVolume = true
      ser.hideIssue = true
      ser.hideIssued = true
      ser.hideIssn = true
      ser.hideIdentifier = true
      ser.hidePages = true
      this.form.sections[0].fields.push(ser)

      let importedActors = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:act') && (f.import)) {
            let role = fields.getField('role')
            role.role = 'role:act'
            role.name = f.value
            role.showname = true
            this.form.sections[0].fields.push(role)
            importedActors = true
          }
        }
      }
      if (!importedActors) {
        let actor = fields.getField('role')
        actor.role = 'role:act'
        this.form.sections[0].fields.push(actor)
      }

      let importedDirectors = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:drt') && (f.import)) {
            let role = fields.getField('role')
            role.role = 'role:drt'
            role.name = f.value
            role.showname = true
            this.form.sections[0].fields.push(role)
            importedDirectors = true
          }
        }
      }
      if (!importedDirectors) {
        let director = fields.getField('role')
        director.role = 'role:drt'
        this.form.sections[0].fields.push(director)
      }

      let importedScreenwriters = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:aus') && (f.import)) {
            let role = fields.getField('role')
            role.role = 'role:aus'
            role.name = f.value
            role.showname = true
            this.form.sections[0].fields.push(role)
            importedScreenwriters = true
          }
        }
      }
      if (!importedScreenwriters) {
        let screenplay = fields.getField('role')
        screenplay.role = 'role:aus'
        this.form.sections[0].fields.push(screenplay)
      }

      let importedCamera = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:cng') && (f.import)) {
            let role = fields.getField('role')
            role.role = 'role:cng'
            role.name = f.value
            role.showname = true
            this.form.sections[0].fields.push(role)
            importedCamera = true
          }
        }
      }
      if (!importedCamera) {
        let camera = fields.getField('role')
        camera.role = 'role:cng'
        this.form.sections[0].fields.push(camera)
      }

      let importedMusic = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:msd') && (f.import)) {
            let role = fields.getField('role')
            role.role = 'role:msd'
            role.name = f.value
            role.showname = true
            this.form.sections[0].fields.push(role)
            importedMusic = true
          }
        }
      }
      if (!importedMusic) {
        let music = fields.getField('role')
        music.role = 'role:msd'
        this.form.sections[0].fields.push(music)
      }

      let importedProducer = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:pro') && (f.import)) {
            let role = fields.getField('role')
            role.role = 'role:pro'
            role.name = f.value
            role.showname = true
            this.form.sections[0].fields.push(role)
            importedProducer = true
          }
        }
      }
      if (!importedProducer) {
        let production = fields.getField('role')
        production.role = 'role:pro'
        this.form.sections[0].fields.push(production)
      }

      let importedCompany = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:prn') && (f.import)) {
            let role = fields.getField('role')
            role.type = 'schema:Organization'
            role.role = 'role:prn'
            role.organization = f.value
            role.hideRole = true
            role.organizationLabel = 'Production company'
            this.form.sections[0].fields.push(role)
            importedCompany = true
          }
        }
      }
      if (!importedCompany) {
        let productioncomp = fields.getField('role')
        productioncomp.type = 'schema:Organization'
        productioncomp.role = 'role:prn'
        productioncomp.showname = true
        productioncomp.hideRole = true
        productioncomp.organizationLabel = 'Production company'
        this.form.sections[0].fields.push(productioncomp)
      }

      let importedPlace = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:prp') && (f.import)) {
            let role = fields.getField('role')
            role.type = 'schema:Organization'
            role.role = 'role:prp'
            role.organization = f.value
            role.hideRole = true
            role.organizationLabel = 'Production country'
            this.form.sections[0].fields.push(role)
            importedPlace = true
          }
        }
      }
      if (!importedPlace) {
        let prodplace = fields.getField('role')
        prodplace.type = 'schema:Organization'
        prodplace.role = 'role:prp'
        prodplace.organizationLabel = 'Production country'
        prodplace.showname = true
        prodplace.hideRole = true
        this.form.sections[0].fields.push(prodplace)
      }

      let prodyear = fields.getField('date-edtf')
      prodyear.type = 'rdau:P60071'
      prodyear.hideType = true
      prodyear.dateLabel = 'Production year'
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'rdau:P60071') && (f.import)) {
            prodyear.value = f.value
          }
        }
      }
      this.form.sections[0].fields.push(prodyear)

      let dur = fields.getField('duration')
      dur.hideHours = true
      dur.hideSeconds = true
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'schema:duration') && (f.import)) {
            dur.value = 'PT0H' + f.value + 'M0S'
          }
        }
      }
      this.form.sections[0].fields.push(dur)

      let importedLanguage = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'dcterms:language') && (f.import)) {
            let l = fields.getField('language')
            l.value = f.valueId
            this.form.sections[0].fields.push(l)
            importedLanguage = true
          }
        }
      }
      if (!importedLanguage) {
        this.form.sections[0].fields.push(fields.getField('language'))
      }

      let lang_vocab = fields.getField('language')
      lang_vocab.vocabulary = 'lang_vocab'
      lang_vocab.label = 'Regional language'
      this.form.sections[0].fields.push(lang_vocab)

      this.form.sections[0].fields.push(fields.getField('subtitle-language'))

      let importedDescription = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'bf:note') && (f.import)) {
            let desc = fields.getField('description')
            desc.label = 'Content description'
            desc.value = f.value
            desc.language = f.lang
            this.form.sections[0].fields.push(desc)
            importedDescription = true
          }
        }
      }
      if (!importedDescription) {
        let desc = fields.getField('description')
        desc.label = 'Content description'
        this.form.sections[0].fields.push(desc)
      }

      let adp = fields.getField('movieadaptation')
      adp.role = 'role:aut'
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'role:aut') && (f.import)) {
            adp.name = f.value
            adp.showname = true
          }
        }
      }
      this.form.sections[0].fields.push(adp)

      let importedGenre = false
      if (tmdbImportData) {
        for (let f of tmdbImportData) {
          if ((f.field === 'schema:genre') && (f.import)) {
           let genre = fields.getField('genre')
            genre.vocabulary = 'moviegenre'
            genre.value = f.valueId
            this.form.sections[0].fields.push(genre)
            importedGenre = true
          }
        }
      }
      if (!importedGenre) {
        let genre = fields.getField('genre')
        genre.vocabulary = 'moviegenre'
        this.form.sections[0].fields.push(genre)
      }

      let importedKeyword = false
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
          this.form.sections[0].fields.push(kw)
          importedKeyword = true
        }
      }
      if (!importedKeyword) {
        this.form.sections[0].fields.push(fields.getField('keyword'))
      }

      let dceformat = fields.getField('dce-format-vocab')
      dceformat.vocabulary = 'dceformat'
      this.form.sections[0].fields.push(dceformat)

      let tech = fields.getField('technique-vocab')
      tech.vocabulary = 'technique'
      tech.value = 'https://pid.phaidra.org/vocabulary/K818-FSM5'
      this.form.sections[0].fields.push(tech)

      let tech2 = fields.getField('technique-vocab')
      tech2.vocabulary = 'technique'
      tech2.value = 'https://pid.phaidra.org/vocabulary/1K09-VXQ4'
      this.form.sections[0].fields.push(tech2)

      this.form.sections[0].fields.push(fields.getField('supplementary-content'))

      this.form.sections[0].fields.push(fields.getField('award'))

      let aud = fields.getField('audience-vocab')
      aud.vocabulary = 'audience'
      this.form.sections[0].fields.push(aud)

      let regcode = fields.getField('regional-encoding')
      regcode.vocabulary = 'regionalencoding'
      this.form.sections[0].fields.push(regcode)

      this.form.sections[0].fields.push(fields.getField('note'))

      this.form.sections[0].fields.push(fields.getField('physical-location-select-text-pool'))

      this.form.sections[0].fields.push(fields.getField('shelf-mark'))
    }
  },
  mounted: function () {
    this.createForm()
  }
}
</script>

<style scoped>
.v-input__control {
  font-weight: 400;
}
</style>