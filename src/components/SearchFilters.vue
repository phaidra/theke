<template>

  <v-container>
    <v-row>
      <v-btn class="mb-4" @click.native="resetFilters()" :disabled="disableReset">
        <span>{{ $t('Remove filters') }}</span>
      </v-btn>
    </v-row>
    <v-row>
      <ul class="main-ul">
        <li v-for="(f, i) in facetQueries" :key="i">
          <!--<v-icon @click.native="showFacet(f)" v-if="f.show" class="primary--text">check_box</v-icon>
          <v-icon @click.native="showFacet(f)" v-if="!f.show" class="primary--text">check_box_outline_blank</v-icon>-->
          <span @click="showFacet(f)" class="facet-label primary--text" :class="{ active: f.show }">{{ $t(f.label) }}</span>
          <ul v-if="f.show">
            <li v-for="(q, j) in f.queries" :key="j">
              <span @click="toggleFacet(q,f)">
                <!--<v-icon v-if="q.active" class="primary--text">check_box</v-icon>
                <v-icon v-if="!q.active" class="primary--text">check_box_outline_blank</v-icon>-->
                <span :class="{ active: q.active }" class="facet-label primary--text">{{ $t(q.label) }}</span>
                <span class="facet-count grey--text" v-if="q.count > 0">({{q.count}})</span>
              </span>
              <ul v-if="q.active && q.childFacet" >
                <li v-for="(q1, k) in q.childFacet.queries" :key="k">
                  <span @click="toggleFacet(q1,q.childFacet)">
                    <!--<v-icon v-if="q1.active" class="primary--text">check_box</v-icon>
                    <v-icon v-if="!q1.active" class="primary--text">check_box_outline_blank</v-icon>-->
                    <span :class="{ active: q1.active }" class="facet-label primary--text">{{ $t(q1.label) }}</span>
                    <span class="facet-count grey--text" v-if="q1.count > 0">({{q1.count}})</span>
                  </span>
                  <ul v-if="q1.active && q1.childFacet" >
                    <li v-for="(q2, l) in q1.childFacet.queries" :key="l">
                      <span @click="toggleFacet(q2,q1.childFacet)">
                        <!--<v-icon v-if="q2.active" class="primary--text">check_box</v-icon>
                        <v-icon v-if="!q2.active" class="primary--text">check_box_outline_blank</v-icon>-->
                        <span :class="{ active: q2.active }" class="facet-label primary--text">{{ $t(q2.label) }}</span>
                        <span class="facet-count grey--text" v-if="q2.count>0">({{q2.count}})</span>
                      </span>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </v-row>
  </v-container>

</template>

<script>
import Autocomplete from '@/components/Autocomplete'

export default {
  name: 'search-filters',
  components: {
    Autocomplete
  },
  computed: {
    searchsettings: function () {
      return this.$store.state.appconfig.search.state
    },
    owner () {
      return this.$store.state.search.owner
    },
    showRoleFilter () {
      return this.$store.state.search.showRoleFilter
    },
    showAuthorFilter () {
      return this.$store.state.search.showAuthorFilter
    },
    showOwnerFilter () {
      return this.$store.state.search.showOwnerFilter
    },
    facetQueries () {
      return this.$store.state.search.facetQueries.filter(f => !f.hidefilter)
    },
    disableReset () {
      for (const fq of this.$store.state.search.facetQueries) {
        if (fq.resetable) {
          for (const q of fq.queries) {
            if (q.active) {
              return false
            }
          }
        }
      }
      return true
    },
    persAuthors () {
      return this.$store.state.search.pers_authors
    },
    persAuthorsValues: {
      get () {
        return this.$store.state.search.pers_authors.values
      },
      set (value) {
        // it seems chips are manipulating the array directly anyways
        // maybe should provide own filtering function
        this.$store.dispatch('setPersAuthors', value)
      }
    },
    corpAuthors () {
      return this.$store.state.search.corp_authors
    },
    corpAuthorsValues: {
      get () {
        return this.$store.state.search.corp_authors.values
      },
      set (value) {
        // it seems chips are manipulating the array directly anyways
        // maybe should provide own filtering function
        this.$store.dispatch('setCorpAuthors', value)
      }
    },
    marcRoles () {
      return this.$store.state.search.marcRoles
    },
    roles () {
      return this.$store.state.search.roles
    }
  },
  data () {
    return {
      selectedRole: { pers: '', corp: '' },
      marcRolesArray: []
    }
  },
  methods: {
    showFacet: function (f) {
      this.$store.dispatch('showFacet', f)
    },
    toggleFacet: function (q, f) {
      this.$store.dispatch('toggleFacet', { q: q, f: f })
    },
    handleOwnerSelect: function (query) {
      this.$store.dispatch('setOwnerFilter', query.term)
    },
    toggleOwnerFilter: function () {
      this.$store.dispatch('toggleOwnerFilter')
    },
    toggleAuthorFilter: function () {
      this.$store.dispatch('toggleAuthorFilter')
    },
    toggleRoleFilter: function () {
      this.$store.dispatch('toggleRoleFilter')
    },
    addRoleFilter: function (type) {
      if (this.selectedRole[type]) {
        this.$store.dispatch('addRoleFilter', {
          field: 'bib_roles_' + type + '_' + this.selectedRole[type],
          label: this.$t(this.marcRoles[this.selectedRole[type]]),
          values: [],
          type: type
        })
      }
    },
    removeRoleFilter: function (role) {
      this.$store.dispatch('removeRoleFilter', role)
    },
    setRoleFilterValues: function (role) {
      this.$store.dispatch('setRoleFilterValues', role)
    },
    removeRoleFilterValue: function (role, value) {
      this.$store.dispatch('removeRoleFilterValue', { role: role, value: value })
    },
    resetFilters: function () {
      this.$store.dispatch('resetFilters')
    }
  },
  mounted () {
    for (var role in this.marcRoles) {
      this.marcRolesArray.push({ value: role, text: this.$t(this.marcRoles[role]) })
    }
  }
}
</script>

<style scoped>
ul {
  list-style: none;
}

.facet-label {
  font-size: 16px;
  font-weight: 300;
  margin-right: 5px;
}

.active {
  font-size: 18px;
  font-weight: 400;
  text-shadow: rgba(0,0,0,.12) 1px 1px 4px;
}
</style>
