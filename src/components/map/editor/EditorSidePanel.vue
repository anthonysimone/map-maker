<template>
  <div class="editor-panel">

    <!-- Create tool contextual controls -->
    <div class="control creation-tile-type" v-if="editTool === 'create'">
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

    <!-- Add model contextual controls -->
    <div class="control add-model-type" v-if="editTool === 'addModel'">
      <label>Add Model Type</label>
      <div class="list-radios">
        <label class="radio-label">
          <input type="radio" value="robot" checked name="addModelType" v-model="addModelType">
          <span>Robot</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="slime" name="addModelType" v-model="addModelType">
          <span>Slime</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="skeleton" name="addModelType" v-model="addModelType">
          <span>Skeleton</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="goblin" name="addModelType" v-model="addModelType">
          <span>Goblin</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="bat" name="addModelType" v-model="addModelType">
          <span>Bat</span>
        </label>
      </div>
    </div>

    <!-- Select tool contextual controls: editing selected tile -->
    <section class="contextual-controls selected-tile-actions" v-if="selectedTile">
      <h3>Selected Tile: {{ selectedTile }}</h3>
      <div class="control">
        <span class="selected-tile-label button-group-label">Rotate</span>
        <button @click="onRotateTile" class="button is-small" content="Rotate counter clockwise" v-tippy="{ placement : 'bottom',  arrow: true }">
          <span class="icon is-small">
            <font-awesome-icon icon="undo"></font-awesome-icon>
          </span>
        </button>
      </div>
    </section>

    <!-- Select tool contextual controls: editing selected model -->
    <section class="contextual-controls selected-model-actions" v-if="selectedModel">
      <h3>Selected Model: {{ selectedModel }}</h3>
      <div class="control">
        <span class="selected-model-label button-group-label">Rotate</span>
        <button @click="onRotateModel" class="button is-small" content="Rotate counter clockwise" v-tippy="{ placement : 'bottom',  arrow: true }">
          <span class="icon is-small">
            <font-awesome-icon icon="undo"></font-awesome-icon>
          </span>
        </button>
      </div>
    </section>

    <!-- Hero selection contextual controls -->
    <div class="control hero-action">
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { threeMap } from '@/helpers/services/threeMapService'

import { deconstructTileStringId, deconstructModelStringId } from '@/components/threejs/MapRenderer/helpers'
import { rotateModel, moveForward, moveBackward } from '@/components/threejs/MapRenderer/heroActions'

export default {
  name: 'editor-side-panel',
  data () {
    return {
      wasdEnabled: false
    }
  },
  computed: {
    // Edit related computed props
    ...mapGetters('threeMap', [
      'selectedTile',
      'selectedModel',
      'editTool'
    ]),
    creationTileType: {
      get () {
        return this.$store.state.threeMap.creationTileType
      },
      set (tileType) {
        this.$store.dispatch('threeMap/setCreationTileType', tileType)
      }
    },
    addModelType: {
      get () {
        return this.$store.state.threeMap.addModelType
      },
      set (modelType) {
        this.$store.dispatch('threeMap/setAddModelType', modelType)
      }
    }
  },
  methods: {
    // edit related methods
    onRotateTile () {
      let { name, instanceId } = deconstructTileStringId(this.selectedTile)
      threeMap.rotateInstance({ name, instanceId })
    },
    onRotateModel () {
      let { modelType, instanceNumber } = deconstructModelStringId(this.selectedModel)
      threeMap.rotateModel({ modelType, instanceNumber })
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
