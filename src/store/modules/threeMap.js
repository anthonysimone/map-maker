/**
 * threeMap.js - This state acts as a global service to track and mutate
 * the three.js "globals" through parts of the app. This is local app
 * state only.
 */
import * as THREE from 'three'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'
import { setPan } from '@/components/threejs/MapRenderer/helpers'
import { getModelUrl, getModelScale, simpleLoadModel } from '@/components/threejs/MapRenderer/modelHelpers'

// Helpers
let instanceMatrix = new THREE.Matrix4()
let matrix = new THREE.Matrix4()
let rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
let hideMatrix = new THREE.Matrix4().makeScale(0, 0, 0)

const state = {
  // Global stuff
  hammerManager: null,
  scene: null,

  // Mesh stuff
  instancedMeshes: null,
  selectedTile: null,
  dadGroup: null,
  controls: null,
  selectionHighlighter: null,

  // Model stuff
  characterInstances: {},

  // Tools
  editMode: 'normal',
  editTool: 'activate',
  creationTileType: 'first'
}

const getters = {
  // Global stuff
  hammerManager: state => state.hammerManager,
  scene: state => state.scene,

  // Mesh stuff
  instancedMeshes: state => state.instancedMeshes,
  selectedTile: state => state.selectedTile,
  dadGroup: state => state.dadGroup,
  controls: state => state.controls,
  selectionHighlighter: state => state.selectionHighlighter,

  // Model stuff
  characterInstances: state => state.characterInstances,
  characterInstancesByModelId: state => modelId => state.characterInstances[modelId],

  // Tools
  editMode: state => state.editMode,
  editTool: state => state.editTool,
  creationTileType: state => state.creationTileType
}

const mutations = {
  // Global mutations
  clearMap: (state) => {
    state.scene = null
    state.instancedMeshes = null
    state.selectedTile = null
    state.dadGroup = null
    state.controls = null
    state.selectionHighlighter = null
    state.characterInstances = {}
    state.editMode = 'normal'
    state.editTool = 'activate'
    state.creationTileType = 'first'
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
  setScene: (state, scene) => {
    state.scene = scene
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

  // Model related things
  initializeNewModel: (state, { modelKey, promise }) => {
    state.characterInstances[modelKey] = {
      base: promise,
      count: 0,
      groups: {}
    }
  },
  addModelItem: (state, { modelKey, model, position, isNew }) => {
    console.log('model', model)
    // use the current count for index and then increment to increase the total
    let count = state.characterInstances[modelKey].count++

    // For the first time, we need to normalize it to our world.
    // This transform remains for future cloned items.
    if (isNew) {
      const modelMatrix = new THREE.Matrix4()
      const modelScale = getModelScale(modelKey)
      modelMatrix.makeScale(modelScale.x, modelScale.y, modelScale.z)
      modelMatrix.setPosition(0, 0, 0)
      model.applyMatrix(modelMatrix)
    }

    // Do animation stuff too

    // Make group and set initial position
    const group = new THREE.Group()
    group.name = `${modelKey}_group_${count}`
    group.position.set(position.x, position.y, position.z)
    group.add(model)

    // Add group to scene and store in characterInstances with saved reference to base
    state.scene.add(group) // TODO: probably add to board
    state.characterInstances[modelKey].groups = {
      [`${modelKey}_${count}`]: {
        group
      }
    }
  },
  // Controls
  setControls: (state, controls) => {
    state.controls = controls
  },
  setControlsPan: (state, enable) => {
    setPan(state.controls, enable)
  },
  setDadGroup: (state, group) => {
    state.dadGroup = group
  },
  setDadPosition: (state, { x, y, z }) => {
    state.dadGroup.position.set(x, y, z)
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
  setScene: ({ commit }, scene) => {
    commit('setScene', scene)
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
  setDadGroup: ({ commit }, group) => {
    commit('setDadGroup', group)
  },
  setDadPosition: ({ commit }, pos) => {
    commit('setDadPosition', pos)
  },

  loadModelObject: ({ commit, getters }, { modelKey, position }) => {
    let modelInstances = getters.characterInstancesByModelId(modelKey)

    if (modelInstances) {
      // promise exists, resolve it
      let promise = modelInstances.base
      promise.then(result => {
        const clonedModel = SkeletonUtils.clone(result)
        commit('addModelItem', { modelKey, model: clonedModel, position, isNew: false })
      }).catch(err => {
        console.error(err)
      })
    } else {
      // promise doesn't exist, set the promise and also resolve it
      const modelUrl = getModelUrl(modelKey)
      if (!modelUrl) {
        console.error('Model does not exist!')
      }

      let promise = simpleLoadModel(modelUrl)
      commit('initializeNewModel', { modelKey, promise })
      // resolve the promise
      return promise.then(result => {
        commit('addModelItem', { modelKey, model: result, position, isNew: true })
      }).catch(err => {
        console.error(err)
      })
    }
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
