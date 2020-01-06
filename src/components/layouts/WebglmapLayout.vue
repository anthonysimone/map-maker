<template>
  <div class="webglmap-layout">
    <slot></slot>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.webglmap-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}
</style>
