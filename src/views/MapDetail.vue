<template>
  <div class="map-detail">
    <h1>{{ map.name }}</h1>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'map-detail',
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

</style>
