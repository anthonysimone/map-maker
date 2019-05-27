<template>
  <div class="map-detail">
    <page-header pageTitle="Add a New Map" subTitle="More maps, more fun!"></page-header>
    <div class="container page-container">
      <section class="section">
        <form @submit.prevent="addNewMap" class="add-map-form">
          <div class="field">
            <label class="label is-small">
              Name
              <div class="control">
                <input type="text" v-model="newMap.name" required class="input is-small">
                </div>
            </label>
          </div>

          <div class="field">
            <label class="label is-small">
              Map Width (x-axis)
              <div class="contro">
                <input type="number" v-model.number="newMap.tilesWidth" required class="input is-small">
              </div>
            </label>
          </div>

          <div class="field">
            <label class="label is-small">
              Map Length (y-axis)
              <div class="control">
                <input type="number" v-model.number="newMap.tilesLength" required class="input is-small">
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
  name: 'map-add',
  components: {
    PageHeader
  },
  data () {
    return {
      newMap: {
        name: '',
        tilesLength: null,
        tilesWidth: null,
        createdBy: ''
      }
    }
  },
  computed: {
    ...mapState('user', ['userProfile']),
    newTiles () {
      if (this.newMap.tilesLength > 0 && this.newMap.tilesWidth > 0) {
        let tiles = {}
        for (let l = 0; l < this.newMap.tilesLength; l++) {
          let row = {}
          for (let w = 0; w < this.newMap.tilesWidth; w++) {
            // initialize a new tile
            row[w] = {
              walkability: true,
              position: {
                x: w,
                y: l
              }
            }
          }
          tiles[l] = row
        }
        return tiles
      } else {
        return null
      }
    }
  },
  methods: {
    addNewMap () {
      console.log('Trying to add new map!', this.newMap)
      console.log('new tiles', this.newTiles)
      if (!this.newTiles) {
        alert('You must add positive numbers for width and length.')
        return
      }

      let newMap = Object.assign({}, this.newMap)
      // Add tiles
      newMap.tiles = this.newTiles
      // Add default contants, TODO: refactor to a map service
      newMap.startCoords = { x: 0, y: 0 }
      // this.waitingForResponse = true
      this.$store.dispatch('map/addMap', newMap)
        .then(response => {
          this.$router.push({ name: 'map-detail', params: { id: response } })
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          // this.waitingForResponse = false
        })
    }
  },
  mounted () {
    // On mount, add the created by key for current user
    this.newMap.createdBy = this.userProfile.id
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
