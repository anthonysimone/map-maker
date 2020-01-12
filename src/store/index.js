import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { vuexfireMutations } from 'vuexfire'

import user from './modules/user'
import item from './modules/item'
import map from './modules/map'
import webglmap from './modules/webglmap'
import todo from './modules/todo'
import threeMap from './modules/threeMap'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  plugins: [createPersistedState({
    key: 'vuex-map-maker',
    paths: ['user', 'item', 'map', 'webglmap', 'todo']
  })],
  mutations: {
    ...vuexfireMutations
  },
  actions: {

  },
  modules: {
    user,
    item,
    map,
    webglmap,
    todo,
    threeMap
  }
})
