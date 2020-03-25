<template>

  <v-container>
    <v-row v-for="(doc) in this.docs" :key="doc.pid" >
      <v-col cols="12">
        <v-card class="ma-3" flat :color="'rgba(255, 255, 255, 0)'">
          <v-card-text>
            <v-row>
              <v-col cols="2">
                <router-link :to="{ name: 'detail', params: { pid: doc.pid } }"><v-img height="120px" min-width="120px" contain :src="getPreview(doc.pid)" ></v-img></router-link>
              </v-col>
              <v-col>
                <div class="title font-weight-light primary--text" @click.stop v-if="doc.bf_title_maintitle"><router-link :to="{ name: 'detail', params: { pid: doc.pid } }">{{ doc.bf_title_maintitle[0] }}</router-link></div>
                <template v-if="doc.bf_title_subtitle">
                  <div class="font-weight-light">{{ doc.bf_title_subtitle[0] }}</div>
                </template>
                <template v-if="doc.bf_paralleltitle_maintitle">
                  <template v-if="doc.bf_paralleltitle_maintitle[0] !== doc.bf_title_maintitle[0]">
                    <div class=" font-weight-light mt-2 grey--text text--darken-2" >{{ doc.bf_paralleltitle_maintitle[0] }}</div>
                    <div v-if="doc.bf_paralleltitle_subtitle" class=" font-weight-light mt-2 grey--text text--darken-2" >{{ doc.bf_paralleltitle_subtitle[0] }}</div>
                  </template>
                </template>
                <div class="my-3">
                  <span  v-for="(drt,i) in doc.bib_roles_pers_drt" :key="'pers'+i">
                    {{drt}}<span v-if="(i+1) < doc.bib_roles_pers_drt.length">, </span>
                  </span>
                </div>
                <div v-if="doc.rdau_P60071_year" class="my-3">{{ doc.rdau_P60071_year[0] }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-divider></v-divider>
      </v-col>
    </v-row>
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
      return this.$store.state.instanceconfig
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
