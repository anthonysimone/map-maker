<template>
  <div class="map-layout">
    <slot></slot>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.map-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
