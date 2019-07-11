<template>
  <v-flex>
    <v-flex>
      <v-breadcrumbs :items="breadcrumbs" divider="/"></v-breadcrumbs>
    </v-flex>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('Submit') }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p-i-form
          :form="form"
          :templating="false"
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
          }
        ]
      }
    }
  },
  computed: {
    breadcrumbs () {
      let bc = [
        {
          text: this.$t('HOME/SEARCH'),
          to: { name: 'search', path: '/' }
        },
        {
          text: this.$t('Submit'),
          disabled: true,
          to: { name: 'submit' },
        }
      ]
      return bc
    }
  },
  methods: {
    objectCreated: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: this.$t('Record created') + ' ' + event }])
    }
  },
  mounted: function () {

      let rt = fields.getField('resource-type')
      rt.value = 'https://pid.phaidra.org/vocabulary/8MY0-BQDQ'
      this.form.sections[0].fields.push(rt)

      let tit = fields.getField('title')
      tit.titleLabel = 'Original title'
      tit.hideSubtitle = true
      this.form.sections[0].fields.push(tit)

      let paralelltitle = fields.getField('title')
      paralelltitle.type = 'bf:ParallelTitle'
      paralelltitle.hideSubtitle = true
      this.form.sections[0].fields.push(paralelltitle)

      let ser = fields.getField('series')
      ser.label = 'Series title'
      ser.hideVolume = true
      ser.hideIssue = true
      ser.hideIssued = true
      ser.hideIssn = true
      ser.hideIdentifier = true
      this.form.sections[0].fields.push(ser)

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
      productioncomp.type = 'schema:Organisation'
      productioncomp.role = 'role:prn'
      productioncomp.showname = true
      productioncomp.hideRole = true
      productioncomp.institutionLabel = 'Production company'
      this.form.sections[0].fields.push(productioncomp)

      let prodplace = fields.getField('role')
      prodplace.type = 'schema:Organisation'
      prodplace.role = 'role:prp'
      prodplace.institutionLabel = 'Production country'
      prodplace.showname = true
      prodplace.hideRole = true
      this.form.sections[0].fields.push(prodplace)

      let prodyear = fields.getField('date-edtf')
      prodyear.type = 'rdau:P60071'
      prodyear.hideType = true
      prodyear.dateLabel = 'Production year'
      this.form.sections[0].fields.push(prodyear)

      let dur = fields.getField('duration')
      dur.hideHours = true
      dur.hideSeconds = true
      this.form.sections[0].fields.push(dur)

      this.form.sections[0].fields.push(fields.getField('language'))

      this.form.sections[0].fields.push(fields.getField('subtitle-language'))

      let desc = fields.getField('description')
      desc.label = 'Content description'
      this.form.sections[0].fields.push(desc)

      let adp = fields.getField('movieadaptation') 
      adp.role = 'role:aut'
      this.form.sections[0].fields.push(adp)

      let genre = fields.getField('genre')
      genre.vocabulary = 'moviegenre'
      this.form.sections[0].fields.push(genre)

      this.form.sections[0].fields.push(fields.getField('keyword'))

      let dceformat = fields.getField('dce-format-vocab')
      dceformat.vocabulary = 'dceformat'
      this.form.sections[0].fields.push(dceformat)

      let tech = fields.getField('technique-vocab')
      tech.vocabulary = 'technique'
      tech.value = 'https://pid.phaidra.org/vocabulary/K818-FSM5'
      this.form.sections[0].fields.push(tech)

      let tech2 = fields.getField('technique-vocab')
      tech2.vocabulary = 'technique'
      tech2.value = 'https://pid.phaidra.org/vocabulary/1K09-VXQ4'
      this.form.sections[0].fields.push(tech2)

      this.form.sections[0].fields.push(fields.getField('supplementary-content'))

      this.form.sections[0].fields.push(fields.getField('award'))

      let aud = fields.getField('audience-vocab')
      aud.vocabulary = 'audience'
      this.form.sections[0].fields.push(aud)

      let regcode = fields.getField('regional-encoding')
      regcode.vocabulary = 'regionalencoding'
      this.form.sections[0].fields.push(regcode)

      this.form.sections[0].fields.push(fields.getField('note'))

      let physloc = fields.getField('physical-location-select-text')
      physloc.selectlabel = 'Standort'
      physloc.label = 'Arbeitsbereich'
      physloc.vocabulary = 'pool'
      this.form.sections[0].fields.push(physloc)

      this.form.sections[0].fields.push(fields.getField('shelf-mark'))
  }
}
</script>

