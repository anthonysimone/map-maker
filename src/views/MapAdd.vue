<template>
  <div class="map-detail">
    <page-header pageTitle="Add a New Webgl Map" subTitle="3D maps, more fun!"></page-header>
    <div class="container page-container">
      <section class="section">
        <form @submit.prevent="addNewWebglmap" class="add-map-form">
          <div class="field">
            <label class="label is-small">
              Name
              <div class="control">
                <input type="text" v-model="newWebglmap.name" required class="input is-small">
                </div>
            </label>
          </div>

          <div class="field">
            <label class="label is-small">
              Initial Map Size (as a square)
              <div class="contro">
                <input type="number" v-model.number="newWebglmap.tilesWidth" required class="input is-small">
              </div>
            </label>
          </div>
          <button class="button is-primary">Save!</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PageHeader from '@/components/elements/layout/PageHeader.vue'

export default {
  name: 'webglmap-add',
  components: {
    PageHeader
  },
  data () {
    return {
      newWebglmap: {
        name: '',
        tilesWidth: null,
        createdBy: '',
        threejsTiles: [],
        threejsCharacters: []
      }
    }
  },
  computed: {
    ...mapState('user', ['userProfile'])
  },
  methods: {
    addNewWebglmap () {
      if (!this.newWebglmap.tilesWidth) {
        alert('You must add positive numbers for width and length.')
        return
      }

      if (this.newWebglmap.tilesWidth % 2) {
        alert('You can only use even numbers.')
        return
      }

      let newMap = Object.assign({}, this.newWebglmap)
      // Add tiles
      // newMap.tiles = this.newTiles
      // this.waitingForResponse = true
      this.$store.dispatch('map/addMap', newMap)
        .then(response => {
          this.$router.push({ name: 'map-editor', params: { id: response } })
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          // this.waitingForResponse = false
        })
    }
  },
  mounted () {
    // On mount, add the created by key for current user
    this.newWebglmap.createdBy = this.userProfile.id
  }
}
</script>

<style lang="scss" scoped>
.add-map-form {
  max-width: 300px;
}
.control {
  margin-top: 5px;
}
</style>
