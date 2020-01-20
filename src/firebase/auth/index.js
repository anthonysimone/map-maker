import * as firebase from 'firebase/app'
import 'firebase/auth'
import * as firebaseui from 'firebaseui'
import Users from '@/firebase/firestore/Users'
import '@/firebase/firestore/index'

const auth = {
  context: null,
  uiConfig: null,
  ui: null,

  init (context) {
    this.context = context
    this.uiConfig = {
      signInSuccessUrl: 'dashboard',
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    }
    this.ui = new firebaseui.auth.AuthUI(firebase.auth())
    firebase.auth().onAuthStateChanged((user) => {
      if (user && this.isNewUser(user)) {
        Users.getUser(user.uid).then((querySnapshot) => {
          if (!querySnapshot.exists) {
            let userProfile = {
              id: user.uid,
              firstname: user.displayName.split(' ')[0],
              lastname: user.displayName.split(' ')[1] || '',
              email: user.email,
              photoUrl: user.photoURL
            }
            Users.setUser(user.uid, userProfile).then((docRef) => {
              this.context.$store.dispatch('user/setCurrentUserProfile', userProfile)
            })
              .catch(function (error) {
                console.error('Error adding document: ', error)
              })
          }
        })
      } else if (user) {
        Users.getUser(user.uid).then((querySnapshot) => {
          if (querySnapshot.exists) {
            this.context.$store.dispatch('user/setCurrentUserProfile', querySnapshot.data())
            this.context.$store.dispatch('map/setMapsByUser', querySnapshot.data())
          }
        })
      }
      this.context.$store.dispatch('user/setCurrentUser')

      let requireAuth = this.context.$route.matched.some(record => record.meta.requiresAuth)
      let guestOnly = this.context.$route.matched.some(record => record.meta.guestOnly)

      if (requireAuth && !user) this.context.$router.push({ name: 'sign-in' })
      else if (guestOnly && user) this.context.$router.push({ name: 'dashboard' })
    })
  },
  authForm (container) {
    this.ui.start(container, this.uiConfig)
  },
  user () {
    return firebase.auth().currentUser
  },
  logout () {
    // TODO: not sure if I need to actually clean up the log out here
    let loggedOut = firebase.auth().signOut()
    // this.context.$store.dispatch('user/logOut')
    return loggedOut
  },
  isNewUser (user) {
    return user.metadata.creationTime === user.metadata.lastSignInTime
  }
}

export default auth
