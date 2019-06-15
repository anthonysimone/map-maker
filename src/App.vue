<template>
  <div id="app">

    <component :is="layout">
      <div class="main-content">
        <router-view/>
      </div>
    </component>

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
  computed: {
    layout () {
      return this.$route.meta.layout || 'site-default-layout'
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
