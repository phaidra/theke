<template>
  <v-row column>
    <v-col>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-col>

    <v-card flat>
      <v-card-title primary-title class="title">
        {{$t('Contact')}}
      </v-card-title>
      <v-card-text>
        <v-row column>
          <v-col>
            {{instance.contact.name}}
          </v-col>
          <v-col>
            <a :href="'mailto:'+instance.contact.email" >{{instance.contact.email}}</a>
          </v-col>
          <v-col>
            {{instance.contact.phone}}
          </v-col>
          <v-col>
            {{instance.contact.address}}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

  </v-row>
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
