/**
 * threeMap.js - This state acts as a global service to track and mutate
 * the three.js "globals" through parts of the app. This is local app
 * state only.
 */
import * as THREE from 'three'
import { setPan } from '@/components/threejs/MapRenderer/helpers'

// Helpers
let instanceMatrix = new THREE.Matrix4()
let matrix = new THREE.Matrix4()
let rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
let hideMatrix = new THREE.Matrix4().makeScale(0, 0, 0)

const state = {
  // Global stuff
  hammerManager: null,

  // Mesh stuff
  instancedMeshes: null,
  selectedTile: null,
  characterGroup: null,
  controls: null,
  selectionHighlighter: null,

  // Tools
  editMode: 'normal',
  editTool: 'activate',
  creationTileType: 'first'
}

const getters = {
  hammerManager: state => state.hammerManager,
  instancedMeshes: state => state.instancedMeshes,
  selectedTile: state => state.selectedTile,
  characterGroup: state => state.characterGroup,
  controls: state => state.controls,
  selectionHighlighter: state => state.selectionHighlighter,
  editMode: state => state.editMode,
  editTool: state => state.editTool,
  creationTileType: state => state.creationTileType
}

const mutations = {
  // Global mutations
  clearMap: (state) => {
    state.instancedMeshes = null
    state.selectedTile = null
    state.characterGroup = null
    state.controls = null
    state.selectionHighlighter = null
  },
  initHammerManager: (state, hammerManager) => {
    state.hammerManager = hammerManager
  },
  setHammerPan: (state, enableHammerPan) => {
    state.hammerManager.get('pan').set({ enable: enableHammerPan })
  },
  destroyHammerManager: (state) => {
    state.hammerManager.destroy()
    state.hammerManager = null
  },

  // Meshes related
  setMeshes: (state, meshes) => {
    state.instancedMeshes = meshes
  },
  rotateInstance: (state, { name, instanceId }) => {
    state.instancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
    matrix.multiplyMatrices(instanceMatrix, rotationMatrix)
    state.instancedMeshes[name].mesh.setMatrixAt(instanceId, matrix)
    state.instancedMeshes[name].mesh.userData[instanceId.toString()].rotation = (state.instancedMeshes[name].mesh.userData[instanceId.toString()].rotation + 1) % 4
    state.instancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
  },
  addInstance: (state, { matrix, name, rotation }) => {
    // Set this index's position
    const count = state.instancedMeshes[name].count
    state.instancedMeshes[name].mesh.setMatrixAt(count, matrix)
    state.instancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
    state.instancedMeshes[name].mesh.userData[count.toString()] = {
      exists: true,
      isActive: false,
      rotation: rotation || 0
    }

    // Increment our counter and the instanced mesh counter
    state.instancedMeshes[name].mesh.count++
    state.instancedMeshes[name].count++
  },
  deleteInstance: (state, { name, instanceId }) => {
    state.instancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
    matrix.multiplyMatrices(instanceMatrix, hideMatrix)
    state.instancedMeshes[name].mesh.setMatrixAt(instanceId, matrix)
    state.instancedMeshes[name].mesh.userData[instanceId.toString()].exists = false
    state.instancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
  },
  selectTile: (state, tileString) => {
    state.selectedTile = tileString
  },
  clearTileSelection: (state) => {
    state.selectedTile = null
    state.selectionHighlighter.visible = false
  },

  // Extra map related objects
  setSelectionHighlighter: (state, highlighter) => {
    state.selectionHighlighter = highlighter
  },
  highlighterTargetTile: (state, pos) => {
    state.selectionHighlighter.position.set(pos.x, pos.y, pos.z)
    state.selectionHighlighter.visible = true
  },

  // Controls
  setControls: (state, controls) => {
    state.controls = controls
  },
  setControlsPan: (state, enable) => {
    setPan(state.controls, enable)
  },
  setCharacterGroup: (state, group) => {
    state.characterGroup = group
  },
  setCharacterPosition: (state, { x, y, z }) => {
    state.characterGroup.position.set(x, y, z)
  },

  // Tools
  setEditMode: (state, mode) => {
    state.editMode = mode
  },
  setEditTool: (state, editTool) => {
    state.editTool = editTool
  },
  setCreationTileType: (state, tileType) => {
    state.creationTileType = tileType
  }
}

const actions = {
  // Global actions
  destroy: ({ commit }) => {
    commit('clearMap')
    commit('destroyHammerManager')
  },
  initHammerManager: ({ commit }, hammerManager) => {
    commit('initHammerManager', hammerManager)
  },

  // Meshes related
  setMeshes: ({ commit }, meshes) => {
    commit('setMeshes', meshes)
  },
  rotateInstance: ({ commit }, data) => {
    commit('rotateInstance', data)
  },
  addInstance: ({ commit }, data) => {
    commit('addInstance', data)
  },
  deleteInstance: ({ commit }, data) => {
    commit('deleteInstance', data)
  },
  selectTile: ({ commit }, { name, instanceId }) => {
    commit('selectTile', `${name}-${instanceId}`)
  },
  clearTileSelection: ({ commit }) => {
    commit('clearTileSelection')
  },

  // Extra map related objects
  setSelectionHighlighter: ({ commit }, highlighter) => {
    commit('setSelectionHighlighter', highlighter)
  },
  highlighterTargetTile: ({ commit }, pos) => {
    commit('highlighterTargetTile', pos)
  },
  setCharacterGroup: ({ commit }, group) => {
    commit('setCharacterGroup', group)
  },
  setCharacterPosition: ({ commit }, pos) => {
    commit('setCharacterPosition', pos)
  },

  // Controls
  setControls: ({ commit }, controls) => {
    commit('setControls', controls)
  },
  setControlsPan: ({ commit }, enable) => {
    commit('setControlsPan', enable)
  },

  // Tools
  setEditMode: ({ commit }, mode) => {
    commit('setEditMode', mode)
    if (mode === 'quick') {
      commit('setControlsPan', false)
      commit('setHammerPan', true)
    } else {
      commit('setControlsPan', true)
      commit('setHammerPan', false)
    }
  },
  setEditTool: ({ commit }, editTool) => {
    commit('setEditTool', editTool)
  },
  setCreationTileType: ({ commit }, tileType) => {
    commit('setCreationTileType', tileType)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
