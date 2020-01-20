<template>
  <div id="app">
    <template v-if="layout">
      <template v-if="layout === 'map-layout'">
        <component :is="layout">
          <router-view/>
        </component>
      </template>
      <template v-else>
        <component :is="layout">
          <div class="main-content">
            <router-view/>
          </div>
        </component>
      </template>
    </template>

    <v-dialog></v-dialog>
  </div>
</template>

<script>
import SiteNavigation from '@/components/elements/layout/SiteNavigation.vue'
import SiteFooter from '@/components/elements/layout/SiteFooter.vue'

export default {
  components: {
    SiteNavigation,
    SiteFooter
  },
  data () {
    return {
      route: this.$route
    }
  },
  computed: {
    layout () {
      // Only set a layout once the route has resolve, else things are loading
      return this.$route.name ? (this.$route.meta.layout || 'site-default-layout') : null
    }
  }
}
</script>

<style lang="scss">
@import '~bulma';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.main-content {
  flex: 1;
}
</style>
