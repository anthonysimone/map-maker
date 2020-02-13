import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { models } from './models'

// Reusable onLoad function
export const onModelLoad = (gltf, modelGroup, modelMatrix, mixers) => {
  const model = gltf.scene.children[0]
  model.applyMatrix(modelMatrix)

  // let box = new THREE.BoxHelper(model, 0xffff00);

  modelGroup.add(model)
  // modelGroup.add(box);

  if (gltf.animations.length && mixers) {
    console.log('animations', gltf.animations)
    let animations = gltf.animations

    let mixer = new THREE.AnimationMixer(model)

    let actions = {}

    for (let i = 0; i < animations.length; i++) {
      let clip = animations[i]
      let action = mixer.clipAction(clip)
      actions[clip.name] = action

      // if (emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4) {

      //   action.clampWhenFinished = true;
      //   action.loop = THREE.LoopOnce;

      // }
    }

    // character
    // { model, mixer, actions }

    actions['Idle']
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(0.5)
      .play()

    setTimeout(() => {
      actions['Idle'].fadeOut(0.5)
      actions['Walking']
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.5)
        .play()
    }, 5000)

    mixers.push(mixer)

    console.log('actions', actions)
  }
}

export async function simpleLoadModel (url) {
  const loader = new GLTFLoader()

  let model = await new Promise((resolve, reject) => {
    loader.load(url, gltf => {
      resolve(gltf.scene)
    }, undefined, reject)
  })

  return model
}

// the loader will report the loading progress to this function
export const onModelProgress = () => {}

// the loader will send any error messages to this function, and we'll log
// them to to console
export const onModelError = errorMessage => {
  console.log(errorMessage)
}

export function getModelUrl (key) {
  if (models[key]) {
    return models[key].url
  }

  return null
}

export function getModelScale (key) {
  if (models[key]) {
    return models[key].normalizationScale
  }

  return null
}
