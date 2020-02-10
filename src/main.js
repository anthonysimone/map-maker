import Vue from 'vue'
import App from './App.vue'
import { router } from './router'
import store from '@/store'

import auth from '@/firebase/auth/index'
import * as firebase from 'firebase/app'
// import db from '@/firebase/firestore/index'

import VModal from 'vue-js-modal'
import VShortkey from 'vue-shortkey'
import { VueHammer } from 'vue2-hammer'

// fontawesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faMousePointer, faPlusSquare, faMinusSquare, faFastForward, faPlay,
  faStarOfLife, faCaretSquareDown, faTv, faUndo, faPlusCircle, faMinusCircle
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VueTippy, { TippyComponent } from 'vue-tippy'

import SiteDefaultLayout from '@/components/layouts/SiteDefaultLayout.vue'
import MapLayout from '@/components/layouts/MapLayout.vue'
import WebglmapLayout from '@/components/layouts/WebglmapLayout.vue'

Vue.config.productionTip = false
Vue.use(VModal, { dialog: true, dynamic: true })
Vue.use(VShortkey)
Vue.use(VueHammer)

// Initialize fontawesome icons
library.add(faMousePointer)
library.add(faPlusSquare)
library.add(faMinusSquare)
library.add(faPlusCircle)
library.add(faMinusCircle)
library.add(faFastForward)
library.add(faPlay)
library.add(faStarOfLife)
library.add(faCaretSquareDown)
library.add(faTv)
library.add(faUndo)
Vue.component('font-awesome-icon', FontAwesomeIcon)

// Initialize tippy
Vue.use(VueTippy)
Vue.component('tippy', TippyComponent)

// Add layouts globally
Vue.component('site-default-layout', SiteDefaultLayout)
Vue.component('map-layout', MapLayout)
Vue.component('webglmap-layout', WebglmapLayout)

let app

firebase.auth().onAuthStateChanged((user) => {
  if (!app) {
    app = new Vue({
      router,
      store,
      beforeCreate () {
        auth.init(this)
      },
      render: h => h(App)
    }).$mount('#app')
  }
})
