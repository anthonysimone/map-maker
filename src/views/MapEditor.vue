<template>
  <div class="map-editor">
    <div class="container page-container">
      <section class="section">
        <h1>Edit: {{ editableMapData.name }}</h1>
        <div class="toolbar">
          <button class="button is-small"
            v-shortkey.once="{cmdSave: ['meta', 's'], ctrlSave: ['ctrl', 's']}"
            @shortkey="saveMap"
            @click="saveMap"
          >Save</button>
          <confirmation-modal classes="button is-small is-danger"
            @confirmationSuccess="resetMap"
            dialog-title="Warning!"
            dialog-body="You are about to reset your map edits back to your last save. If you do this, you will lose ALL changes you've made since the last time you've saved last. This cannot be undone."
          >Reset</confirmation-modal>
        </div>
        <display-map :map="editableMapData" :editable="true"></display-map>
      </section>
    </div>
    <section class="editor-panel" :class="{'is-active': showEditorPanel}">
      <button @click="toggleEditorPanel" class="editor-panel-toggle">O</button>
      <div class="slideout-wrapper">
        <h3 class="h3">Change Grid Size</h3>
        <form @submit.prevent="updateMapSizeAbsolute">
          <label class="label">Length
            <input class="input is-small" type="number"
              v-model.number="editableLength" @change="clearAnchor">
          </label>
          <label class="label">Width
            <input class="input is-small" type="number"
              v-model.number="editableWidth" @change="clearAnchor">
          </label>
          <div class="control">
            <label class="label">Anchor</label>
            <div class="anchor-radios">
              <div class="radio">
                <input type="radio" name="anchor" id="anchor1" required value="topleft"
                  :disabled="!canAnchorCorners" v-model="anchor"
                ><label for="anchor1">Top Left</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor2" required value="top"
                  :disabled="!canAnchorVertical" v-model="anchor"
                ><label for="anchor2">Top</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor3" required value="topright"
                   :disabled="!canAnchorCorners" v-model="anchor"
                ><label for="anchor3">Top Right</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor4" required value="left"
                  :disabled="!canAnchorHorizontal" v-model="anchor"
                ><label for="anchor4">Left</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor5" required value="middle"
                  :disabled="!canAnchorMiddle" v-model="anchor"
                ><label for="anchor5">Middle</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor6" required value="right"
                  :disabled="!canAnchorHorizontal" v-model="anchor"
                ><label for="anchor6">Right</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor7" required value="bottomleft"
                  :disabled="!canAnchorCorners" v-model="anchor"
                ><label for="anchor7">Bottom Left</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor8" required value="bottom"
                  :disabled="!canAnchorVertical" v-model="anchor"
                ><label for="anchor8">Bottom</label>
              </div>
              <div class="radio">
                <input type="radio" name="anchor" id="anchor9" required value="bottomright"
                  :disabled="!canAnchorCorners" v-model="anchor"
                ><label for="anchor9">Bottom Right</label>
              </div>
            </div>
            <p class="help is-danger" v-if="isSmaller">Your new grid is smaller than your current one, this means you will be losing tiles. Place your anchor carefully!</p>
          </div>
          <button :disabled="!anchor">Adjust map size</button>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import DisplayMap from '@/components/map/DisplayMap.vue'
import ConfirmationModal from '@/components/elements/functional/ConfirmationModal'

