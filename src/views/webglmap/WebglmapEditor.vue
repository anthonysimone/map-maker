<template>
  <div class="map-editor">
    <div class="editor-toolbar">
      <h1>Edit: {{ editableMapData.name }}</h1>
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
      <router-link class="button is-primary is-small edit-map" :to="{name: 'dashboard'}">Dashboard</router-link>
    </div>
    <div class="map-editor-wrapper" ref="mapElementWrapper">
      <display-webglmap :map="map"></display-webglmap>
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

import DisplayWebglmap from '@/components/map/DisplayWebglmap.vue'
import ConfirmationModal from '@/components/elements/functional/ConfirmationModal'

export default {
  name: 'map-editor',
  components: {
    DisplayWebglmap,
    ConfirmationModal
  },
  data () {
    return {
      id: this.$route.params.id,
      editableMapData: null,
      editableWidth: null,
      editableLength: null,
      anchor: null,
      showEditorPanel: false,
      offsetX: 0,
      offsetY: 0,
      initialOffsetX: 0,
      initialOffsetY: 0,
      scale: 1,
      rotateX: '0deg',
      translateZ: '0px',
      isTiltView: false,
      isDragging: false,
      animationDone: false
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
    },
    pxOffsetX () {
      return this.offsetX + 'px'
    },
    pxOffsetY () {
      return this.offsetY + 'px'
    },
    canDecrimentScale () {
      return this.scale > 0.5
    },
    canIncrementScale () {
      return this.scale < 1
    },
    mapPositionStyle () {
      return {
        transform: `translate3d(${this.offsetX}px, ${this.offsetY}px, 0) scale(${this.scale}) rotateX(${this.rotateX})`
      }
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
            ...newTile
          }
        }
        tiles[l] = row
      }

      this.editableMapData = {
        ...this.editableMapData,
        tilesLength: this.editableLength,
        tilesWidth: this.editableWidth,
        tiles,
        startCoords: newStartCoords
      }
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
        return oldTile
      } else {
        // generate new default tile settings
        return {
          walkability: true,
          position: coords
        }
      }
    },
    modifyCoords (coords, offset) {
      return {
        x: coords.x - offset.x,
        y: coords.y - offset.y
      }
    },
    handleDrag (event) {
      // Start the drag and log the initial coords
      if (!this.animationDone) {
        this.animationDone = true
        requestAnimationFrame(() => {
          if (!this.isDragging) {
            this.isDragging = true
            this.initialOffsetX = this.offsetX
            this.initialOffsetY = this.offsetY
          }

          // Update our offsets which will move our map
          this.offsetX = event.deltaX + this.initialOffsetX
          this.offsetY = event.deltaY + this.initialOffsetY

          // Drag ended, this is where we do any end of drag events we need
          if (event.isFinal) {
            this.isDragging = false
          }
          this.animationDone = false
        })
      }
    },
    decreaseScale () {
      this.scale -= 0.1
    },
    increaseScale () {
      this.scale += 0.1
    },
    toggleView () {
      if (this.isTiltView) {
        this.isTiltView = false
        this.rotateX = '0deg'
        this.translateZ = '0px'
      } else {
        this.isTiltView = true
        this.rotateX = '40deg'
        this.translateZ = '-100px'
      }
    }
  },
  created () {
    this.setEditableMapData()
  },
  mounted () {
    this.offsetX = (window.innerWidth - this.map.tilesWidth * 100) / 2
    this.offsetY = (window.innerHeight - this.map.tilesLength * 100) / 2
  }
}
</script>

<style lang="scss" scoped>
.map-editor {
  position: relative;
  flex: 1;
}

.map-editor-wrapper {
  perspective: 600px;
}

.editor-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(#ffffff, 0.9);
  z-index: 10;
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
  z-index: 20;
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
