<template>
  <v-row>
    <v-col >
      <span class="youarehere">{{ $t('You are here') }}:</span>
      <template v-for="(item, index) in items">
        <icon :key="'icon'+index" left dark name="univie-right" color="#a4a4a4" width="8px" height="8px" class="mx-1"></icon>
        <span :key="'distext'+index" v-if="item.disabled" class="text" >{{ $t(item.text) }}</span>
        <template v-else>
          <a :key="'home'+index" v-if="item.to === '/'" @click="resetSearch()" class="text primary--text">{{ $t(item.text) }}</a>
          <a :key="'iconex'+index" v-else-if="item.external" :href="item.to" target="_blank" class="text primary--text">{{ $t(item.text) }}</a>
          <router-link :key="'link'+index" v-else :to="item.to" class="text primary--text">{{ $t(item.text) }}</router-link>
        </template>
      </template>
      <v-divider></v-divider>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'p-breadcrumbs',
  props: {
    items: Array
  },
  methods: {
    resetSearch: function () {
      this.$store.dispatch('resetSearch')
      if (this.$route.path !== '/') {
        this.$router.push({ name: 'search', path: '/' })
      }
    }
  }
}
</script>

<style scoped>
.youarehere {
  font-weight: bold;
  font-size: 10pt;
  color: #333;
}

.text {
  font-size: 10pt;
}
</style>
