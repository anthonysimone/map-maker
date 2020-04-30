import * as THREE from 'three'

import { threeAssets } from '../../../helpers/services/threeAssetService'

export const tileModels = {
  first: {
    name: 'first',
    type: 'basic',
    url: '/threejs/textures/stone-floor-texture.png',
    size: { qLength: 1, sLength: 1 }
  },
  second: {
    name: 'second',
    type: 'basic',
    url: '/threejs/textures/wall-texture.png',
    size: { qLength: 1, sLength: 1 }
  },
  third: {
    name: 'third',
    type: 'basic',
    url: '/threejs/textures/doorway-texture.png',
    size: { qLength: 1, sLength: 1 }
  },
  fourth: {
    name: 'fourth',
    type: 'basic',
    url: '/threejs/textures/water-texture.png',
    size: { qLength: 1, sLength: 1 }
  },
  fifth: {
    name: 'fifth',
    type: 'basic',
    url: '/threejs/textures/pit-texture.png',
    size: { qLength: 1, sLength: 1 }
  },
  specialFloor: {
    name: 'specialFloor',
    type: 'gltf',
    url: '/threejs/models/tiles/floor_modular_normalized.glb',
    size: { qLength: 1, sLength: 1 },
    meshName: 'Floor_Modular',
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  },
  specialFloorLarge: {
    name: 'specialFloorLarge',
    type: 'gltf',
    url: '/threejs/models/tiles/floor_modular_normalized.glb',
    size: { qLength: 2, sLength: 2 },
    meshName: 'Floor_Modular',
    normalizationScale: { x: 1, y: 0.5, z: 1 }
  },
  archDoorWithFloorMerged: {
    name: 'archDoorWithFloorMerged',
    type: 'gltf',
    url: '/threejs/models/tiles/arch_door_3_wide_merged.glb',
    size: { qLength: 3, sLength: 1 },
    meshName: 'Arch_Door',
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  },
  cornerColumn: {
    name: 'cornerColumn',
    type: 'gltf',
    url: '/threejs/models/tiles/corner_column.glb',
    size: { qLength: 1, sLength: 1 },
    meshName: 'corner_column',
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  },
  threeWayColumn: {
    name: 'threeWayColumn',
    type: 'gltf',
    url: '/threejs/models/tiles/three_way_column.glb',
    size: { qLength: 1, sLength: 1 },
    meshName: 'three_way_column',
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  },
  fourWayColumn: {
    name: 'fourWayColumn',
    type: 'gltf',
    url: '/threejs/models/tiles/four_way_column.glb',
    size: { qLength: 1, sLength: 1 },
    meshName: 'four_way_column',
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  },
  wallModular: {
    name: 'wallModular',
    type: 'gltf',
    url: '/threejs/models/tiles/wall_modular.glb',
    size: { qLength: 1, sLength: 1 },
    meshName: 'wall_modular',
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  }
}

export function getTileModel (name) {
  return tileModels[name]
}

export function getTileDetails (name) {
  const { size } = getTileModel(name)
  return {
    name,
    size
  }
}

export function getTileType (name) {
  return tileModels[name] && tileModels[name].type
}

export function getTileMeshName (name) {
  return tileModels[name].meshName
}

export function getTileNormalizationScale (name) {
  if (tileModels[name].normalizationScale) {
    return tileModels[name].normalizationScale
  } else {
    return { x: 1, y: 1, z: 1 }
  }
}

export function getTileNormalizationRotateX (name) {
  if (tileModels[name].normalizationRotateX) {
    return tileModels[name].normalizationRotateX
  } else {
    return 0
  }
}

export function createBasicTileGeo () {
  return new THREE.BoxBufferGeometry(1, 0.25, 1)
}

export function createBasicTileMaterial (url, manager) {
  const texture = new THREE.TextureLoader(manager).load(url)
  texture.encoding = THREE.sRGBEncoding
  texture.anisotropy = 16
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return new THREE.MeshStandardMaterial({
    map: texture
  })
}

export function createTileMesh (name, count) {
  const tile = tileModels[name]
  if (!tile) {
    console.error('Tile type does not exist!')
  }

  if (tile.type === 'basic') {
    const geo = createBasicTileGeo()
    const mat = createBasicTileMaterialSync(tile.name)
    const mesh = new THREE.InstancedMesh(geo, mat, count)
    mesh.position.y = -0.125 // half the height of the geo
    return mesh
  } else if (tile.type === 'gltf') {
    let gltf = threeAssets.getLoadedGltf(tile.name)
    let meshName = getTileMeshName(tile.name)
    let mesh = gltf.scene.getObjectByName(meshName)
    let geo = mesh.geometry

    let rotation = getTileNormalizationRotateX(tile.name)
    geo.rotateX(rotation)

    let scale = getTileNormalizationScale(tile.name)
    geo.scale(scale.x, scale.y, scale.z)

    return new THREE.InstancedMesh(geo, mesh.material, count)
  }
}

export function createBasicTileMaterialSync (name) {
  let texture = threeAssets.getLoadedTexture(name)
  texture.encoding = THREE.sRGBEncoding
  texture.anisotropy = 16
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return new THREE.MeshStandardMaterial({
    map: texture
  })
}
