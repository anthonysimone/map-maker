import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { models } from './models'

export async function simpleLoadModel (url) {
  const loader = new GLTFLoader()

  let gltf = await new Promise((resolve, reject) => {
    loader.load(url, gltf => {
      resolve(gltf)
    }, undefined, reject)
  })

  return gltf
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

export function getModelRotation (key) {
  if (models[key] && typeof models[key].normalizationRotation === 'number') {
    return models[key].normalizationRotation
  }

  return 0
}

export function getModelAnimations (key) {
  if (models[key] && models[key].animations) {
    return models[key].animations
  }

  return null
}

/*********************
 * Animation Helpers
 ********************/
export function fadeOutAction (action, duration) {
  action
    .fadeOut(duration)
}

export function fadeToAction (action, duration) {
  action
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play()
}
