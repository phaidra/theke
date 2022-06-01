<template>

  <v-card flat v-if="instance.contact.useimpressum">
    <v-card-title primary-title class="title">
      {{$t('Contact')}}
    </v-card-title>
    <v-card-text>
      {{instance.impressum.orgname}}
      <br/>
        {{instance.impressum.address_line_1}}
      <br/>
        {{instance.impressum.address_line_2}}
      <br/>
        {{instance.impressum.zip}} {{instance.impressum.city}}
      <br/>
        T: {{instance.impressum.phone}}
      <br/>
        <a :href="'mailto:'+instance.impressum.email" >{{instance.impressum.email}}</a>
      <br/>
      <template v-if="instance.impressum.url">
        <a :href="instance.impressum.url" >{{instance.impressum.url}}</a>
      </template>
      <br/>
    </v-card-text>
  </v-card>
  <v-card flat v-else>
    <v-card-title primary-title class="title">
      {{$t('Contact')}}
    </v-card-title>
    <v-card-text>
        {{instance.contact.name}}
      <br/>
        <a :href="'mailto:'+instance.contact.email" >{{instance.contact.email}}</a>
      <br/>
        {{instance.contact.phone}}
      <br/>
        {{instance.contact.address}}
      <br/>
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
