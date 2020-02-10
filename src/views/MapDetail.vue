<template>
  <div class="map-detail">
    <div class="map-details" :class="{'is-active': detailsOpen}">
      <h1 class="map-name">{{ map.name }}</h1>
      <span class="details">({{ map.tilesWidth }}x{{ map.tilesLength }})</span>
      <div class="nav-links">
        <router-link class="button is-primary is-small to-edit-map" :to="{name: 'map-editor', params: {id: map.id}}">Edit</router-link>
        <router-link class="button is-primary is-small to-dashboard" :to="{name: 'dashboard'}">Dashboard</router-link>
      </div>
      <button class="details-toggle" @click="toggleMapDetails">Toggle</button>
    </div>
    <threejs-map-renderer :map="map"></threejs-map-renderer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ThreejsMapRenderer from '@/components/threejs/MapRenderer/ThreejsMapRenderer'

export default {
  name: 'map-detail',
  components: {
    ThreejsMapRenderer
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
      return this.mapById(this.id)
    }
  },
  methods: {
    toggleMapDetails () {
      this.detailsOpen = !this.detailsOpen
    }
  }
}
</script>

<style lang="scss" scoped>
.map-details {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 38px;
  background: rgba(#ffffff, 0.9);
  transform: translate3d(0, -100%, 0);
  z-index: 1;
  &.is-active {
    transform: translate3d(0, 0, 0);
  }
}
.map-name {
  display: inline;
}
.details {
  display: inline-block;
  padding-left: 5px;
  font-size: 14px;
}
.details-toggle {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translate3d(0, 100%, 0);
}
.nav-links {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}
</style>
