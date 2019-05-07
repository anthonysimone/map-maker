import { db } from '@/firebase/firestore/index'

export default {
  maps: db.collection('maps'),
  getMapsByUser (userProfile) {
    return this.maps.where('createdBy', '==', userProfile.id).get()
  },
  addMap (map) {
    return this.maps.add(map)
  },
  updateMap (id, dataToUpdate) {
    return this.maps.doc(id).update(dataToUpdate)
  },
  deleteMap (id) {
    return this.maps.doc(id).delete()
  }
}
