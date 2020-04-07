<template>
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
              <v-col cols="6">
                <v-text-field 
                  v-model="tmdbSearchQuery" 
                  :label="$t('Search movie...')" 
                  v-on:keyup.enter="tmdbSearch()"
                  clearable
                  solo
                  autocomplete="off"
                  append-icon="mdi-magnify"
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
                    <v-checkbox class="mx-3" v-model="item.import"></v-checkbox>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-btn fixed bottom right raised color="primary" @click="$emit('tmdb-import', tmdbImportData)">{{ $t('Import') }}</v-btn>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import lang3to2map from 'phaidra-vue-components/src/utils/lang3to2map'

export default {
  name: 'tmdb-import',
  data () {
    return {
      loading: false,
      loadingDetail: false,
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
  watch: {
    tmdbSearchOptions: {
      handler () {
        this.tmdbSearch()
      },
      deep: true
    }
  },
  methods: {
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
              case 'por':
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
  }
}
</script>
