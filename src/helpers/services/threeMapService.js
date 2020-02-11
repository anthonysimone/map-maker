import * as THREE from 'three'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'

// Internal dependencies
import { setPan } from '@/components/threejs/MapRenderer/helpers'
import { rotateModel } from '@/components/threejs/MapRenderer/heroActions'
import { getModelUrl, getModelScale, simpleLoadModel } from '@/components/threejs/MapRenderer/modelHelpers'

// Helper objects
let instanceMatrix = new THREE.Matrix4()
let matrix = new THREE.Matrix4()
let rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
let hideMatrix = new THREE.Matrix4().makeScale(0, 0, 0)

/**
 * Our global three.js objects and properties.
 */
export let threeMap = {
  // Global stuff
  scene: null,
  renderer: null,
  camera: null,
  boardGroup: null,

  // Mesh stuff
  geometries: null,
  materials: null,
  instancedMeshes: null,
  controls: null,
  selectionHighlighter: null,

  // Model stuff
  characterInstances: {},

  //
  // Setters
  //
  /**
   * Set initialized scene
   */
  setScene (scene) {
    this.scene = scene
  },
  /**
   * Set initialized controls
   */
  setControls (controls) {
    this.controls = controls
  },
  /**
   * Set initialized meshes
   */
  setMeshes (meshes) {
    this.instancedMeshes = meshes
  },
  setGeometries (geometries) {
    this.geometries = geometries
  },
  setMaterials (materials) {
    this.materials = materials
  },
  setRenderer (renderer) {
    this.renderer = renderer
  },
  setCamera (camera) {
    this.camera = camera
  },
  setBoardGroup (boardGroup) {
    this.boardGroup = boardGroup
  },
  /**
   * Set selecton highlighter
   */
  setSelectionHighlighter (selectionHighlighter) {
    this.selectionHighlighter = selectionHighlighter
  },
  /**
   * Initialize new model
   */
  initializeNewModel ({ modelKey, promise }) {
    this.characterInstances[modelKey] = {
      base: promise,
      count: 0,
      groups: {}
    }
  },

  //
  // Getters
  //
  /**
   * Get character instances by model id
   */
  characterInstancesByModelId (modelId) {
    return this.characterInstances[modelId]
  },
  /**
   * Get character instances by model id
   */
  getCharacterGroup (modelType, instanceNumber) {
    if (this.characterInstances[modelType]) {
      return this.characterInstances[modelType].groups[`${modelType}-${instanceNumber}`]
    }
    return null
  },

  //
  // Methods
  //
  /**
   * Set controls pan
   */
  setControlsPan (enable) {
    setPan(this.controls, enable)
  },
  /**
   * Add instance
   */
  addInstance ({ matrix, name, rotation }) {
    // Set this index's position
    const count = this.instancedMeshes[name].count
    this.instancedMeshes[name].mesh.setMatrixAt(count, matrix)
    this.instancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
    this.instancedMeshes[name].mesh.userData[count.toString()] = {
      exists: true,
      isActive: false,
      rotation: rotation || 0
    }

    // Increment our counter and the instanced mesh counter
    this.instancedMeshes[name].mesh.count++
    this.instancedMeshes[name].count++
  },
  /**
   * Rotate instance
   */
  rotateInstance ({ name, instanceId }) {
    this.instancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
    matrix.multiplyMatrices(instanceMatrix, rotationMatrix)
    this.instancedMeshes[name].mesh.setMatrixAt(instanceId, matrix)
    this.instancedMeshes[name].mesh.userData[instanceId.toString()].rotation = (this.instancedMeshes[name].mesh.userData[instanceId.toString()].rotation + 1) % 4
    this.instancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
  },
  /**
   * Delete instance
   */
  deleteInstance ({ name, instanceId }) {
    this.instancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
    matrix.multiplyMatrices(instanceMatrix, hideMatrix)
    this.instancedMeshes[name].mesh.setMatrixAt(instanceId, matrix)
    this.instancedMeshes[name].mesh.userData[instanceId.toString()].exists = false
    this.instancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
  },
  /**
   * Add model item
   */
  addModelItem (modelKey, model, position, isNew, rotation = 0) {
    // use the current count for index and then increment to increase the total
    let count = this.characterInstances[modelKey].count++

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
    const name = `${modelKey}-${count}`
    group.name = name
    group.position.set(position.x, 0.25, position.z)

    group.userData.rotation = rotation
    if (rotation) {
      group.rotateY(rotation * Math.PI / 2)
    }

    model.traverse(item => {
      if (item.isMesh) {
        item.userData.modelGroupName = name
      }
    })
    group.add(model)

    // Add group to scene and store in characterInstances with saved reference to base
    this.boardGroup.add(group)
    this.characterInstances[modelKey].groups[name] = {
      group
    }
  },
  /**
   * Rotate model
   */
  rotateModel ({ modelType, instanceNumber }) {
    let characterGroup = this.getCharacterGroup(modelType, instanceNumber)

    if (characterGroup) {
      rotateModel(characterGroup.group, false)
      characterGroup.group.userData.rotation = (characterGroup.group.userData.rotation + 1) % 4
    }
  },
  /**
   * Get object by name
   */
  getObjectByName (name) {
    return this.scene.getObjectByName(name)
  },
  /**
   * Set a tile as being highlighted
   */
  highlighterTargetTile (pos) {
    this.selectionHighlighter.position.set(pos.x, pos.y, pos.z)
    this.selectionHighlighter.visible = true
  },
  /**
   * Dispose scene
   */
  disposeScene () {
    this.controls.dispose()
    this.scene.traverse(object => {
      if (!object.isMesh) return

      object.geometry.dispose()

      if (object.material.isMaterial) {
        this.cleanMaterial(object.material)
      } else {
        // an array of materials
        for (const material of object.material) this.cleanMaterial(material)
      }
    })
    this.scene = null
  },
  /**
   * Clean material
   */
  cleanMaterial (material) {
    material.dispose()

    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key]
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose()
      }
    }
  },
  /**
   * Destroy - set properties back to initial values
   */
  clearMap () {
    this.scene = null
    this.renderer = null
    this.camera = null
    this.boardGroup = null
    this.controls = null
    this.geometries = null
    this.materials = null
    this.instancedMeshes = null
    this.selectionHighlighter = null
    this.characterInstances = {}
  },

  //
  // Loaders
  //
  loadModelObject ({ modelKey, position, rotation }) {
    let modelInstances = this.characterInstancesByModelId(modelKey)

    if (modelInstances) {
      // promise exists, resolve it
      let promise = modelInstances.base
      return promise.then(result => {
        const clonedModel = SkeletonUtils.clone(result)
        this.addModelItem(modelKey, clonedModel, position, false, rotation)
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
      this.initializeNewModel({ modelKey, promise })
      // resolve the promise
      return promise.then(result => {
        this.addModelItem(modelKey, result, position, true, rotation)
      }).catch(err => {
        console.error(err)
      })
    }
  }
}

// /**
//  * Set the initialized three.js scene.
//  */
// export function setScene (scene) {
//   threeMap.scene = scene
// }

// export function setRenderer (value) {
//   threeMap.scene = value
// }

// export function getRenderer () {
//   return threeMap.scene
// }

export function clearRenderer () {
  threeMap = {
    renderer: null
  }
}
