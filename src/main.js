import Vue from 'vue'
import App from './App.vue'
import { router } from './router'
import store from '@/store'

import auth from '@/firebase/auth/index'
// import db from '@/firebase/firestore/index'

import VModal from 'vue-js-modal'
import VShortkey from 'vue-shortkey'
import { VueHammer } from 'vue2-hammer'

import * as VueGL from "vue-gl";

import SiteDefaultLayout from '@/components/layouts/SiteDefaultLayout.vue'
import MapLayout from '@/components/layouts/MapLayout.vue'
import WebglmapLayout from '@/components/layouts/WebglmapLayout.vue'

Vue.config.productionTip = false
Vue.use(VModal, { dialog: true, dynamic: true })
Vue.use(VShortkey)
Vue.use(VueHammer)
Object.keys(VueGL).forEach(name => {
  Vue.component(name, VueGL[name])
})

// Add layouts globally
Vue.component('site-default-layout', SiteDefaultLayout)
Vue.component('map-layout', MapLayout)
Vue.component('webglmap-layout', WebglmapLayout)

new Vue({
  router,
  store,
  beforeCreate () {
    auth.init(this)
  },
  render: h => h(App)
}).$mount('#app')
