<template>
  <div class="editor-panel">

    <!-- Create tool contextual controls -->
    <div class="control creation-tile-type" v-if="editTool === 'create'">
      <h3>Create new tile</h3>
      <div class="control">
        <label class="button-group-label">Tile type</label>
        <div class="list-radios">
          <label class="radio-label">
            <input type="radio" value="first" checked name="creationTileName" v-model="creationTileName">
            <span>Floor</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="second" name="creationTileName" v-model="creationTileName">
            <span>Wall</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="third" name="creationTileName" v-model="creationTileName">
            <span>Door</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="fourth" name="creationTileName" v-model="creationTileName">
            <span>Water</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="fifth" name="creationTileName" v-model="creationTileName">
            <span>Pit</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="specialFloor" name="creationTileName" v-model="creationTileName">
            <span>Cool Floor</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="specialFloorLarge" name="creationTileName" v-model="creationTileName">
            <span>Cool Floor 2x2</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="wallWithColumnMerged" name="creationTileName" v-model="creationTileName">
            <span>Wall Merged</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="archDoorWithFloorMerged" name="creationTileName" v-model="creationTileName">
            <span>Arch Door With Floor Merged</span>
          </label>
        </div>
      </div>
      <div class="control">
        <label class="button-group-label">Swap orientation</label>
        <button @click="onChangeOrientation" :disabled="!creationTileName || isCreationTileSquare" class="button is-small" content="Change tile orientation" v-tippy="{ placement : 'bottom',  arrow: true }">
          <span class="icon is-small">
            <font-awesome-icon icon="undo"></font-awesome-icon>
          </span>
        </button>
        <p class="description">For tiles that aren't squares, you can change the orientation that you place them on the map. Once placed, non-square tiles can only be rotated 180 degrees.</p>
      </div>
    </div>

    <!-- Add model contextual controls -->
    <div class="control add-model-type" v-if="editTool === 'addModel'">
      <p class="description">Click a tile to add a model of the chosen type.</p>
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

    <!-- Delete model contextual controls -->
    <div class="control deletet-model" v-if="editTool === 'deleteModel'">
      <p class="description">Click a model to remove it from the map.</p>
    </div>

    <!-- Select tool contextual controls -->
    <div class="control select-tool" v-if="editTool === 'select' && noSelection">
      <p class="description">Click a tile or model to select it and view additonal options.</p>
    </div>

    <!-- Select tool contextual controls: editing selected tile -->
    <section class="contextual-controls selected-tile-actions" v-if="selectedTile">
      <p class="description">Edit selected tile.</p>
      <h3>Selected Tile: {{ selectedTile }}</h3>
      <div class="control">
        <span class="selected-tile-label button-group-label">Rotate</span>
        <button @click="onRotateTile" class="button is-small" :content="`Rotate counter clockwise ${isSelectedTileSquare ? 90 : 180} degrees`" v-tippy="{ placement : 'bottom',  arrow: true }">
          <span class="icon is-small">
            <font-awesome-icon icon="undo"></font-awesome-icon>
          </span>
        </button>
      </div>
    </section>

    <!-- Select tool contextual controls: editing selected model -->
    <section class="contextual-controls selected-model-actions" v-if="selectedModel">
      <h3>Selected Model: {{ selectedModel }}</h3>
      <div class="control horizontal-controls">
        <div>
          <span class="selected-model-label button-group-label">Rotate</span>
          <button @click="onRotateModel" class="button is-small" content="Rotate counter clockwise" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <font-awesome-icon icon="undo"></font-awesome-icon>
            </span>
          </button>
        </div>
        <div>
          <div class="d-pad">
            <button class="rotate-hero-left" @click="rotateModelLeft">&larr;</button>
            <button class="rotate-hero-right" @click="rotateModelRight">&rarr;</button>
            <button class="move-hero-forward" @click="moveModelForward">&uarr;</button>
            <button class="move-hero-backward" @click="moveModelBackward">&darr;</button>
          </div>
        </div>

      </div>

      <div class="control model-animation">
        <label class="button-group-label">Set default animation state</label>
        <select v-model="selectedAction" @change="setDefaultState">
          <option value="none" :selected="selectedAction === 'none'">None</option>
          <option v-for="action in selectedModelActions" :key="action.clipName" :value="action.clipName" :selected="selectedAction === action.clipName">
            {{ action.name }}
          </option>
        </select>
      </div>
      <div class="control model-emotes" v-if="selectedModelEmotes">
        <label class="button-group-label">Trigger Emotes</label>
        <button v-for="emote in selectedModelEmotes" :key="emote.clipName" @click="triggerEmote(emote.clipName)">
          {{ emote.name }}
        </button>
      </div>
    </section>

      <!-- Add model contextual controls -->
    <section>
      <div class="control edit-scene-settings" v-if="editTool === 'scene'">
        <p class="description">Edit general scene settings here!</p>
        <label class="button-group-label">Sky background</label>
        <select v-model="selectedSky" @change="setSky">
          <option value="none" :selected="selectedSky === 'none'">None</option>
          <option value="starrySky" :selected="selectedSky === 'starrySky'">Starry Sky</option>
        </select>
        <label class="button-group-label">Toggle grid</label>
        <button @click="toggleGrid">{{ showGrid ? 'Hide' : 'Show' }} grid</button>
      </div>
    </section>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { threeMap } from '@/helpers/services/threeMapService'

