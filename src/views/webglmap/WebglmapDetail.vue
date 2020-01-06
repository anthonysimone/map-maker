<template>
  <div class="webglmap-detail">
    <div class="map-details" :class="{'is-active': detailsOpen}">
      <h1>{{ map.name }}</h1>
      <router-link class="button is-primary is-small edit-map" :to="{name: 'webglmap-editor', params: {id: map.id}}">Edit</router-link>
      <ul>
        <li>Map width: {{ map.tilesWidth }}</li>
        <li>Map length: {{ map.tilesLength }}</li>
      </ul>
      <router-link class="button is-primary is-small edit-map" :to="{name: 'dashboard'}">Dashboard</router-link>
      <button class="details-toggle" @click="toggleMapDetails">Toggle</button>
    </div>
    <display-webglmap :map="map"></display-webglmap>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import DisplayWebglmap from '@/components/map/DisplayWebglmap.vue'

export default {
  name: 'map-detail',
  components: {
    DisplayWebglmap
  },
  data () {
    return {
      id: this.$route.params.id,
      detailsOpen: false
    }
  },
  computed: {
    ...mapGetters('map', ['mapById']),
    map () {
      console.log('map', this.mapById(this.id));
      return this.mapById(this.id)
    }
  },
  methods: {
    toggleMapDetails () {
      console.log('toggling')
      this.detailsOpen = !this.detailsOpen
    }
  },
}
</script>

<style lang="scss" scoped>
.webglmap-detail {
  display: relative;
}
.map-details {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(#ffffff, 0.9);
  transform: translate3d(0, -100%, 0);
  &.is-active {
    transform: translate3d(0, 0, 0);
  }
}
.details-toggle {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translate3d(0, 100%, 0);
}
.edit-map {
  position: absolute;
  top: 5px;
  right: 0;
}
</style>
