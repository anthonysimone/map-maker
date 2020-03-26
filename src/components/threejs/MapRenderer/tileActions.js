import * as THREE from 'three'

import { deconstructTileStringId } from './helpers'
import { tweenActiveTileToggle } from './tweens'

let instanceMatrix = new THREE.Matrix4()
// let rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 2)
// let hideMatrix = new THREE.Matrix4().makeScale(0, 0, 0)
// let matrix = new THREE.Matrix4()
let vec = new THREE.Vector3()

/**
 * Toggle the tile active state
 * TODO: Move to Veux
 */
export function toggleTileActiveState (name, instanceId, mesh) {
  let instanceKey = instanceId.toString()

  let instanceUserData = mesh.userData[instanceKey]
  if (instanceUserData.isAnimating) {
    return
  }
  if (!instanceUserData.isActive) {
    tweenActiveTileToggle(mesh, instanceId, true)
  } else {
    tweenActiveTileToggle(mesh, instanceId, false)
  }
}

/**
 * Rotate tile
 * MOVED TO VUEX
 */
// export function rotateTile (name, instanceId, mesh) {
//   mesh.getMatrixAt(instanceId, instanceMatrix)
//   matrix.multiplyMatrices(instanceMatrix, rotationMatrix)
//   mesh.setMatrixAt(instanceId, matrix)
//   mesh.userData[instanceId.toString()].rotation = (mesh.userData[instanceId.toString()].rotation + 1) % 4
//   mesh.instanceMatrix.needsUpdate = true
// }

/**
 * Delete tile
 * MOVED TO VUEX
 */
// export function deleteTile (name, instanceId, mesh) {
//   mesh.getMatrixAt(instanceId, instanceMatrix)
//   matrix.multiplyMatrices(instanceMatrix, hideMatrix)
//   mesh.setMatrixAt(instanceId, matrix)
//   mesh.userData[instanceId.toString()].exists = false
//   mesh.instanceMatrix.needsUpdate = true
// }

/**
 * Add tile
 * ADDED TO VEUX
 */
// export function addTile (matrix, instancedMesh, rotation) {
//   // Set this index's position
//   instancedMesh.mesh.setMatrixAt(instancedMesh.count, matrix)
//   instancedMesh.mesh.instanceMatrix.needsUpdate = true
//   instancedMesh.mesh.userData[instancedMesh.count.toString()] = {
//     exists: true,
//     isActive: false,
//     rotation: rotation || 0
//   }

//   // Increment our counter and the instanced mesh counter
//   instancedMesh.mesh.count++
//   instancedMesh.count++
// }

/**
 * Get position from name and instanceId
 */
export function getTilePosition (name, instanceId, instancedMeshes) {
  instancedMeshes[name].mesh.getMatrixAt(instanceId, instanceMatrix)
  vec.setFromMatrixPosition(instanceMatrix)
  return vec
}

/**
 * Get rotation from name and instanceId
 */
export function getTileRotation (name, instanceId, instancedMeshes) {
  return instancedMeshes[name].mesh.userData[instanceId.toString()].rotation
}

export function getTileOrientation (name, instanceId, instancedMeshes) {
  return instancedMeshes[name].mesh.userData[instanceId.toString()].orientation
}

export function getSelectedTilePosition (selectedTile, instancedMeshes) {
  let {
    name,
    instanceId
  } = deconstructTileStringId(selectedTile)
  return getTilePosition(name, instanceId, instancedMeshes)
}

export function hideRollover (rolloverMesh) {
  rolloverMesh.position.set(0, -2, 0)
  rolloverMesh.visible = false
  rolloverMesh.userData.isValid = false
  rolloverMesh.scale.setX(1)
  rolloverMesh.scale.setZ(1)
}

export function showRollover (rolloverMesh, positionPoint, size) {
  const { qLength, sLength } = size
  rolloverMesh.scale.x = qLength
  rolloverMesh.scale.z = sLength
  if (qLength > 1) {
    positionPoint.setX(positionPoint.x + (qLength - 1) / 2)
  }
  if (sLength > 1) {
    positionPoint.setZ(positionPoint.z + (sLength - 1) / 2)
  }
  rolloverMesh.position.copy(positionPoint)
  rolloverMesh.visible = true
}

export function setRolloverIsValid (rolloverMesh, isValid) {
  rolloverMesh.material.color.r = isValid ? 0 : 1
  rolloverMesh.material.color.b = isValid ? 1 : 0
  rolloverMesh.userData.isValid = isValid
}

// /**
//  * Rotate selected tile
//  */
// function rotateSelectedTile(selectedTile) {

// }
