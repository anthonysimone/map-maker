<template>
  <div class="home">
    <page-header pageTitle="Map Maker" subTitle="Play together!"></page-header>
    <section class="section">
      <div class="container">
        <div class="content">
          <h2>Welcome to the home page</h2>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import PageHeader from '@/components/elements/layout/PageHeader.vue'

export default {
  name: 'home',
  components: {
    PageHeader
  }
}
</script>
