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
        <v-card>
          <v-card-text>
            <v-tabs v-model="tmdbSearchTab" background-color="grey" dark>
              <v-tab>{{ $t('Search') }}</v-tab>
              <v-tab>{{ $t('Import overview') }}</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tmdbSearchTab">
              <v-tab-item>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="tmdbSearchQuery" 
                        :label="$t('Search movie')" 
                        v-on:keyup.enter="tmdbSearch()"
                        clearable
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="tmdbSearchResults">
                    <v-col cols="12">
                      <v-card>
                        <v-card-text>
                          <v-data-table
                            :items="tmdbSearchResults"
                            :loading="loading"
                            :item-value="'id'"
                            :item-text="'title'"
                            :server-items-length="tmdbSearchResultsTotal"
                            :options.sync="tmdbSearchOptions"
                            :headers="headers"
                          >
                            <template v-slot:item.poster_path="{ item }">
                              <img :src="$store.state.appconfig.apis.tmdb.images.securebaseurl + 'w92' + item.poster_path" />
                            </template>
                            <template v-slot:item.genre_ids="{ item }">
                              <span v-for="(gid, i) in item.genre_ids" :key="'gen'+i">{{ tmdbGenresHash[gid] }}<template v-if="i < item.genre_ids.length-1">, </template></span>
                            </template>
                            <template v-slot:item.release_date="{ item }">{{ item.release_date | date }}</template>
                            <template v-slot:item.actions="{ item }">
                              <v-btn class="mx-3" @click="loadDetails(item.id)" :disabled="loadingDetail" :loading="loadingDetail">{{ $t('Load') }}</v-btn>
                            </template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-tab-item>
              <v-tab-item>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-data-table
                        :items="tmdbImportData"
                        :loading="loading"
                        :items-per-page="5000"
                        :headers="importHeaders"
                        hide-default-footer
                      >
                        <template v-slot:item.value="{ item }">
                          {{ item.value }}
                        </template>
                        <template v-slot:item.actions="{ item }">
                          <v-checkbox class="mx-3" v-model="item.import">}</v-checkbox>
                        </template>
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-btn fixed bottom right raised color="primary" @click="importTmdbData()">{{ $t('Import') }}</v-btn>
                </v-container>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-col>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'
import lang3to2map from 'phaidra-vue-components/src/utils/lang3to2map'

