import * as THREE from 'three'
import StarrySkyShader from '../../components/threejs/shaders/StarrySkyShader'

// Internal dependencies
import { setPan, deconstructModelStringId, transformSize } from '@/components/threejs/MapRenderer/helpers'
import { rotateModel, moveForward, moveBackward } from '@/components/threejs/MapRenderer/heroActions'
import {
  getModelAnimations,
  getModelSize,
  fadeToAction,
  fadeOutAction
} from '@/components/threejs/MapRenderer/modelHelpers'
import { getTilePosition, getTileRotation, getTileOrientation } from '@/components/threejs/MapRenderer/tileActions'

// Helper objects
let instanceMatrix = new THREE.Matrix4()
let matrix = new THREE.Matrix4()
let rotationMatrixQuarter = new THREE.Matrix4().makeRotationY(Math.PI / 2)
let rotationMatrixHalf = new THREE.Matrix4().makeRotationY(Math.PI)
let hideMatrix = new THREE.Matrix4().makeScale(0, 0, 0)

/**
 * Our global three.js objects and properties.
 */
export let threeMap = {
  // Classes
  boardClass: null,

  // Global stuff
  scene: null,
  renderer: null,
  camera: null,
  boardGroup: null,
  mixers: [],

  // Mesh stuff
  skydome: null,
  geometries: null,
  materials: null,
  tileInstancedMeshes: null,
  controls: null,
  selectionHighlighter: null,

  // Helpers
  mouse: new THREE.Vector2(),
  raycaster: new THREE.Raycaster(),

  // Interactions
  currentRolloverCell: null,

  // Model stuff
  characterInstances: {},

  /*************************
   *
   *
   * Setters
   *
   *
   ************************/
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
    this.tileInstancedMeshes = meshes
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

  setSkydome (domeType) {
    if (this.skydome) {
      this.scene.remove(this.skydome)
      this.disposeObject(this.skydome)
      this.skydome = null
    }

    if (domeType === 'starrySky') {
      const dome = this.createStarrySkydome(domeType)
      this.skydome = dome
      this.scene.add(dome)
    }
  },

  createStarrySkydome (domeType) {
    /* Starry SkyDome ShaderMaterial
      *
      * The parameters on this shader can be played around with for different effects.
      *
      * Use the offset parameter to shift the noise pattern, avoiding large clusters in places you don't
      * want them. The rest of the parameters are better described visually.
      */
    let skyDomeRadius = 50.01
    let sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        skyRadius: { value: skyDomeRadius },
        time: { value: 0 },
        env_c1: { value: new THREE.Color('#0d1a2f') },
        env_c2: { value: new THREE.Color('#0f8682') },
        noiseOffset: { value: new THREE.Vector3(100.01, 100.01, 100.01) },
        starSize: { value: 0.01 },
        starDensity: { value: 0.09 },
        clusterStrength: { value: 0.2 },
        clusterSize: { value: 0.2 }
      },
      vertexShader: StarrySkyShader.vertexShader,
      fragmentShader: StarrySkyShader.fragmentShader,
      side: THREE.DoubleSide
    })
    let sphereGeometry = new THREE.SphereGeometry(skyDomeRadius, 20, 20)
    let skyDome = new THREE.Mesh(sphereGeometry, sphereMaterial)

    return skyDome
  },

  toggleGridDisplay (showGrid) {
    const boardGrid = this.scene.getObjectByName('board-grid')
    const gridHelper = this.scene.getObjectByName('board-grid-helper')

    boardGrid.material.visible = showGrid
    gridHelper.visible = showGrid
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
  initializeNewModelBase (modelKey) {
    const size = getModelSize(modelKey)
    this.characterInstances[modelKey] = {
      count: 0,
      size,
      groups: {}
    }
  },

  /*************************
   *
   *
   * Getters
   *
   *
   ************************/
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

  /*************************
   *
   *
   * Methods
   *
   *
   ************************/

  /**
   * Set controls pan
   */
  setControlsPan (enable) {
    setPan(this.controls, enable)
  },

  /**
   * Restrict panning for map
   */
  restrictControlsPan (minPan, maxPan) {
    let _v = new THREE.Vector3()

    this.controls.addEventListener('change', () => {
      _v.copy(this.controls.target)
      this.controls.target.clamp(minPan, maxPan)
      _v.sub(this.controls.target)
      this.camera.position.sub(_v)
    })
  },

  /**
   * Add instance
   */
  addInstance ({ matrix, name, rotation }, coords, orientation = 'default') {
    // Set this index's position
    const count = this.tileInstancedMeshes[name].count
    this.tileInstancedMeshes[name].mesh.setMatrixAt(count, matrix)
    this.tileInstancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
    this.tileInstancedMeshes[name].mesh.userData[count.toString()] = {
      exists: true,
      isActive: false,
      rotation: rotation || 0,
      orientation
    }

    // Increment our counter and the instanced mesh counter
    this.tileInstancedMeshes[name].mesh.count++
    this.tileInstancedMeshes[name].count++

    // Set the tile as occupied in the board class
    const size = orientation === 'default' ? this.tileInstancedMeshes[name].size : transformSize(this.tileInstancedMeshes[name].size)
    this.boardClass.setBoardTile(coords.q, coords.s, size)
  },

  /**
   * Rotate instance
   */
  rotateInstance (name, instanceId, type) {
    this.tileInstancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
    matrix.multiplyMatrices(instanceMatrix, type === 'half' ? rotationMatrixHalf : rotationMatrixQuarter)
    this.tileInstancedMeshes[name].mesh.setMatrixAt(instanceId, matrix)
    this.tileInstancedMeshes[name].mesh.userData[instanceId.toString()].rotation = (this.tileInstancedMeshes[name].mesh.userData[instanceId.toString()].rotation + (type === 'half' ? 2 : 1)) % 4
    this.tileInstancedMeshes[name].mesh.instanceMatrix.needsUpdate = true
  },

  /**
   * Delete instance
   */
  deleteInstance ({ name, instanceId }, coords) {
    this.tileInstancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
    matrix.multiplyMatrices(instanceMatrix, hideMatrix)
    this.tileInstancedMeshes[name].mesh.setMatrixAt(instanceId, matrix)
    this.tileInstancedMeshes[name].mesh.userData[instanceId.toString()].exists = false
    this.tileInstancedMeshes[name].mesh.instanceMatrix.needsUpdate = true

    const orientation = this.tileInstancedMeshes[name].mesh.userData[instanceId.toString()].orientation

    // Unset the tile as occupied in the board class
    const size = orientation === 'default' ? this.tileInstancedMeshes[name].size : transformSize(this.tileInstancedMeshes[name].size)
    this.boardClass.unsetBoardTile(coords.q, coords.s, size)
  },

  /**
   * Add model item
   */
  addModelItem (modelKey, model, animations, defaultAction, coords, rotation = 0) {
    if (!this.characterInstances[modelKey]) {
      this.initializeNewModelBase(modelKey)
    }

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

    // Do animation stuff too

    // Make group and set initial position
    const group = new THREE.Group()
    const name = `${modelKey}-${count}`
    group.name = name

    const size = getModelSize(modelKey)
    const charPos = this.boardClass.getCharacterPositionFromBoardCoords(coords.q, coords.s, size)
    group.position.set(charPos.x, 0, charPos.z)

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

  generateTilesJson () {
    let instancedMeshNames = Object.keys(this.tileInstancedMeshes)
    let tiles = []
    instancedMeshNames.forEach(name => {
      // Set mesh name
      let instanceKeys = Object.keys(this.tileInstancedMeshes[name].mesh.userData)
      instanceKeys.forEach(instanceId => {
        if (this.tileInstancedMeshes[name].mesh.userData[instanceId.toString()].exists) {
          const vec = getTilePosition(name, instanceId, this.tileInstancedMeshes)
          const orientation = getTileOrientation(name, instanceId, this.tileInstancedMeshes)
          const size = orientation === 'default' ? this.tileInstancedMeshes[name].size : transformSize(this.tileInstancedMeshes[name].size)
          const coords = this.boardClass.getAnchorCoordsFromTilePosition(vec, size)

          let tile = {
            type: name,
            coords,
            rotation: getTileRotation(name, instanceId, this.tileInstancedMeshes),
            orientation
          }

          tiles.push(tile)
        }
      })
    })

    return tiles
  },

  generateCharactersJson () {
    let modelTypes = Object.keys(this.characterInstances)
    let characters = []
    modelTypes.forEach(type => {
      let instanceKeys = Object.keys(this.characterInstances[type].groups)
      instanceKeys.forEach(instanceKey => {
        const characterGroup = this.characterInstances[type].groups[instanceKey].group
        const vec = characterGroup.position
        const coords = this.boardClass.getAnchorCoordsFromCharacterPosition(vec, this.characterInstances[type].size)
        const instance = {
          type,
          coords,
          rotation: characterGroup.userData.rotation,
          defaultAction: characterGroup.userData.currentAction
        }

        characters.push(instance)
      })
    })

    return characters
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
    this.tileInstancedMeshes = null
    this.selectionHighlighter = null
    this.characterInstances = {}
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
window.threeMap = threeMap
