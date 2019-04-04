<template>

  <v-layout row >

    <v-flex xs9 class="border-right" pr-2>
      <v-layout column>

        <v-flex xs12 class="pt-5">
          <v-layout row>
            <v-flex xs1><span>{{ total }} {{ $t('objects') }}</span></v-flex>
            <v-flex xs6>
              <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="9" v-model="page" class="mb-3" flat></v-pagination>
            </v-flex>
            <v-flex xs4>
              <v-btn-toggle light v-model="toggle_exclusive">
                <v-btn @click.native="setSort('title asc')">
                  <span>A-Z</span>
                </v-btn>
                <v-btn @click.native="setSort('title desc')">
                  <span>Z-A</span>
                </v-btn>
                <v-btn @click.native="setSort('dcterms_created_year_sort asc')">
                  <span>{{dctermsCreatedYearMin}}-{{dctermsCreatedYearMax}}</span>
                </v-btn>
                <v-btn @click.native="setSort('dcterms_created_year_sort desc')">
                  <span>{{dctermsCreatedYearMax}}-{{dctermsCreatedYearMin}}</span>
                </v-btn>
              </v-btn-toggle>
            </v-flex>
          </v-layout>
          <v-flex v-if="inCollection" class="display-2 primary--text">{{ $t('Members of') }} {{ inCollection }} <icon name="material-navigation-close" class="primary--text" height="100%" @click.native="removeCollectionFilter()"></icon></v-flex>
          <search-results></search-results>
          <v-flex class="text-xs-center">
            <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="13" v-model="page" class="mb-3"></v-pagination>
          </v-flex>
        </v-flex>

      </v-layout>
    </v-flex>

    <v-flex xs3 class="pa-2">
      <search-filters></search-filters>
    </v-flex>

  </v-layout>

</template>

<script>
import SearchResults from '@/components/SearchResults'
import SearchFilters from '@/components/SearchFilters'

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
          if (this.$store.state.search.stats.stats_fields.dcterms_created_year) {
            return this.$store.state.search.stats.stats_fields.dcterms_created_year.min
          }
        }
      }
    },
    dctermsCreatedYearMax: function () {
      if (this.$store.state.search.stats) {
        if (this.$store.state.search.stats.stats_fields) {
          if (this.$store.state.search.stats.stats_fields.dcterms_created_year) {
            return this.$store.state.search.stats.stats_fields.dcterms_created_year.max
          }
        }
      }
    }
  },
  data () {
    return {
      toggle_exclusive: null,
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
    removeCollectionFilter: function () {
      this.$store.dispatch('setCollection', '')
    }
  }
}
</script>