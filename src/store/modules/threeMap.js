/**
 * threeMap.js - This state acts as a global service to track and mutate
 * the three.js "globals" through parts of the app. This is local app
 * state only.
 */
import * as THREE from 'three'

// Helpers
let instanceMatrix = new THREE.Matrix4()
let matrix = new THREE.Matrix4()
let rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
let hideMatrix = new THREE.Matrix4().makeScale(0, 0, 0)

const state = {
  instancedMeshes: {},
  selectedTile: null
}

const getters = {
  instancedMeshes: state => state.instancedMeshes,
  selectedTile: state => state.selectedTile
}

const mutations = {
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
  }
}

const actions = {
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
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
