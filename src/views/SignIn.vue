<template>
  <div class="sign-in">
    <page-header pageTitle="Sign In" subTitle="Join the party!"></page-header>
    <div class="container">
      <section class="section">
        <div id="firebaseui-auth-container"></div>
      </section>
    </div>
  </div>
</template>

<script>
import auth from '@/firebase/auth/index'

import PageHeader from '@/components/elements/layout/PageHeader.vue'

export default {
  name: 'sign-in',
  components: {
    PageHeader
  },
  mounted () {
    auth.authForm('#firebaseui-auth-container')
  }
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/firebaseui/dist/firebaseui.css";
</style>
