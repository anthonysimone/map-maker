import { db } from '@/firebase/firestore/index'

export default {
  webglmaps: db.collection('webglmaps'),
  getMapsByUser (userProfile) {
    return this.webglmaps.where('createdBy', '==', userProfile.id).get()
  },
  addMap (webglmap) {
    return this.webglmaps.add(webglmap)
  },
  updateMap (id, dataToUpdate) {
    return this.webglmaps.doc(id).update(dataToUpdate)
  },
  deleteMap (id) {
    return this.webglmaps.doc(id).delete()
  }
}