export default {
  name: 'map-editor',
  components: {
    DisplayMap,
    ConfirmationModal
  },
  data () {
    return {
      id: this.$route.params.id,
      editableMapData: null,
      editableWidth: null,
      editableLength: null,
      anchor: null,
      showEditorPanel: false
    }
  },
  computed: {
    ...mapGetters('map', ['mapById']),
    map () {
      return this.mapById(this.id)
    },
    lengthDifference () {
      return this.editableLength - this.editableMapData.tilesLength
    },
    widthDifference () {
      return this.editableWidth - this.editableMapData.tilesWidth
    },
    isSmaller () {
      return this.lengthDifference < 0 || this.widthDifference < 0
    },
    normalizedLengthChange () {
      let lengthChange = 0
      if (this.lengthDifference !== 0) {
        lengthChange = (this.lengthDifference % 2) ? 1 : 2
      }
      return lengthChange
    },
    normalizedWidthChange () {
      let widthChange = 0
      if (this.widthDifference !== 0) {
        widthChange = (this.widthDifference % 2) ? 1 : 2
      }
      return widthChange
    },
    canAnchorCorners () {
      return this.normalizedLengthChange !== 0 && this.normalizedWidthChange !== 0
    },
    canAnchorHorizontal () {
      return this.normalizedLengthChange !== 1 && this.normalizedWidthChange > 0
    },
    canAnchorVertical () {
      return this.normalizedLengthChange > 0 && this.normalizedWidthChange !== 1
    },
    canAnchorMiddle () {
      return (this.normalizedLengthChange !== 0 || this.normalizedWidthChange !== 0) &&
              this.normalizedLengthChange !== 1 && this.normalizedWidthChange !== 1
    },
    getOffset () {
      let offset
      switch (this.anchor) {
        case 'topleft':
          // if anchored top left, offset will always be 0,0
          offset = { x: 0, y: 0 }
          break
        case 'top':
          // if offset is at top, y offset is always 0, x is half original - new
          offset = { x: this.widthDifference / 2, y: 0 }
          break
        case 'topright':
          offset = { x: this.widthDifference, y: 0 }
          break
        case 'left':
          offset = { x: 0, y: this.lengthDifference / 2 }
          break
        case 'middle':
          offset = { x: this.widthDifference / 2, y: this.lengthDifference / 2 }
          break
        case 'right':
          offset = { x: this.widthDifference, y: this.lengthDifference / 2 }
          break
        case 'bottomleft':
          offset = { x: 0, y: this.lengthDifference }
          break
        case 'bottom':
          offset = { x: this.widthDifference / 2, y: this.lengthDifference }
          break
        case 'bottomright':
          offset = { x: this.widthDifference, y: this.lengthDifference }
          break
        default:
          offset = { x: 0, y: 0 }
          break
      }

      return offset
    }
  },
  methods: {
    test () { console.log(this.anchor) },
    saveMap () {
      console.log('Saving!!!')
      let copiedMapData = JSON.parse(JSON.stringify(this.editableMapData))
      // Update action
      this.$store.dispatch('map/updateMap', {
        id: this.id,
        dataToUpdate: copiedMapData
      })
    },
    resetMap () {
      this.setEditableMapData()
    },
    setEditableMapData () {
      this.editableMapData = JSON.parse(JSON.stringify(this.map))
      this.editableLength = this.editableMapData.tilesLength
      this.editableWidth = this.editableMapData.tilesWidth
    },
    clearAnchor () {
      this.anchor = null
    },
    toggleEditorPanel () {
      this.showEditorPanel = !this.showEditorPanel
    },
    updateMapSizeAbsolute () {
      let startCoords = this.editableMapData.startCoords
      let offset = this.getOffset

      let newStartCoords = {
        x: startCoords.x - offset.x,
        y: startCoords.y - offset.y
      }

      let tiles = {}

      for (let l = newStartCoords.y; l < (newStartCoords.y + this.editableLength); l++) {
        let row = {}
        for (let w = newStartCoords.x; w < (newStartCoords.x + this.editableWidth); w++) {
          let newTile = this.getTileOrGenerateNewTile({ x: w, y: l }, this.editableMapData)
          row[w] = {
            ...newTile,
            position: {
              x: w,
              y: l
            }
          }
        }
        tiles[l] = row
      }

      console.log('old map', this.editableMapData)

      this.editableMapData = {
        ...this.editableMapData,
        tilesLength: this.editableLength,
        tilesWidth: this.editableWidth,
        tiles,
        startCoords: newStartCoords
      }

      console.log('new map', this.editableMapData)
    },
    updateMapSizeByOffset () {
      let offset = this.getOffset
      console.log(offset)

      // Build our new map using the new size as the frame and getting existing tiles
      // from the offset and old map when available
      let tiles = {}
      for (let l = 0; l < this.editableLength; l++) {
        let row = {}
        for (let w = 0; w < this.editableWidth; w++) {
          let newCoords = this.modifyCoords({ x: w, y: l }, offset)
          // console.log('current, offset, new', { x: w, y: l }, offset, newCoords)
          let newTile = this.getTileOrGenerateNewTile(newCoords, this.editableMapData)
          row[w] = {
            ...newTile,
            position: {
              x: w,
              y: l
            }
          }
        }
        tiles[l] = row
      }

      console.log('old map', this.editableMapData)

      this.editableMapData = {
        ...this.editableMapData,
        tilesLength: this.editableLength,
        tilesWidth: this.editableWidth,
        tiles
      }

      console.log('new map', this.editableMapData)
    },
    getTileFromMap (coords, map) {
      if (map.tiles.hasOwnProperty(coords.y) && map.tiles[coords.y].hasOwnProperty(coords.x)) {
        return map.tiles[coords.y][coords.x]
      } else {
        return null
      }
    },
    getTileOrGenerateNewTile (coords, map) {
      let oldTile = this.getTileFromMap(coords, map)
      if (oldTile) {
        // console.log('tile exists!')
        return oldTile
      } else {
        // console.log('generating new tile!')
        // generate new default tile settings
        return {
          walkability: true
        }
      }
    },
    modifyCoords (coords, offset) {
      return {
        x: coords.x - offset.x,
        y: coords.y - offset.y
      }
    }
  },
  created () {
    this.setEditableMapData()
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
.map-editor {
  position: relative;
}
.editor-panel {
  position: absolute;
  top: 0;
  left: 100%;
  width: 400px;
  height: 100%;
  background: pink;
  transform: translate3d(0, 0, 0);
  transition: transform 300ms ease-in-out;
  &.is-active {
    transform: translate3d(-100%, 0, 0);
  }

  .editor-panel-toggle {
    position: absolute;
    top: 40px;
    right: 100%;
    font-size: 30px;
    -webkit-appearance: none;
  }
}

.anchor-radios {
  display: inline-grid;
  grid-template-rows: repeat(3, 30px);
  grid-template-columns: repeat(3, 30px);
  border: 2px solid green;
  .radio {
    position: relative;
    margin: 0;
    overflow: hidden;

    label {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      height: 30px;
      width: 30px;
      background: #fff;
      border: 2px solid green;
      color: transparent;
      font-size: 0;
    }

    input:checked + label {
      background-color: lightgreen;
    }

    input:disabled + label {
      background-color: lightgray;
      border-color: gray;
    }
  }
}
</style>