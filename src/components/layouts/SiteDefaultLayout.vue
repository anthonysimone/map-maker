<template>
  <div class="default-layout">
    <site-navigation></site-navigation>

    <slot></slot>

    <site-footer></site-footer>
  </div>
</template>

<script>
import SiteNavigation from '@/components/elements/layout/SiteNavigation.vue'
import SiteFooter from '@/components/elements/layout/SiteFooter.vue'

export default {
  components: {
    SiteNavigation,
    SiteFooter
  }
}
</script>

<style lang="scss" scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
