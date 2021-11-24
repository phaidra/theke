<template>

  <v-card flat v-if="instance.contact.useimpressum">
    <v-card-title primary-title class="title">
      {{$t('Contact')}}
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
  <v-card flat v-else>
    <v-card-title primary-title class="title">
      {{$t('Contact')}}
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          {{instance.contact.name}}
        </v-row>
        <v-row>
          <a :href="'mailto:'+instance.contact.email" >{{instance.contact.email}}</a>
        </v-row>
        <v-row>
          {{instance.contact.phone}}
        </v-row>
        <v-row>
          {{instance.contact.address}}
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>

</template>

<script>
export default {
  name: 'contact',
  computed: {
    breadcrumbs () {
      const bc = [
        {
          text: this.$t('HOME/SEARCH'),
          to: { name: 'search', path: '/' }
        },
        {
          text: this.$t('Contact'),
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
