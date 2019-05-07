const state = {
  items: []
}

const getters = {
  items: state => state.items
}

const mutations = {
  addItem: (state, item) => {
    state.items.push(item)
  },
  deleteItem: (state, index) => {
    state.items.splice(index, 1)
  }
}

const actions = {
  addItem: ({ commit }, item) => {
    commit('addItem', item)
  },
  deleteItem: ({ commit }, index) => {
    commit('deleteItem', index)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
