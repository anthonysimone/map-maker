/**
 * threeMap.js - This state acts as a global service to track and mutate
 * the three.js "globals" through parts of the app. This is local app
 * state only.
 */
import { threeMap } from '@/helpers/services/threeMapService'

const state = {
  // Global stuff
  hammerManager: null,

  // Mesh stuff
  selectedTile: null,
  selectedModel: null,

  // Tools
  editMode: 'normal',
  editTool: 'select',
  creationTile: null,
  addModelType: null,
  creationTileOrientation: 'default'
}

const getters = {
  // Global stuff
  hammerManager: state => state.hammerManager,

  // Mesh stuff
  selectedTile: state => state.selectedTile,
  selectedModel: state => state.selectedModel,

  // Tools
  editMode: state => state.editMode,
  editTool: state => state.editTool,
  creationTile: state => state.creationTile,
  addModelType: state => state.addModelType,
  creationTileOrientation: state => state.creationTileOrientation
}

const mutations = {
  // Global mutations
  clearMap: (state) => {
    state.selectedTile = null
    state.editMode = 'normal' // keep
    state.editTool = 'activate' // keep
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

  // Selection statet
  selectTile: (state, tileString) => {
    state.selectedTile = tileString
    state.selectedModel = null
  },
  clearSelection: (state) => {
    state.selectedTile = null
    state.selectedModel = null
    threeMap.selectionHighlighter.visible = false
  },
  selectModel: (state, modelString) => {
    state.selectedModel = modelString
    state.selectedTile = null
  },

  // Controls
  setControlsPan: (state, enable) => {
    threeMap.setControlsPan(enable)
  },

  // Tools
  setEditMode: (state, mode) => {
    state.editMode = mode
  },
  setEditTool: (state, editTool) => {
    state.editTool = editTool
  },
  setCreationTile: (state, tileDetails) => {
    state.creationTile = tileDetails
    state.creationTileOrientation = 'default'
  },
  setAddModelType: (state, modelType) => {
    state.addModelType = modelType
  },
  setCreationTileOrientation: (state, orientation) => {
    state.creationTileOrientation = orientation
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
  selectTile: ({ commit }, { name, instanceId }) => {
    commit('selectTile', `${name}-${instanceId}`)
  },
  clearSelection: ({ commit }) => {
    commit('clearSelection')
  },
  selectModel: ({ commit }, name) => {
    commit('selectModel', name)
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
  setCreationTile: ({ commit }, tileDetails) => {
    commit('setCreationTile', tileDetails)
  },
  setAddModelType: ({ commit }, modelType) => {
    commit('setAddModelType', modelType)
  },
  setCreationTileOrientation: ({ commit }, orientation) => {
    commit('setCreationTileOrientation', orientation)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
