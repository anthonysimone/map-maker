<template>
  <div class="hero is-primary">
    <div class="hero-body">
      <div class="container has-text-centered">
        <h1 class="title is-1" v-text="pageTitle"></h1>
        <h2 class="subtitle" v-show="subTitle" v-text="subTitle"></h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pageTitle: { required: true },
    subTitle: { default: '' }
  }
}
</script>

<style lang="scss">

</style>
