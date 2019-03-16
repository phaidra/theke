<template>
  <v-flex>
    <v-btn :to="{ name: 'search'}" raised>{{ $t('Back') }}</v-btn>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>Submit</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p-i-form
          :form="form"
          :contentmodel="contentmodel" 
          v-on:object-created="objectCreated($event)"
          v-on:load-form="form = $event"
        ></p-i-form>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import fields from 'phaidra-vue-components/src/utils/fields'

export default {
  name: 'submit',
  data () {
    return {
      contentmodel: 'https://pid.phaidra.org/vocabulary/8MY0-BQDQ',
      form: {
        sections: [
          {
            title: 'Movie metadata',
            id: 1,
            fields: []
          },
          {
            title: 'Cover',
            id: 2,
            type: 'member',
            multiplicable: true,
            fields: []
          }
        ]
      }
    }
  },
  methods: {
    objectCreated: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: 'Object ' + event + ' created' }])
    },
    getCookie: function (name) {
      var value = "; " + document.cookie
      var parts = value.split("; " + name + "=")
      if (parts.length == 2) {
        var val = parts.pop().split(";").shift()
        return val === ' ' ? null : val
      }
    }
  },
  mounted: function () {
    var token = this.getCookie('X-XSRF-TOKEN')
    if (token) {
      // TODO init userdata if setting token from cookie
      this.$store.commit('setToken', token)
    }

    let rt = fields.getField('resource-type')
    if (this.contentmodel) {
      rt.value = 'https://pid.phaidra.org/vocabulary/8MY0-BQDQ'
      rt['skos:prefLabel'].push({ '@value': 'container', '@language': 'eng' })
    }
    this.form.sections[0].fields.push(rt)

    this.form.sections[0].fields.push(fields.getField('title'))

    let translatedtitle = fields.getField('title')
    translatedtitle.type = 'bf:ParallelTitle'
    this.form.sections[0].fields.push(translatedtitle)

    this.form.sections[0].fields.push(fields.getField('series'))

    let actor = fields.getField('role')
    actor.role = 'role:act'
    this.form.sections[0].fields.push(actor)

    let director = fields.getField('role')
    director.role = 'role:drt'
    this.form.sections[0].fields.push(director)

    let screenplay = fields.getField('role')
    screenplay.role = 'role:aus'
    this.form.sections[0].fields.push(screenplay)

    let camera = fields.getField('role')
    camera.role = 'role:cng'
    this.form.sections[0].fields.push(camera)

    let music = fields.getField('role')
    music.role = 'role:msd'
    this.form.sections[0].fields.push(music)

    let production = fields.getField('role')
    production.role = 'role:pro'
    this.form.sections[0].fields.push(production)

    let productioncomp = fields.getField('role')
    productioncomp.role = 'role:prp'
    productioncomp.showname = true
    this.form.sections[0].fields.push(productioncomp)

    let prodyear = fields.getField('date-edtf')
    prodyear.type = 'dcterms:created'
    this.form.sections[0].fields.push(prodyear)

    this.form.sections[0].fields.push(fields.getField('duration'))

    this.form.sections[0].fields.push(fields.getField('language'))

    this.form.sections[0].fields.push(fields.getField('subtitle-language'))

    this.form.sections[0].fields.push(fields.getField('description'))

    this.form.sections[0].fields.push(fields.getField('adaptation'))

    this.form.sections[0].fields.push(fields.getField('genre'))

    this.form.sections[0].fields.push(fields.getField('keyword'))

    this.form.sections[0].fields.push(fields.getField('sound-characteristic'))

    this.form.sections[0].fields.push(fields.getField('supplementary-content'))

    this.form.sections[0].fields.push(fields.getField('award'))

    this.form.sections[0].fields.push(fields.getField('audience'))

    this.form.sections[0].fields.push(fields.getField('regional-encoding'))

    this.form.sections[0].fields.push(fields.getField('note'))

    this.form.sections[0].fields.push(fields.getField('physical-location'))

    this.form.sections[0].fields.push(fields.getField('shelf-mark'))

    let mrt = fields.getField('resource-type')
    mrt.value = 'https://pid.phaidra.org/vocabulary/44TN-P1S0'
    this.form.sections[1].fields.push(mrt)
    this.form.sections[1].fields.push(fields.getField('file'))
    this.form.sections[1].fields.push(fields.getField('title'))
    let mt = fields.getField('mime-type')
    mt.required = true
    this.form.sections[1].fields.push(mt)
    this.form.sections[1].fields.push(fields.getField('license'))
  }
}
</script>

