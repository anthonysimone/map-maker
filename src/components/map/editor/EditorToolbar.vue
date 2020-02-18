<template>
  <div>
    <div class="meta">
      <div class="info">
        <h1>Editing: {{ map.name }}</h1>
      </div>
      <div class="links">
        <button @click="saveMap" class="button is-success is-small">Save</button>
        <router-link class="button is-primary is-small edit-map" :to="{name: 'dashboard'}">Dashboard</router-link>
      </div>
    </div>
    <div class="tools">

      <!-- Select -->
      <button @click="changeEditTool('select')" class="button is-small" :class="{'is-active': editTool === 'select'}" content="Select" v-tippy="{ placement : 'bottom',  arrow: true }">
        <span class="icon is-small">
          <font-awesome-icon icon="mouse-pointer"></font-awesome-icon>
        </span>
      </button>

      <!-- Activate -->
      <button @click="changeEditTool('activate')" class="button is-small" :class="{'is-active': editTool === 'activate'}" content="Activate" v-tippy="{ placement : 'bottom',  arrow: true }">
        <span class="icon is-small">
          <font-awesome-icon icon="star-of-life"></font-awesome-icon>
        </span>
      </button>

      <!-- Tile actions -->
      <div class="field has-addons">
        <p class="control">
          <button @click="changeEditTool('create')" class="button is-small" :class="{'is-active': editTool === 'create'}" content="Add Tile" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <font-awesome-icon icon="plus-square"></font-awesome-icon>
            </span>
          </button>
        </p>
        <p class="control">
          <button @click="changeEditTool('delete')" class="button is-small" :class="{'is-active': editTool === 'delete'}" content="Delete Tile" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <font-awesome-icon icon="minus-square"></font-awesome-icon>
            </span>
          </button>
        </p>
      </div>

      <!-- Model actions -->
      <div class="field has-addons">
        <p class="control">
          <button @click="changeEditTool('addModel')" class="button is-small" :class="{'is-active': editTool === 'addModel'}" content="Add Model" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <font-awesome-icon icon="plus-circle"></font-awesome-icon>
            </span>
          </button>
        </p>
        <p class="control">
          <button @click="changeEditTool('deleteModel')" class="button is-small" :class="{'is-active': editTool === 'deleteModel'}" content="Delete Model" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <font-awesome-icon icon="minus-circle"></font-awesome-icon>
            </span>
          </button>
        </p>
      </div>

      <div class="divider"></div>

      <!-- Edit Mode -->
      <div class="field has-addons">
        <p class="control">
          <button @click="changeEditMode('normal')" class="button is-small" :class="{'is-active': editMode === 'normal'}" content="Normal" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <i class="fas fa-heading"></i>
              <font-awesome-icon icon="play"></font-awesome-icon>
            </span>
          </button>
        </p>
        <p class="control">
          <button @click="changeEditMode('quick')" class="button is-small" :class="{'is-active': editMode === 'quick'}" content="Quick" v-tippy="{ placement : 'bottom',  arrow: true }">
            <span class="icon is-small">
              <i class="fas fa-heading"></i>
              <font-awesome-icon icon="fast-forward"></font-awesome-icon>
            </span>
          </button>
        </p>
      </div>

      <div class="divider"></div>

      <!-- Deactivate All Tiles -->
      <button @click="resetAllTiles" class="button is-small" content="Deactivate All Tiles" v-tippy="{ placement : 'bottom',  arrow: true }">
        <span class="icon is-small">
          <font-awesome-icon icon="caret-square-down"></font-awesome-icon>
        </span>
      </button>

      <div class="tools-right">
        <!-- Fullscreen -->
        <button @click="fullscreenMap" class="button is-small" content="Enable Fullscreen" v-tippy="{ placement : 'bottom',  arrow: true }">
          <span class="icon is-small">
            <font-awesome-icon icon="tv"></font-awesome-icon>
          </span>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { threeMap } from '@/helpers/services/threeMapService'

import { generateTilesJson, generateCharactersJson } from '@/components/threejs/MapRenderer/mapHelpers'
import { openElementFullscreen } from '@/components/threejs/MapRenderer/helpers'
import { tweenActiveTileToggle } from '@/components/threejs/MapRenderer/tweens'

export default {
  name: 'editor-toolbar',
  props: {
    map: {
      default: null,
      required: true,
      type: Object
    }
  },
  computed: {
    ...mapGetters('threeMap', [
      'editMode',
      'editTool'
    ])
  },
  methods: {
    changeEditMode (editMode) {
      this.$store.dispatch('threeMap/setEditMode', editMode)
    },
    changeEditTool (editTool) {
      if (editTool !== 'select') {
        this.$store.dispatch('threeMap/clearSelection')
      }
      this.$store.dispatch('threeMap/setEditTool', editTool)
    },
    resetAllTiles () {
      let instancedMeshNames = Object.keys(threeMap.instancedMeshes)
      instancedMeshNames.forEach(name => {
        let instanceKeys = Object.keys(threeMap.instancedMeshes[name].mesh.userData)
        instanceKeys.forEach(instanceId => {
          if (threeMap.instancedMeshes[name].mesh.userData[instanceId].isActive) {
            tweenActiveTileToggle(threeMap.instancedMeshes[name].mesh, instanceId, false)
          }
        })
      })
    },
    fullscreenMap () {
      openElementFullscreen(document.body)
    },
    saveMap () {
      // Get all of the instanced mesh keys
      let tilesJson = generateTilesJson(threeMap.instancedMeshes)
      let charactersJson = generateCharactersJson(threeMap.characterInstances)
      console.log('characterjson', charactersJson)

      this.$emit('saveMap', { tilesJson, charactersJson })
    }
  }
}
</script>

<style lang="scss" scoped>
.meta {
  display: flex;
  justify-content: space-between;
}

.links {
  & > *:not(:first-child) {
    margin-left: 10px;
  }
}

.tools {
  display: flex;
  padding: 0 10px 6px 10px;
  > *:not(:first-child) {
    margin-left: 10px;
    margin-bottom: 0;
  }
}

.tools-right {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}

.divider {
  width: 1px;
  background: #cccccc;
}
</style>