import { deconstructTileStringId, deconstructModelStringId } from '@/components/threejs/MapRenderer/helpers'
import { getModelAnimations } from '@/components/threejs/MapRenderer/modelHelpers'
import { getTileDetails } from '@/components/threejs/MapRenderer/tileModels'

export default {
  name: 'editor-side-panel',
  data () {
    return {
      selectedAction: 'none',
      selectedSky: 'none',
      showGrid: true
    }
  },
  computed: {
    // Edit related computed props
    ...mapGetters('threeMap', [
      'selectedTile',
      'selectedModel',
      'editTool',
      'creationTile',
      'creationTileOrientation'
    ]),
    selectedModelType () {
      let { modelType } = deconstructModelStringId(this.selectedModel)
      return modelType
    },
    selectedModelInstanceNumber () {
      let { instanceNumber } = deconstructModelStringId(this.selectedModel)
      return instanceNumber
    },
    selectedModelActions () {
      // let { modelType, instanceNumber } = deconstructModelStringId(this.selectedModel)
      // const actions = threeMap.getModelActions(modelType, instanceNumber)
      // return actions

      let { modelType, instanceNumber } = deconstructModelStringId(this.selectedModel)
      const modelAnimations = getModelAnimations(modelType)

      if (modelAnimations) {
        return modelAnimations.filter(anim => anim.type === 'state')
      } else {
        console.error(`No animation metadata exists for '${modelType}'. All actions are treated as states until this is configured!!`)
        const actions = threeMap.getModelActions(modelType, instanceNumber)
        const states = []
        for (let action in actions) {
          states.push({
            name: action,
            clipName: action
          })
        }

        return states
      }
    },
    selectedModelEmotes () {
      let { modelType } = deconstructModelStringId(this.selectedModel)
      const modelAnimations = getModelAnimations(modelType)
      // const emotes = []
      // for (let stateKey in modelAnimations) {
      //   if (modelAnimations[stateKey].type === 'emote') {
      //     emotes.push(modelAnimations[stateKey])
      //   }
      // }
      return modelAnimations ? modelAnimations.filter(anim => anim.type === 'emote') : null
    },
    noSelection () {
      return !this.selectedTile && !this.selectedModel
    },
    isSelectedTileSquare () {
      let { name } = deconstructTileStringId(this.selectedTile)
      const tileDetails = getTileDetails(name)
      return tileDetails.size.qLength === tileDetails.size.sLength
    },
    isCreationTileSquare () {
      return this.creationTile.size.qLength === this.creationTile.size.sLength
    },
    creationTileName: {
      get () {
        return this.$store.state.threeMap.creationTile && this.$store.state.threeMap.creationTile.name
      },
      set (tileType) {
        const tileDetails = getTileDetails(tileType)
        this.$store.dispatch('threeMap/setCreationTile', tileDetails)
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
  watch: {
    selectedModel: function (newValue, oldValue) {
      if (newValue) {
        let { modelType, instanceNumber } = deconstructModelStringId(newValue)
        this.selectedAction = threeMap.getModelCurrentAction(modelType, instanceNumber)
      }
    }
  },
  methods: {
    onChangeOrientation () {
      this.$store.dispatch('threeMap/setCreationTileOrientation', this.creationTileOrientation === 'default' ? 'alternate' : 'default')
    },
    // edit related methods
    onRotateTile () {
      let { name, instanceId } = deconstructTileStringId(this.selectedTile)
      threeMap.rotateInstance(name, instanceId, this.isSelectedTileSquare ? 'quarter' : 'half')
    },
    onRotateModel () {
      threeMap.rotateModel(this.selectedModelType, this.selectedModelInstanceNumber, false)
    },
    rotateModelLeft () {
      threeMap.rotateModel(this.selectedModelType, this.selectedModelInstanceNumber, false)
    },
    rotateModelRight () {
      threeMap.rotateModel(this.selectedModelType, this.selectedModelInstanceNumber, true)
    },
    moveModelForward () {
      threeMap.moveModelForward(this.selectedModelType, this.selectedModelInstanceNumber)
    },
    moveModelBackward () {
      threeMap.moveModelBackward(this.selectedModelType, this.selectedModelInstanceNumber)
    },
    setDefaultState () {
      const action = this.selectedAction === 'none' ? null : this.selectedAction
      threeMap.setModelAction(this.selectedModel, action)
    },
    triggerEmote (emote) {
      threeMap.triggerModelEmote(this.selectedModel, emote)
    },
    setSky () {
      threeMap.setSkydome(this.selectedSky)
    },
    toggleGrid () {
      this.showGrid = !this.showGrid
      threeMap.toggleGridDisplay(this.showGrid)
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

  &.horizontal-controls {
    display: flex;
    & > div {
      flex: 1;
    }
  }
}

.description {
  font-size: 12px;
  line-height: 1.3;
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
</style>
