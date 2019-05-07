<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{ name: 'home' }">Home</router-link> |
      <router-link :to="{ name: 'about' }">About</router-link> |
      <router-link :to="{ name: 'dashboard' }">Dashboard</router-link> |
      <router-link v-if="!isLoggedIn" :to="{ name: 'sign-in' }">Sign In</router-link>
      <button v-if="isLoggedIn" @click.prevent="logout">Sign Out</button>
    </div>
    <router-view/>
  </div>
</template>

<script>
import auth from '@/firebase/auth/index'
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['user']),
    ...mapGetters('user', ['isLoggedIn'])
  },
  methods: {
    logout () {
      let loggedout = auth.logout()
      console.log(loggedout)
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
