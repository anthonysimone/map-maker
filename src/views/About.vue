<template>
  <div class="about">
    <page-header pageTitle="About Map Maker" subTitle="Ready to make some maps?"></page-header>
    <section class="section">
      <div class="container">
        <h2>What's Map Maker?</h2>
        <p>If you've come here, you're probably trying to make some maps. Well you've found the spot, head over to the <router-link :to="{ name: 'sign-in'}">sign in page</router-link> and make it official!</p>
      </div>
    </section>
  </div>
</template>

<script>
import PageHeader from '@/components/elements/layout/PageHeader.vue'

export default {
  components: {
    PageHeader
  }
}
</script>
