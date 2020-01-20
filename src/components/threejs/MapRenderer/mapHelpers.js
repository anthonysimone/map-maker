import { getTilePosition, getTileRotation } from './tileActions'

/**
 * Generate Tiles Json - provide the instanced meshes generate tiles json
 */
export function generateTilesJson (instancedMeshes) {
  let instancedMeshNamnes = Object.keys(instancedMeshes)
  let tiles = []
  instancedMeshNamnes.forEach(name => {
    // Set mesh name
    let instanceKeys = Object.keys(instancedMeshes[name].mesh.userData)
    instanceKeys.forEach(instanceId => {
      if (instancedMeshes[name].mesh.userData[instanceId.toString()].exists) {
        const vec = getTilePosition(name, instanceId, instancedMeshes)
        let tile = {
          type: name,
          position: { x: vec.x, y: vec.y, z: vec.z },
          rotation: getTileRotation(name, instanceId, instancedMeshes)
        }
        console.log('tile to save', tile)
        tiles.push(tile)
      }
    })
  })

  return tiles
}
