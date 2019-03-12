<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>Edit {{pid}}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <p-i-form 
        ref="edit"
        :form="editform"
        :templating="false"
        v-on:load-form="editform = $event"
        v-on:object-saved="objectSaved($event)"
      ></p-i-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'edit',
  computed: {
    pid () {
      return this.$route.params.pid
    }
  },
  data () {
    return {
      editform: {},
      form: {}
    }
  },
  methods: {
    objectSaved: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: 'Metadata for object ' + event + ' saved' }])
    }
  },
  mounted: function () {
    this.$refs.edit.loadMetadata(this.pid)
  }
}
</script>

