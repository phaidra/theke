<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9" class="border-right pr-2" >
        <v-row>
          <v-col cols="2"><span class="ml-4">{{ total }} {{ $t('objects') }}</span></v-col>
          <v-col cols="5">
            <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="7" v-model="page" class="mb-3" flat></v-pagination>
          </v-col>
          <v-col cols="5">
            <v-btn-toggle light v-model="toggle_exclusive">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click.native="setSort('title asc')">
                    <span>A-Z</span>
                  </v-btn>
                </template>
                <span>{{ $t('Title ascending') }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click.native="setSort('title desc')">
                    <span>Z-A</span>
                  </v-btn>
                </template>
                <span>{{ $t('Title descending') }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click.native="setSort('rdau_P60071_year_sort asc')">
                    <span>{{dctermsCreatedYearMin}}-{{dctermsCreatedYearMax}}</span>
                  </v-btn>
                </template>
                <span>{{ $t('Production year ascending') }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click.native="setSort('rdau_P60071_year_sort desc')">
                    <span>{{dctermsCreatedYearMax}}-{{dctermsCreatedYearMin}}</span>
                  </v-btn>
                </template>
                <span>{{ $t('Production year descending') }}</span>
              </v-tooltip>
            </v-btn-toggle>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn class="ml-4" v-on="on" @click.native="csvExport()">
                  <span>Export</span>
                </v-btn>
              </template>
              <span>{{ $t('Download search results as a CSV file') }}</span>
            </v-tooltip>
          </v-col>
        </v-row>

        <search-results></search-results>
        <v-row class="text-center">
          <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="13" v-model="page" class="mb-3"></v-pagination>
        </v-row>
      </v-col>
      <v-col cols="3" class="pa-2">
        <search-filters></search-filters>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import qs from 'qs'
import SearchResults from '@/components/SearchResults'
import SearchFilters from '@/components/SearchFilters'
import { saveAs } from 'file-saver'

export default {
  name: 'search',
  components: {
    SearchResults,
    SearchFilters
  },
  computed: {
    signedin () {
      return this.$store.state.user.token ? 1 : 0
    },
    page: {
      get () {
        return this.$store.state.search.page
      },
      set (value) {
        this.$store.dispatch('setPage', value)
      }
    },
    instance () {
      return this.$store.state.instanceconfig
    },
    totalPages: function () {
      return Math.ceil(this.$store.state.search.total / this.$store.state.search.pagesize)
    },
    total: function () {
      return this.$store.state.search.total
    },
    pagesize: function () {
      return this.$store.state.search.pagesize
    },
    searchDef: function () {
      return this.$store.state.search.searchDef
    },
    inCollection: function () {
      return this.$store.state.search.collection
    },
    dctermsCreatedYearMin: function () {
      if (this.$store.state.search.stats) {
        if (this.$store.state.search.stats.stats_fields) {
          if (this.$store.state.search.stats.stats_fields.rdau_P60071_year) {
            return this.$store.state.search.stats.stats_fields.rdau_P60071_year.min
          }
        }
      }
    },
    dctermsCreatedYearMax: function () {
      if (this.$store.state.search.stats) {
        if (this.$store.state.search.stats.stats_fields) {
          if (this.$store.state.search.stats.stats_fields.rdau_P60071_year) {
            return this.$store.state.search.stats.stats_fields.rdau_P60071_year.max
          }
        }
      }
    }
  },
  data () {
    return {
      toggle_exclusive: null
    }
  },
  methods: {
    setSort: function (sort) {
      this.$store.dispatch('setSort', sort)
    },
    sortIsActive: function (sort) {
      for (var i = 0; i < this.$store.state.search.sortdef.length; i++) {
        if (this.$store.state.search.sortdef[i].id === sort) {
          return this.$store.state.search.sortdef[i].active
        }
      }
    },
    csvExport: function () {
      const solrParams = this.$store.getters.solrParams
      solrParams.rows = this.total
      solrParams.wt = 'csv'
      if (this.$i18n.locale === 'deu') {
        solrParams.fl = ['Identifikator:pid', 'Titel:bf_title_maintitle', 'Paralleltitel:bf_paralleltitle_maintitle', 'Drehbuch:bib_roles_pers_aus', 'RegisseurIn:bib_roles_pers_drt', 'Produktionsort:bib_roles_pers_prp', 'Produktionsjahr:rdau_P60071_year_sort', 'Sprache:dc_language', 'Genre:schema_genre', 'Signatur:bf_shelfmark']
      } else {
        solrParams.fl = ['id:pid', 'title:bf_title_maintitle', 'paralleltitle:bf_paralleltitle_maintitle', 'screenplay:bib_roles_pers_aus', 'director:bib_roles_pers_drt', 'production:bib_roles_pers_prp', 'date:rdau_P60071_year_sort', 'language:dc_language', 'genre:schema_genre', 'shelfmark:bf_shelfmark']
      }
      solrParams['fl.alias'] = ''
      const csvquery = qs.stringify(solrParams, { encodeValuesOnly: true, indices: false })
      fetch(this.instance.solr + '/select?' + csvquery, {
        method: 'GET',
        mode: 'cors'
      })
        .then(function (response) { return response.text() })
        .then(function (text) {
        // var content = response.body
          var blob = new Blob([text], {
            type: 'text/csv;charset=utf-8'
          })
          saveAs(blob, 'search-results.csv')
        })
    }
  }
}
</script>
