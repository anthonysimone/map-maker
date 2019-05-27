<template>
  <div id="app">

    <!-- begin header and menu -->
    <section class="hero is-primary is-small">
      <div class="hero-head">
        <div class="navbar">
          <div class="container">
            <div class="navbar-brand">
              <router-link class="navbar-item" :to="{ name: 'home' }" exact>Map Maker</router-link>
              <span @click="toggleMobileMenu" :class="{ 'navbar-burger burger': true, 'is-active': mobileMenuIsActive }" data-target="navbarMenuHeroA">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
            <div id="navbarMenuHeroA" :class="{ 'navbar-menu': true, 'is-active' : mobileMenuIsActive }">
              <div class="navbar-end">
                <router-link class="navbar-item" :to="{ name: 'about' }">About</router-link>
                <router-link v-if="!isLoggedIn" class="navbar-item" :to="{ name: 'sign-in'}">Sign In</router-link>
                <div v-if="isLoggedIn" :class="['navbar-item dropdown', 'is-right', {'is-active' : dropdownIsActive}]" v-on-clickaway="closeDropdown">
                  <div class="dropdown-trigger">
                    <button class="button is-inverted" @click="toggleDropdown" aria-haspopup="true" aria-controls="dropdown-menu">
                      <span class="icon is-small tiny-button-avatar"></span>
                      <span>{{ userProfile.firstname }}</span>
                    </button>
                  </div>
                  <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                      <router-link class="dropdown-item" :to="{ name: 'dashboard' }">Dashboard</router-link>
                      <router-link class="dropdown-item" :to="{ name: 'map-add' }">New Map</router-link>
                      <hr class="dropdown-divider">
                      <a class="dropdown-item" @click.prevent="logout">Logout</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- end header and menu -->

    <div class="main-content">
      <router-view/>
    </div>

    <footer class="footer hero is-primary is-small">
      <div class="container">
        <p>Map Maker</p>
      </div>
    </footer>

    <v-dialog></v-dialog>
  </div>
</template>

<script>
import auth from '@/firebase/auth/index'
import { mapState, mapGetters } from 'vuex'
import { directive as onClickaway } from 'vue-clickaway'

export default {
  directives: {
    onClickaway
  },
  data () {
    return {
      menuIsActive: false,
      dropdownIsActive: false,
      mobileMenuIsActive: false
    }
  },
  computed: {
    ...mapState('user', ['user']),
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState('user', ['userProfile'])
  },
  methods: {
    logout () {
      auth.logout()
    },
    toggleDropdown () {
      this.dropdownIsActive = !this.dropdownIsActive
    },
    closeDropdown () {
      this.dropdownIsActive = false
    },
    toggleMobileMenu () {
      this.mobileMenuIsActive = !this.mobileMenuIsActive
    }
  }
}
</script>

<style lang="scss">
@import '~bulma';
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
.main-content {
  flex: 1;
}
.tiny-button-avatar {
  border-radius: 100%;
  overflow: hidden;
  background: $info;
}
footer.footer {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
