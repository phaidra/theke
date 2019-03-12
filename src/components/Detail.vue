<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>Detail {{pid}}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <p-d-jsonld 
        ref="display"
        :pid="pid"
        :jsonld="displayjsonld"
        v-on:load-jsonld="displayjsonld = $event"
      ></p-d-jsonld>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'detail',
  computed: {
    pid () {
      return this.$route.params.pid
    }
  },
  data () {
    return {
      displayjsonld: {}
    }
  }
}
</script>

