import { db } from '@/firebase/firestore/index'

export default {
  users: db.collection('users'),
  getUser (uid) {
    return this.users.doc(uid).get()
  },
  setUser (uid, userProfile, options = {}) {
    return this.users.doc(uid).set(userProfile, options)
  }
}
