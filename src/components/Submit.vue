<template>
  <v-col>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('Submit') }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p-i-form
          :form="form"
          :templating="false"
          :owner="isuploader ? owner : null"
          :contentmodel="contentmodel"
          v-on:object-created="objectCreated($event)"
          v-on:load-form="form = $event"
        ></p-i-form>
      </v-card-text>
    </v-card>
  </v-col>
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
    isuploader: function () {
      for (const uploader of this.$store.state.appconfig.uploaders) {
        if (uploader === this.$store.state.user.username) {
          return true
        }
      }
      return false
    },
    owner: function () {
      return this.$store.state.appconfig.owner
    }
  },
  methods: {
    objectCreated: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: this.$t('Record created') + ' ' + event }])
    }
  },
  mounted: function () {
    const rt = fields.getField('resource-type')
    rt.value = 'https://pid.phaidra.org/vocabulary/8MY0-BQDQ'
    this.form.sections[0].fields.push(rt)

    const tit = fields.getField('title')
    tit.titleLabel = 'Original title'
    tit.hideSubtitle = true
    this.form.sections[0].fields.push(tit)

    const paralelltitle = fields.getField('title')
    paralelltitle.type = 'bf:ParallelTitle'
    paralelltitle.hideSubtitle = true
    this.form.sections[0].fields.push(paralelltitle)

    const ser = fields.getField('series')
    ser.label = 'Series title'
    ser.hideVolume = true
    ser.hideIssue = true
    ser.hideIssued = true
    ser.hideIssn = true
    ser.hideIdentifier = true
    ser.hidePages = true
    this.form.sections[0].fields.push(ser)

    const actor = fields.getField('role')
    actor.role = 'role:act'
    this.form.sections[0].fields.push(actor)

    const director = fields.getField('role')
    director.role = 'role:drt'
    this.form.sections[0].fields.push(director)

    const screenplay = fields.getField('role')
    screenplay.role = 'role:aus'
    this.form.sections[0].fields.push(screenplay)

    const camera = fields.getField('role')
    camera.role = 'role:cng'
    this.form.sections[0].fields.push(camera)

    const music = fields.getField('role')
    music.role = 'role:msd'
    this.form.sections[0].fields.push(music)

    const production = fields.getField('role')
    production.role = 'role:pro'
    this.form.sections[0].fields.push(production)

    const productioncomp = fields.getField('role')
    productioncomp.type = 'schema:Organization'
    productioncomp.role = 'role:prn'
    productioncomp.showname = true
    productioncomp.hideRole = true
    productioncomp.organizationLabel = 'Production company'
    this.form.sections[0].fields.push(productioncomp)

    const prodplace = fields.getField('role')
    prodplace.type = 'schema:Organization'
    prodplace.role = 'role:prp'
    prodplace.organizationLabel = 'Production country'
    prodplace.showname = true
    prodplace.hideRole = true
    this.form.sections[0].fields.push(prodplace)

    const prodyear = fields.getField('date-edtf')
    prodyear.type = 'rdau:P60071'
    prodyear.hideType = true
    prodyear.dateLabel = 'Production year'
    this.form.sections[0].fields.push(prodyear)

    const dur = fields.getField('duration')
    dur.hideHours = true
    dur.hideSeconds = true
    this.form.sections[0].fields.push(dur)

    this.form.sections[0].fields.push(fields.getField('language'))
    let lang_vocab = fields.getField('language')
    lang_vocab.vocabulary = 'lang_vocab'
    lang_vocab.label = 'Regional language'
    this.form.sections[0].fields.push(lang_vocab)

    this.form.sections[0].fields.push(fields.getField('subtitle-language'))

    const desc = fields.getField('description')
    desc.label = 'Content description'
    this.form.sections[0].fields.push(desc)

    const adp = fields.getField('movieadaptation')
    adp.role = 'role:aut'
    this.form.sections[0].fields.push(adp)

    const genre = fields.getField('genre')
    genre.vocabulary = 'moviegenre'
    this.form.sections[0].fields.push(genre)

    this.form.sections[0].fields.push(fields.getField('keyword'))

    const dceformat = fields.getField('dce-format-vocab')
    dceformat.vocabulary = 'dceformat'
    this.form.sections[0].fields.push(dceformat)

    const tech = fields.getField('technique-vocab')
    tech.vocabulary = 'technique'
    tech.value = 'https://pid.phaidra.org/vocabulary/K818-FSM5'
    this.form.sections[0].fields.push(tech)

    const tech2 = fields.getField('technique-vocab')
    tech2.vocabulary = 'technique'
    tech2.value = 'https://pid.phaidra.org/vocabulary/1K09-VXQ4'
    this.form.sections[0].fields.push(tech2)

    this.form.sections[0].fields.push(fields.getField('supplementary-content'))

    this.form.sections[0].fields.push(fields.getField('award'))

    const aud = fields.getField('audience-vocab')
    aud.vocabulary = 'audience'
    this.form.sections[0].fields.push(aud)

    const regcode = fields.getField('regional-encoding')
    regcode.vocabulary = 'regionalencoding'
    this.form.sections[0].fields.push(regcode)

    this.form.sections[0].fields.push(fields.getField('note'))

    const physloc = fields.getField('physical-location-select-text')
    physloc.selectlabel = 'Standort'
    physloc.label = 'Arbeitsbereich'
    physloc.vocabulary = 'pool'
    this.form.sections[0].fields.push(physloc)

    this.form.sections[0].fields.push(fields.getField('shelf-mark'))
  }
}
</script>