export default {
  name: 'submit',
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
      },
      tmdbSearchTab: 0,
      tmdbGenresHash: {},
      tmdbGenresMapHash: {},
      tmdbSearchQuery: null,
      tmdbSearchResults: [],
      tmdbSearchResultsTotal: null,
      lang2to3map: {},
      tmdbMovieData: {},
      tmdbImportData: [],
      tmdbSearchOptions: {
        itemsPerPage: 20,
        page: 1
      },
      headers: [
        { text: this.$t('Poster'), value: 'poster_path' },
        { text: this.$t('Title'), value: 'title' },
        { text: this.$t('Original title'), value: 'original_title' },
        { text: this.$t('Release date'), value: 'release_date' },
        { text: this.$t('Genre'), value: 'genre_ids' },
        { text: this.$t('Actions'), align: 'right', value: 'actions', sortable: false }
      ],
      importHeaders: [
        { text: this.$t('Field'), value: 'text' },
        { text: this.$t('Value'), value: 'value' },
        { text: this.$t('Import?'), align: 'right', value: 'actions', sortable: false }
      ]
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
  watch: {
    tmdbSearchOptions: {
      handler () {
        this.tmdbSearch()
      },
      deep: true
    }
  },
  methods: {
    objectCreated: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: this.$t('Record created') + ' ' + event }])
    },
    loadDetails: async function (id) {
      this.loadingDetail = true
      try {

        let response = await this.$http.get(this.$store.state.appconfig.apis.tmdb.baseurl + '/movie/' + id, {
          params: {
            api_key: this.$store.state.appconfig.apis.tmdb.key
          }
        })
        this.$set(this.tmdbMovieData, 'details', response.data ? response.data : {})

        response = await this.$http.get(this.$store.state.appconfig.apis.tmdb.baseurl + '/movie/' + id + '/translations', {
          params: {
            api_key: this.$store.state.appconfig.apis.tmdb.key
          }
        })
        this.$set(this.tmdbMovieData, 'translations', response.data.translations ? response.data.translations : {})

        response = await this.$http.get(this.$store.state.appconfig.apis.tmdb.baseurl + '/movie/' + id + '/keywords', {
          params: {
            api_key: this.$store.state.appconfig.apis.tmdb.key
          }
        })
        this.$set(this.tmdbMovieData, 'keywords', response.data.keywords ? response.data.keywords : {})

        response = await this.$http.get(this.$store.state.appconfig.apis.tmdb.baseurl + '/movie/' + id + '/credits', {
          params: {
            api_key: this.$store.state.appconfig.apis.tmdb.key
          }
        })
        this.$set(this.tmdbMovieData, 'cast', response.data.cast ? response.data.cast : {})
        this.$set(this.tmdbMovieData, 'crew', response.data.crew ? response.data.crew : {})

      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.loadingDetail = false
      }

      this.tmdbImportData = []

      // title
      if (this.tmdbMovieData.details['title']) {
        this.tmdbImportData.push(
          {
            field: 'bf:ParallelTitle',
            text: this.$t('bf:ParallelTitle'),
            value: this.tmdbMovieData.details['title'],
            import: true
          }
        )
      }

      // original_title
      if (this.tmdbMovieData.details['original_title']) {
        this.tmdbImportData.push(
          {
            field: 'bf:Title',
            text: this.$t('bf:Title'),
            value: this.tmdbMovieData.details['original_title'],
            import: true
          }
        )
      }

      this.tmdbImportData['roles'] =  []

      // cast
      if (this.tmdbMovieData['cast']) {
        let cast = this.tmdbMovieData['cast']
        cast.sort(function (a, b) {
          return a.order - b.order
        })
        let i = 0
        for (let act of cast) {
          i++
          if (i === 11) {
            break
          }
          this.tmdbImportData.push(
            {
              field: 'role:act',
              text: this.$store.getters.getLocalizedTermLabel('rolepredicate', 'role:act', this.$i18n.locale),
              value: act.name,
              import: i <= 5
            }
          )
        }
      }

      // crew & based on
      if (this.tmdbMovieData['crew']) {
        for (let crew of this.tmdbMovieData['crew']) {
          let role = null
          switch (crew.job) {
            case 'Director': 
              role = 'role:drt'
              break
            case 'Screenplay': 
              role = 'role:aus'
              break
            case 'Director of Photography': 
              role = 'role:cng'
              break
            case 'Original Music Composer': 
              role = 'role:msd'
              break
            case 'Producer': 
              role = 'role:pro'
              break
            case 'Novel': 
              role = 'role:aut'
              break
          }
          if (role) {
            this.tmdbImportData.push( 
              {
                field: role,
                text: this.$store.getters.getLocalizedTermLabel('rolepredicate', role, this.$i18n.locale),
                value: crew.name,
                import: true
              }
            )
          }
        }
      }

      if (this.tmdbMovieData.details['genres']) {
        for (let g of this.tmdbMovieData.details['genres']) {
          this.tmdbImportData.push( 
            {
              field: 'schema:genre',
              text: this.$t('schema:genre'),
              value: this.$store.getters.getLocalizedTermLabel('genre', this.tmdbGenresMapHash[g.id], this.$i18n.locale),
              valueId: this.tmdbGenresMapHash[g.id],
              import: true
            }
          )
        }
      }

      if (this.tmdbMovieData.details['production_companies']) {
        for (let pc of this.tmdbMovieData.details['production_companies']) {
          this.tmdbImportData.push( 
            {
              field: 'role:prn',
              text: this.$store.getters.getLocalizedTermLabel('rolepredicate', 'role:prn', this.$i18n.locale),
              value: pc.name,
              import: true
            }
          )
        }
      }

      if (this.tmdbMovieData.details['production_countries']) {
        for (let pc of this.tmdbMovieData.details['production_countries']) {
          this.tmdbImportData.push( 
            {
              field: 'role:prp',
              text: this.$store.getters.getLocalizedTermLabel('rolepredicate', 'role:prp', this.$i18n.locale),
              value: pc.name,
              import: true
            }
          )
        }
      }

      if (this.tmdbMovieData.details['release_date']) {
        this.tmdbImportData.push( 
          {
            field: 'rdau:P60071',
            text: this.$t('Production year'),
            value: this.tmdbMovieData.details['release_date'].substring(0, 4),
            import: true
          }
        )
      }
      
      if (this.tmdbMovieData.details['runtime']) {
        this.tmdbImportData.push( 
          {
            field: 'schema:duration',
            text: this.$t('schema:duration'),
            value: this.tmdbMovieData.details['runtime'],
            import: true
          }
        )
      }

      if (this.tmdbMovieData.details['spoken_languages']) {
        for (let l of this.tmdbMovieData.details['spoken_languages']) {
          if (this.lang2to3map[l.iso_639_1]) {
            this.tmdbImportData.push( 
              {
                field: 'dcterms:language',
                text: this.$t('dcterms:language'),
                value: this.$store.getters.getLocalizedTermLabel('lang', this.lang2to3map[l.iso_639_1], this.$i18n.locale),
                valueId: this.lang2to3map[l.iso_639_1],
                import: true
              }
            )
          }
        }
      }

      if (this.tmdbMovieData['translations']) {
        for (let desc of this.tmdbMovieData['translations']) {
          if (this.lang2to3map[desc.iso_639_1]) {
            let imp = false
            switch (this.lang2to3map[desc.iso_639_1]) {
              case 'deu':
              case 'eng':
              case 'ita':
              case 'spa':
              case 'fra': 
              case 'ron': 
                imp = true
                break
            }
            if (desc.data) {
              if (desc.data.overview) {
                this.tmdbImportData.push( 
                  {
                    field: 'bf:note',
                    text: this.$t('Content description') + ' (' + this.$store.getters.getLocalizedTermLabel('lang', this.lang2to3map[desc.iso_639_1], this.$i18n.locale) + ')',
                    value: desc.data.overview,
                    lang: this.lang2to3map[desc.iso_639_1],
                    import: imp
                  }
                )
              }
            }
          }
        }
      }

      if (this.tmdbMovieData['keywords']) {
        for (let kw of this.tmdbMovieData['keywords']) {
          this.tmdbImportData.push( 
            {
              field: 'dce:subject',
              text: this.$t('dce:subject'),
              value: kw.name,
              import: true
            }
          )
        }
      }

      this.tmdbSearchTab = 1
      this.$vuetify.goTo(0)
    },
    tmdbSearch: async function () {
      if (this.tmdbSearchQuery) {
        this.loading = true
        try {
          let response = await this.$http.get(this.$store.state.appconfig.apis.tmdb.baseurl + '/search/movie', {
            params: {
              api_key: this.$store.state.appconfig.apis.tmdb.key,
              query: this.tmdbSearchQuery,
              page: this.tmdbSearchOptions.page
            }
          })
          this.tmdbSearchResults = response.data.results ? response.data.results : []
          this.tmdbSearchResultsTotal = response.data.total_results
        } catch (error) {
          console.log(error)
          this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
        } finally {
          this.loading = false
        }
      }
    },
    importTmdbData: function () {
      this.createForm()
      this.tab = 0
      this.$vuetify.goTo(0)
    },
    createForm: function () {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
          if ((f.field === 'bf:Title') && (f.import)) {
            tit.title = f.value
          }
        }
      }
      this.form.sections[0].fields.push(tit)

      const paralelltitle = fields.getField('title')
      paralelltitle.type = 'bf:ParallelTitle'
      paralelltitle.hideSubtitle = true
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
          if ((f.field === 'rdau:P60071') && (f.import)) {
            prodyear.value = f.value
          }
        }
      }
      this.form.sections[0].fields.push(prodyear)

      let dur = fields.getField('duration')
      dur.hideHours = true
      dur.hideSeconds = true
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
          if ((f.field === 'schema:duration') && (f.import)) {
            dur.value = 'PT0H' + f.value + 'M0S'
          }
        }
      }
      this.form.sections[0].fields.push(dur)

      let importedLanguage = false
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
          if ((f.field === 'role:aut') && (f.import)) {
            adp.name = f.value
            adp.showname = true
          }
        }
      }
      this.form.sections[0].fields.push(adp)

      let importedGenre = false
      if (this.tmdbImportData) {
        for (let f of this.tmdbImportData) {
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
      if (this.tmdbImportData) {
        let kws = []
        for (let f of this.tmdbImportData) {
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

    this.$store.dispatch('loadLanguages', this.$i18n.locale)

    for (let g of this.$store.state.appconfig.apis.tmdb.genres) {
      this.tmdbGenresHash[g.id] = g.name
      this.tmdbGenresMapHash[g.id] = g.pid
    }
    Object.entries(lang3to2map).forEach(([key, value]) => {
      this.lang2to3map[value] = key
    })

    this.tmdbMovieData = {}
    this.tmdbImportData = []

    this.createForm()
  }
}
</script>
