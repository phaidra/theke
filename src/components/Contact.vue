<template>
  <v-layout column>
    <v-flex>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-flex>
   
    <v-card flat>
      <v-card-title primary-title class="title">
        {{$t('Contact')}}
      </v-card-title>
      <v-card-text>
        <v-layout column>
          <v-flex>
            {{instance.contact.name}}
          </v-flex>
          <v-flex>
            {{instance.contact.email}}
          </v-flex>
          <v-flex>
            {{instance.contact.phone}}
          </v-flex>
          <v-flex>
            {{instance.contact.address}}
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
      
  </v-layout>
</template>

<script>
export default {
  name: 'detail',
  computed: {
    breadcrumbs () {
      let bc = [
        {
          text: this.$t('Search'),
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
      return this.$store.state.settings.instance
    }
  }
}
</script>

