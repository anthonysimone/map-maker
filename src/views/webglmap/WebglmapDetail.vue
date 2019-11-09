<template>
  <div class="map-detail">
    <div class="container page-container">
      <section class="section">
        <div class="content map-details">
          <h1>{{ map.name }}</h1>
          <router-link class="button is-primary is-small edit-map" :to="{name: 'webglmap-editor', params: {id: map.id}}">Edit</router-link>
          <ul>
            <li>Map width: {{ map.tilesWidth }}</li>
            <li>Map length: {{ map.tilesLength }}</li>
          </ul>
        </div>
        <display-map :map="map"></display-map>
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import DisplayMap from '@/components/map/DisplayMap.vue'

export default {
  name: 'map-detail',
  components: {
    DisplayMap
  },
  data () {
    return {
      id: this.$route.params.id
    }
  },
  computed: {
    ...mapGetters('map', ['mapById']),
    map () {
      return this.mapById(this.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.map-details {
  position: relative;
}
.edit-map {
  position: absolute;
  top: 5px;
  right: 0;
}
</style>
