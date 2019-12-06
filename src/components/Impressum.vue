<template>
  <v-row column>
    <v-col>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-col>

    <v-card flat>
      <v-card-title primary-title class="title">
        {{$t('Impressum')}}
      </v-card-title>
      <v-card-text>
        <v-row column>
          <v-col>
            {{instance.impressum.orgname}}
          </v-col>
          <v-col>
            {{instance.impressum.address_line_1}}
          </v-col>
          <v-col>
            {{instance.impressum.address_line_2}}
          </v-col>
          <v-col>
            {{instance.impressum.zip}} {{instance.impressum.city}}
          </v-col>
          <v-col>
            T: {{instance.impressum.phone}}
          </v-col>
          <v-col>
            <a :href="'mailto:'+instance.impressum.email" >{{instance.impressum.email}}</a>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

  </v-row>
</template>

<script>
export default {
  name: 'impressum',
  computed: {
    breadcrumbs () {
      const bc = [
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
      return this.$store.state.instanceconfig
    }
  }
}
</script>
