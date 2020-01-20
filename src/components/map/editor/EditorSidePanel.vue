<template>
  <div class="editor-panel">
    <div class="control">
      <label>Tool</label>
      <div class="tool-state horizontal-radios">
        <label class="radio-label">
          <input type="radio" value="activate" checked name="editTool" v-model="editTool" @change="onEditToolChange">
          <span>Activate</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="create" name="editTool" v-model="editTool" @change="onEditToolChange">
          <span>Create</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="select" name="editTool" v-model="editTool" @change="onEditToolChange">
          <span>Select</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="delete" name="editTool" v-model="editTool" @change="onEditToolChange">
          <span>Delete</span>
        </label>
      </div>
    </div>
    <div class="control tool-mode">
      <label>Edit Mode</label>
      <div class="horizontal-radios">
        <label class="radio-label">
          <input type="radio" value="normal" checked name="editMode" v-model="editMode">
          <span>Normal</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="quick" name="editMode" v-model="editMode">
          <span>Quick</span>
        </label>
      </div>
    </div>
    <div class="control creation-tile-type" :class="{ enabled: editTool === 'create' }">
      <label>Creation Tile Type</label>
      <div class="list-radios">
        <label class="radio-label">
          <input type="radio" value="first" checked name="creationTileType" v-model="creationTileType">
          <span>Floor</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="second" name="creationTileType" v-model="creationTileType">
          <span>Wall</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="third" name="creationTileType" v-model="creationTileType">
          <span>Door</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="fourth" name="creationTileType" v-model="creationTileType">
          <span>Water</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="fifth" name="creationTileType" v-model="creationTileType">
          <span>Pit</span>
        </label>
      </div>
    </div>
    <div class="control">
      <button class="reset-button" @click="resetAllTiles">Reset tile position!</button>
    </div>
    <div class="control selected-tile-actions" :class="{ 'has-selection': selectedTile }">
      <span class="selected-tile-label">{{ selectedTile }}</span>
      <button class="rotate-tile" @click="onRotateTile">Rotate</button>
    </div>
    <div class="control hero-action">
      <label>Add hero to selected tile</label>
      <button class="place-hero" @click="onPlaceHero">Place Hero</button>
      <div class="d-pad">
        <button class="rotate-hero-left" @click="rotateModelLeft">&larr;</button>
        <button class="rotate-hero-right" @click="rotateModelRight">&rarr;</button>
        <button class="move-hero-forward" @click="moveModelForward">&uarr;</button>
        <button class="move-hero-backward" @click="moveModelBackward">&darr;</button>
        <label class="enable-wasd toggle-check-label">
          <input type="checkbox" value="true" name="enableWASD">
          <span>Enable WASD</span>
        </label>
      </div>
    </div>
    <div class="control">
      <button class="go-fullscreen" @click="fullscreenMap">Go Fullscreen</button>
    </div>
    <div class="control">
      <button class="save" @click="saveMap">Save!</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { generateTilesJson } from '@/components/threejs/MapRenderer/mapHelpers'
import { deconstructTileStringId, openElementFullscreen } from '@/components/threejs/MapRenderer/helpers'
import { rotateModel, moveForward, moveBackward } from '@/components/threejs/MapRenderer/heroActions'
import { tweenActiveTileToggle } from '@/components/threejs/MapRenderer/tweens'
import { getSelectedTilePosition } from '@/components/threejs/MapRenderer/tileActions'

