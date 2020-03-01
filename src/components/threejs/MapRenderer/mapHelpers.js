import { getTilePosition, getTileRotation } from './tileActions'

/**
 * Generate Tiles Json - provide the instanced meshes generate tiles json
 */
export function generateTilesJson (tileInstancedMeshes) {
  let instancedMeshNames = Object.keys(tileInstancedMeshes)
  let tiles = []
  instancedMeshNames.forEach(name => {
    // Set mesh name
    let instanceKeys = Object.keys(tileInstancedMeshes[name].mesh.userData)
    instanceKeys.forEach(instanceId => {
      if (tileInstancedMeshes[name].mesh.userData[instanceId.toString()].exists) {
        const vec = getTilePosition(name, instanceId, tileInstancedMeshes)
        let tile = {
          type: name,
          position: { x: vec.x, y: vec.y, z: vec.z },
          rotation: getTileRotation(name, instanceId, tileInstancedMeshes)
        }

        tiles.push(tile)
      }
    })
  })

  return tiles
}

/**
 * Generate Characters Json
 */
export function generateCharactersJson (characterInstances) {
  let modelTypes = Object.keys(characterInstances)
  let characters = []
  modelTypes.forEach(type => {
    let instanceKeys = Object.keys(characterInstances[type].groups)
    instanceKeys.forEach(instanceKey => {
      const characterGroup = characterInstances[type].groups[instanceKey].group
      const vec = characterGroup.position
      const instance = {
        type,
        position: { x: vec.x, y: vec.y, z: vec.z },
        rotation: characterGroup.userData.rotation,
        defaultAction: characterGroup.userData.currentAction
      }

      characters.push(instance)
    })
  })

  return characters
}
