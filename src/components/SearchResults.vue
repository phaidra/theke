<template>

  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex v-for="(doc) in this.docs" :key="doc.pid" xs12>
        <v-card class="ma-3" flat :color="'rgba(255, 255, 255, 0)'">
          <v-layout>
            <v-flex xs2>
              <v-img height="120px" min-width="120px" contain :src="getPreview(doc.pid)" ></v-img>
            </v-flex>
            <v-flex>
              <v-card-title primary-title>
                <div>
                  <div class="title" @click.stop v-if="doc.dc_title"><router-link :to="{ name: 'detail', params: { pid: doc.pid } }">{{ doc.dc_title[0] }}</router-link></div>
                  <div class="my-3">
                    <span  v-for="(drt,i) in doc.bib_roles_pers_drt" :key="'pers'+i">
                      {{drt}}<span v-if="(i+1) < doc.bib_roles_pers_drt.length">, </span>
                    </span>
                  </div>
                  <div v-if="doc.dcterms_created_year" class="my-3">{{ doc.dcterms_created_year[0] }}</div>
                </div>
              </v-card-title>
            </v-flex>
          </v-layout>
        </v-card>
        <v-divider></v-divider>
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

.display-1, .headline, .subheading, .title {
  font-weight: 300;
}
</style>