export default {
  name: 'editor-side-panel',
  data () {
    return {
      wasdEnabled: false
    }
  },
  computed: {
    // Edit related computed props
    ...mapGetters('threeMap', {
      instancedMeshesVuex: 'instancedMeshes',
      selectedTile: 'selectedTile',
      selectionHighlighter: 'selectionHighlighter',
      characterGroup: 'characterGroup'
    }),
    editMode: {
      get () {
        return this.$store.state.threeMap.editMode
      },
      set (editMode) {
        this.$store.dispatch('threeMap/setEditMode', editMode)
      }
    },
    editTool: {
      get () {
        return this.$store.state.threeMap.editTool
      },
      set (editTool) {
        this.$store.dispatch('threeMap/setEditTool', editTool)
      }
    },
    creationTileType: {
      get () {
        return this.$store.state.threeMap.creationTileType
      },
      set (tileType) {
        this.$store.dispatch('threeMap/setCreationTileType', tileType)
      }
    }
  },
  methods: {
    saveMap () {
      // Get all of the instanced mesh keys
      let tilesJson = generateTilesJson(this.instancedMeshesVuex)

      this.$emit('saveMap', { tilesJson })
    },
    toggleEditorPanel () {
      this.showEditorPanel = !this.showEditorPanel
    },

    // edit related methods
    addModelToSelectedTile () {
      if (this.selectedTile) {
        let v = getSelectedTilePosition(this.selectedTile, this.instancedMeshesVuex)
        v.y = 0.25
        this.$store.dispatch('threeMap/setCharacterPosition', { x: v.x, y: v.y, z: v.z })
      } else {
        alert('You must select a tile!')
      }
    },
    onEditToolChange (event) {
      if (this.editTool !== 'select') {
        this.$store.dispatch('threeMap/clearTileSelection')
      }
    },
    onRotateTile () {
      let { name, instanceId } = deconstructTileStringId(this.selectedTile)
      this.$store.dispatch('threeMap/rotateInstance', { name, instanceId })
    },
    onPlaceHero () {
      this.addModelToSelectedTile()
    },
    rotateModelLeft () {
      rotateModel(this.characterGroup, false)
    },
    rotateModelRight () {
      rotateModel(this.characterGroup, true)
    },
    moveModelForward () {
      moveForward(this.characterGroup)
    },
    moveModelBackward () {
      moveBackward(this.characterGroup)
    },
    fullscreenMap () {
      openElementFullscreen(document.body)
    },
    /**
     * Reset all tiles
     */
    resetAllTiles () {
      let instancedMeshNames = Object.keys(this.instancedMeshesVuex)
      instancedMeshNames.forEach(name => {
        let instanceKeys = Object.keys(this.instancedMeshesVuex[name].mesh.userData)
        instanceKeys.forEach(instanceId => {
          if (this.instancedMeshesVuex[name].mesh.userData[instanceId].isActive) {
            tweenActiveTileToggle(this.instancedMeshesVuex[name].mesh, instanceId, false)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes pulsebg {
  0% {
    background: #fff;
  }

  100% {
    background: #beb6ce;
  }
}

.control {
  padding: 10px;
  border: 1px solid pink;
  &:not(:first-child) {
    margin-top: 10px;
  }
}

.toggle-check-label {
  display: block;
  position: relative;
  font-size: 12px;

  span {
    display: block;
    padding: 4px;
    border: 2px solid purple;
    background: #fff;
    border-radius: 5px;
    cursor: pointer;
  }

  input:checked + span {
    animation: pulsebg infinite 0.5s alternate linear;
  }
}

.horizontal-radios {
  display: flex;

  .radio-label {
    display: block;
    position: relative;
    font-size: 12px;
  }
}

.horizontal-radios .radio-label input,
.toggle-check-label input {
  position: absolute;
  left: 5px;
  bottom: 2px;
  font-size: 0;
  z-index: -1;
}

.horizontal-radios .radio-label {
  span {
    display: block;
    background: #fff;
    padding: 2px;
    border: 1px solid purple;
    cursor: pointer;
  }

  &:not(:first-child) span {
    border-left: none;
  }

  input:checked + span {
    background-color: #beb6ce;
  }
}

.list-radios {
  font-size: 12px;

  label {
    display: block;
  }
}

.selected-tile-actions {
  display: none;

  &.has-selection {
    display: block;
  }
}

.creation-tile-type {
  display: none;

  &.enabled {
    display: block;
  }
}

.d-pad {
  display: grid;
  width: 80px;
  grid-template-columns: 1fr 1fr 1fr 60px;
  grid-template-rows: 20px 20px;
  grid-column-gap: 4px;
  grid-row-gap: 4px;
}

.d-pad button {
  background: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
  padding: 2px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1;
}

.rotate-hero-right {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}

.rotate-hero-left {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.move-hero-forward {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.move-hero-backward {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.enable-wasd {
  grid-column: 4 / 5;
  grid-row: 1 / 3;
}
</style>
