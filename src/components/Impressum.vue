<template>
  <v-layout column>
    <v-flex>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-flex>
   
    <v-card flat>
      <v-card-title primary-title class="title">
        {{$t('Impressum')}}
      </v-card-title>
      <v-card-text>
        <v-layout column>
          <v-flex>
            {{instance.impressum.orgname}}
          </v-flex>
          <v-flex>
            {{instance.impressum.address_line_1}}
          </v-flex>
          <v-flex>
            {{instance.impressum.address_line_2}}
          </v-flex>
          <v-flex>
            {{instance.impressum.zip}} {{instance.impressum.city}}
          </v-flex>
          <v-flex>
            T: {{instance.impressum.phone}}
          </v-flex>
          <v-flex>
            <a :href="'mailto:'+instance.impressum.email" >{{instance.impressum.email}}</a>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
      
  </v-layout>
</template>

<script>
export default {
  name: 'impressum',
  computed: {
    breadcrumbs () {
      let bc = [
        {
          text: this.$t('HOME/SEARCH'),
          to: { name: 'search', path: '/' }
        },
        {
          text: this.$t('Impressum'),
          disabled: true
        }
      ]
      return bc
    },
    instance () {
      return this.$store.state.settings.instance
    }
  }
}
</script>

