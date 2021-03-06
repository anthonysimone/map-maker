import * as THREE from 'three'

/**
 * Set mouse
 */
export function setMouse (mouse, event, element) {
  mouse.set((event.offsetX / element.clientWidth) * 2 - 1, -(event.offsetY / element.clientHeight) * 2 + 1)
}

/**
 * Degrees to radian
 */
export function degToRad (degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Deconstruct tile string identifier
 */
export function deconstructTileStringId (tileStringId) {
  let parts = tileStringId.split('-')
  return {
    name: parts[0],
    instanceId: parts[1]
  }
}

/**
 * Deconstruct model string identifier
 */
export function deconstructModelStringId (modelStringId) {
  let [modelType, instanceNumber] = modelStringId.split('-')
  return { modelType, instanceNumber }
}

/**
 * Disable PAN
 */
export function setPan (controls, enable) {
  const mouseValue = enable ? THREE.MOUSE.PAN : null
  const touchValue = enable ? THREE.TOUCH.PAN : null
  controls.mouseButtons.LEFT = mouseValue
  controls.touches.ONE = touchValue
}

/**
 * Request opening element fullscreen. This won't work on many mobile devices.
 */
export function openElementFullscreen (elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen()
  }
}

/**
 * Transform size object to alternate orientation.
 */
export function transformSize (size) {
  return { qLength: size.sLength, sLength: size.qLength }
}
