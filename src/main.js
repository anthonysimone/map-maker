import Vue from 'vue'
import App from './App.vue'
import { router } from './router'
import store from '@/store'

import auth from '@/firebase/auth/index'
// import db from '@/firebase/firestore/index'

import VModal from 'vue-js-modal'

Vue.config.productionTip = false
Vue.use(VModal, { dialog: true, dynamic: true })

new Vue({
  router,
  store,
  beforeCreate () {
    auth.init(this)
  },
  render: h => h(App)
}).$mount('#app')
