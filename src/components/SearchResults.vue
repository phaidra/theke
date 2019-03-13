<template>

  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex v-for="(doc) in this.docs" :key="doc.pid">
        <v-card>
          <v-layout>
            <v-flex>
              <v-img height="120px" min-width="120px" contain :src="getPreview(doc.pid)" ></v-img>
            </v-flex>
            <v-spacer></v-spacer>
            <v-flex>
              <v-card-title primary-title>
                <div>
                  <div class="subheading" @click.stop v-if="doc.dc_title"><router-link :to="{ name: 'detail', params: { pid: doc.pid } }">{{ doc.dc_title[0] }}</router-link></div>
                  <div v-if="doc.dc_description" class="search-description pb-3">{{ doc.dc_description[0] }}</div>
                  <div>
                    <span>
                      <span v-for="(aut,i) in doc.bib_roles_pers_aut" :key="'pers'+i">
                        {{aut}}<span v-if="(i+1) < doc.bib_roles_pers_aut.length">; </span>
                      </span>
                      <span v-for="(aut,i) in doc.bib_roles_corp_aut" :key="'corp'+i">
                        {{aut}}<span v-if="(i+1) < doc.bib_roles_corp_aut.length">; </span>
                      </span>
                    </span>
                  </div>
                </div>
              </v-card-title>
            </v-flex>
          </v-layout>
          <v-divider light></v-divider>
          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn :to="{ name: 'detail', params: { pid: doc.pid } }" raised>{{ $t('Details') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>

</template>

<script>
export default {
  name: 'search-results',
  computed: {
    docs () {
      return this.$store.state.search.docs
    },
    instance () {
      return this.$store.state.settings.instance
    }
  },
  methods: {
    getPreview: function (pid) {
      return 'https://' + this.instance.baseurl + '/preview/' + pid + '///120'
    }
  }
}
</script>

<style scoped>

.card__title--primary {
  padding-top: 10px;
}

.search-description {
  white-space: pre-wrap;
}

.card__text {
  padding-top: 0px;
}

a {
  text-decoration: none;
}

.display-1, .headline, .subheading {
  font-weight: 300;
}
</style>
