import { models } from './models'

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

  return { x: 1, y: 1, z: 1 }
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
