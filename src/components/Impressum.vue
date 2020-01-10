<template>

  <v-card flat>
    <v-card-title primary-title class="title">
      {{$t('Impressum')}}
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          {{instance.impressum.orgname}}
        </v-row>
        <v-row>
          {{instance.impressum.address_line_1}}
        </v-row>
        <v-row>
          {{instance.impressum.address_line_2}}
        </v-row>
        <v-row>
          {{instance.impressum.zip}} {{instance.impressum.city}}
        </v-row>
        <v-row>
          T: {{instance.impressum.phone}}
        </v-row>
        <v-row>
          <a :href="'mailto:'+instance.impressum.email" >{{instance.impressum.email}}</a>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>

</template>

<script>
export default {
  name: 'impressum',
  computed: {
    instance () {
      return this.$store.state.instanceconfig
    }
  }
}
</script>
