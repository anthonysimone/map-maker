import Maps from '@/firebase/firestore/Maps'

const state = {
  mapsByUser: []
}

const getters = {
  mapsByUser: state => state.mapsByUser,
  mapById: state => id => state.mapsByUser.find(map => map.id === id)
}

const mutations = {
  setMapsByUser: (state, maps) => {
    state.mapsByUser = maps
  },
  addMap: (state, map) => {
    state.mapsByUser.push(map)
  },
  updateMap: (state, { itemToUpdate, dataToUpdate }) => {
    Object.assign(itemToUpdate, dataToUpdate)
  },
  deleteMap: (state, id) => {
    let index = state.mapsByUser.map(map => map.id).indexOf(id)
    state.mapsByUser.splice(index, 1)
  }
}

const actions = {
  setMapsByUser: ({ commit, rootState }) => {
    Maps.getMapsByUser(rootState.user.userProfile).then((querySnapshot) => {
      let result = []
      if (!querySnapshot.empty) {
        for (let doc of querySnapshot.docs) {
          result.push(Object.assign(doc.data(), { id: doc.id }))
        }
      }
      commit('setMapsByUser', result)
    })
  },
  addMap: ({ commit }, map) => {
    return new Promise((resolve, reject) => {
      Maps.addMap(map).then((docRef) => {
        map.id = docRef.id
        commit('addMap', map)
        resolve(docRef.id)
      })
        .catch((error) => {
          reject(error)
        })
    })
  },
  updateMap: ({ commit, getters }, { id, dataToUpdate }) => {
    return new Promise(() => {
      Maps.updateMap(id, dataToUpdate).then(() => {
        // success, we pass the item to update as well as the updates themselves to the mutation
        commit('updateMap', {
          itemToUpdate: getters.mapById(id),
          dataToUpdate
        })
      }).catch((error) => {
        console.log('Error updating document: ', error)
      })
    })
  },
  deleteMap: ({ commit }, id) => {
    return new Promise((resolve, reject) => {
      Maps.deleteMap(id).then(() => {
        commit('deleteMap', id)
        resolve(id)
      }).catch((error) => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
