import Webglmaps from '@/firebase/firestore/Webglmaps'

const state = {
  webglmapsByUser: []
}

const getters = {
  mapsByUser: state => state.webglmapsByUser,
  mapById: state => id => state.webglmapsByUser.find(map => map.id === id)
}

const mutations = {
  setWebglmapsByUser: (state, webglmaps) => {
    state.webglmapsByUser = webglmaps
  },
  addWebglmap: (state, webglmap) => {
    state.webglmapsByUser.push(webglmap)
  },
  updateWebglmap: (state, { itemToUpdate, dataToUpdate }) => {
    Object.assign(itemToUpdate, dataToUpdate)
  },
  deleteWebglmap: (state, id) => {
    let index = state.webglmapsByUser.map(webglmap => webglmap.id).indexOf(id)
    state.webglmapsByUser.splice(index, 1)
  }
}

const actions = {
  setWebglmapsByUser: ({ commit, rootState }) => {
    Webglmaps.getWebglmapsByUser(rootState.user.userProfile).then((querySnapshot) => {
      let result = []
      if (!querySnapshot.empty) {
        for (let doc of querySnapshot.docs) {
          result.push(Object.assign(doc.data(), { id: doc.id }))
        }
      }
      commit('setWebglmapsByUser', result)
    })
  },
  addWebglmap: ({ commit }, webglmap) => {
    return new Promise((resolve, reject) => {
      Webglmaps.addMap(webglmap).then((docRef) => {
        webglmap.id = docRef.id
        commit('addMap', webglmap)
        resolve(docRef.id)
      })
        .catch((error) => {
          reject(error)
        })
    })
  },
  updateWebglmap: ({ commit, getters }, { id, dataToUpdate }) => {
    return new Promise(() => {
      Webglmaps.updateWebglmap(id, dataToUpdate).then(() => {
        // success, we pass the item to update as well as the updates themselves to the mutation
        commit('updateWebglmap', {
          itemToUpdate: getters.mapWebglmapId(id),
          dataToUpdate
        })
      }).catch((error) => {
        console.log('Error updating document: ', error)
      })
    })
  },
  deleteWebglmap: ({ commit }, id) => {
    return new Promise((resolve, reject) => {
      Webglmaps.deleteWebglmap(id).then(() => {
        commit('deleteWebglmap', id)
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
