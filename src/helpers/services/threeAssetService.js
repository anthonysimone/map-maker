import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'

import { getModelRotation, getModelScale } from '../../components/threejs/MapRenderer/modelHelpers'

export let threeAssets = {
  texture: {},
  gltf: {},

  queueAsset (type, name, url) {
    if (!this[type][name]) {
      threeAssets[type][name] = {
        url,
        name,
        loaded: false
      }
    }
  },
  loadQueuedAssets (manager) {
    // load unloaded textures
    for (let item of Object.values(this.texture)) {
      item.value = new THREE.TextureLoader(manager).load(item.url)
      item.loaded = true
    }

    // load unloaded gltf
    for (let item of Object.values(this.gltf)) {
      const loader = new GLTFLoader(manager)

      loader.load(item.url, gltf => {
        let model = gltf.scene

        // Normalize for our world
        const modelMatrix = new THREE.Matrix4()

        const modelRotation = getModelRotation(item.name)
        modelMatrix.makeRotationY(modelRotation)

        const modelScale = getModelScale(item.name)
        modelMatrix.scale(modelScale)

        modelMatrix.setPosition(0, 0, 0)

        model.applyMatrix(modelMatrix)

        // Add normalized gltf to asset
        item.value = gltf
        item.loaded = true
      }, undefined, undefined)
    }
  },

  getLoadedTexture (name) {
    return this.texture[name] && this.texture[name].value
  },

  getLoadedGltf (name) {
    return this.gltf[name] && this.gltf[name].value
  },

  getClonedGltfScene (name) {
    const gltf = this.gltf[name] && this.gltf[name].value
    if (gltf) {
      return SkeletonUtils.clone(gltf.scene)
    }

    return null
  }
}
