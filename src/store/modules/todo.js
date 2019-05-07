import { db } from '@/firebase/firestore/index'
import { firestoreAction } from 'vuexfire'

const state = {
  todos: []
}

const getters = {

}

const mutations = {

}

const actions = {
  bindTodos: firestoreAction(({ bindFirestoreRef }) => {
    // return the promise returned by `bindFirestoreRef`
    return bindFirestoreRef('todos', db.collection('todos'))
  })
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
