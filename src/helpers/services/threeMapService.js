import * as THREE from 'three'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'

// Internal dependencies
import { setPan, deconstructModelStringId } from '@/components/threejs/MapRenderer/helpers'
import { rotateModel, moveForward, moveBackward } from '@/components/threejs/MapRenderer/heroActions'
import {
  getModelUrl, getModelScale, getModelRotation, getModelAnimations,
  simpleLoadModel,
  fadeToAction, fadeOutAction
} from '@/components/threejs/MapRenderer/modelHelpers'

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
  mixers: [],

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
  /**
   * Get model actions
   */
  getModelActions (modelType, instanceNumber) {
    const model = this.getCharacterGroup(modelType, instanceNumber)
    if (model && model.actions) {
      return model.actions
    }

    return null
  },
  /**
   * Get the current action the model is using as state.
   */
  getModelCurrentAction (modelType, instanceNumber) {
    const model = this.getCharacterGroup(modelType, instanceNumber)
    if (model && model.group.userData.currentAction) {
      return model.group.userData.currentAction
    }

    return 'none'
  },
  /**
   * Get the mixer for a given model.
   */
  getModelMixer (modelType, instanceNumber) {
    return this.getCharacterGroup(modelType, instanceNumber).mixer
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
  addModelItem (modelKey, model, animations, defaultAction, position, isNew, rotation = 0) {
    let count = this.characterInstances[modelKey].count++

    // use the current count for index and then increment to increase the total
    let mixer = null
    let actions = {}
    if (animations.length) {
      mixer = new THREE.AnimationMixer(model)
      const animationsMetadata = getModelAnimations(modelKey)
      for (let i = 0; i < animations.length; i++) {
        let clip = animations[i]
        let action = mixer.clipAction(clip)
        actions[clip.name] = action

        if (animationsMetadata) {
          let animationMetadata = animationsMetadata.filter(anim => anim.clipName === clip.name)[0]
          let runOnce = animationMetadata.clampEnd || animationMetadata.type === 'emote'
          if (runOnce) {
            actions[clip.name].clampWhenFinished = true
            actions[clip.name].loop = THREE.LoopOnce
          }
        }
      }

      this.mixers.push(mixer)
    }

    // For the first time, we need to normalize it to our world.
    // This transform remains for future cloned items.
    if (isNew) {
      const modelMatrix = new THREE.Matrix4()

      const modelRotation = getModelRotation(modelKey)
      modelMatrix.makeRotationY(modelRotation)

      const modelScale = getModelScale(modelKey)
      modelMatrix.scale(modelScale)

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

    if (defaultAction) {
      group.userData.currentAction = defaultAction
      // Add timeout to stagger init of same animations on same models
      setTimeout(() => {
        fadeToAction(actions[defaultAction], 0.5)
      }, Math.floor(Math.random() * 2000))
    } else {
      group.userData.currentAction = null
    }

    // Add group to scene and store in characterInstances with saved reference to base
    this.boardGroup.add(group)
    this.characterInstances[modelKey].groups[name] = {
      group,
      mixer,
      actions
    }
  },
  /**
   * Rotate model
   */
  rotateModel (modelType, instanceNumber, isClockwise = true) {
    let characterGroup = this.getCharacterGroup(modelType, instanceNumber)

    if (characterGroup) {
      rotateModel(characterGroup.group, isClockwise)
      characterGroup.group.userData.rotation = (characterGroup.group.userData.rotation + 1) % 4
    }
  },
  /**
   * Move model forward
   */
  moveModelForward (modelType, instanceNumber) {
    let characterGroup = this.getCharacterGroup(modelType, instanceNumber)

    if (characterGroup) {
      moveForward(characterGroup.group)
    }
  },
  /**
   * Move model backward
   */
  moveModelBackward (modelType, instanceNumber) {
    let characterGroup = this.getCharacterGroup(modelType, instanceNumber)

    if (characterGroup) {
      moveBackward(characterGroup.group)
    }
  },
  /**
   * Set model action
   */
  setModelAction (modelString, action) {
    const { modelType, instanceNumber } = deconstructModelStringId(modelString)
    const character = this.getCharacterGroup(modelType, instanceNumber)
    const group = character.group
    const currentAction = group.userData.currentAction
    if (currentAction) {
      fadeOutAction(character.actions[currentAction], 0.5)
    }

    if (action) {
      fadeToAction(character.actions[action], 0.5)
    }

    group.userData.currentAction = action
  },
  /**
   * Set model emote.
   *
   * If model has a current action, fades out, runs the emote, and fades the action back in.
   */
  triggerModelEmote (modelString, emote) {
    const { modelType, instanceNumber } = deconstructModelStringId(modelString)
    const character = this.getCharacterGroup(modelType, instanceNumber)
    const currentActionName = character.group.userData.currentAction

    const mixer = this.getModelMixer(modelType, instanceNumber)
    if (currentActionName) {
      fadeOutAction(character.actions[currentActionName], 0.2)
      mixer.addEventListener('finished', restoreStateCallback)
    }

    fadeToAction(character.actions[emote], 0.2)

    function restoreStateCallback () {
      mixer.removeEventListener('finished', restoreStateCallback)

      fadeOutAction(character.actions[emote], 0.2)

      if (currentActionName) {
        fadeToAction(character.actions[currentActionName], 0.2)
      }
    }
  },
  /**
   * Delete model
   */
  deleteModel (modelGroup) {
    const { modelType } = deconstructModelStringId(modelGroup.name)
    delete this.characterInstances[modelType].groups[modelGroup.name]
    this.boardGroup.remove(modelGroup)
    this.disposeObject(modelGroup)
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
   * Dispose object
   */
  disposeObject (object) {
    object.traverse(item => {
      if (!item.isMesh) return

      item.geometry.dispose()

      if (item.material.isMaterial) {
        this.cleanMaterial(item.material)
      } else {
        // an array of materials
        for (const material of item.material) this.cleanMaterial(material)
      }
    })
  },
  /**
   * Dispose scene
   */
  disposeScene () {
    this.controls.dispose()
    this.disposeObject(this.scene)
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
  /**
   * Load a model.
   *
   * Note - we are using skeletton utils to clone the scene in both cases, this way, the source
   * that is cloned for new objects will always exist in its original state.
   *
   * TODO: need to handle this properly - If we didn't do this, a new item might be created at the current position of the first model,
   * possibly mid animation, for example.
   */
  loadModelObject ({ modelKey, position, rotation, defaultAction }) {
    let modelInstances = this.characterInstancesByModelId(modelKey)

    if (modelInstances) {
      // promise exists, resolve it
      let promise = modelInstances.base
      return promise.then(result => {
        const clonedModel = SkeletonUtils.clone(result.scene)
        this.addModelItem(modelKey, clonedModel, result.animations, defaultAction, position, false, rotation)
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
        // const clonedModel = SkeletonUtils.clone(result.scene)
        // TODO: do something here to handle this
        this.addModelItem(modelKey, result.scene, result.animations, defaultAction, position, true, rotation)
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

// Uncomment for easier debugging
// window.threeMap = threeMap
