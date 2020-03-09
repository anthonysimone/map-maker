import * as THREE from 'three'

import { threeAssets } from '../../../helpers/services/threeAssetService'

export const tileModels = {
  first: {
    name: 'first',
    type: 'basic',
    url: '/threejs/textures/stone-floor-texture.png',
    qLength: 1,
    sLength: 1
  },
  second: {
    name: 'second',
    type: 'basic',
    url: '/threejs/textures/wall-texture.png',
    qLength: 1,
    sLength: 1
  },
  third: {
    name: 'third',
    type: 'basic',
    url: '/threejs/textures/doorway-texture.png',
    qLength: 1,
    sLength: 1
  },
  fourth: {
    name: 'fourth',
    type: 'basic',
    url: '/threejs/textures/water-texture.png',
    qLength: 1,
    sLength: 1
  },
  fifth: {
    name: 'fifth',
    type: 'basic',
    url: '/threejs/textures/pit-texture.png',
    qLength: 1,
    sLength: 1
  },
  specialFloor: {
    name: 'specialFloor',
    type: 'gltf',
    url: '/threejs/models/Dungeon_Modules/glb/Floor_Modular.glb',
    meshName: 'Floor_Modular',
    normalizationScale: { x: 50, y: 130, z: 50 },
    normalizationRotateX: Math.PI / 2,
    qLength: 1,
    sLength: 1
  }
}

export function getTileModel (name) {
  return tileModels[name]
}

export function getTileDetails (name) {
  const { qLength, sLength } = getTileModel(name)
  return {
    name,
    qLength,
    sLength
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
    return new THREE.InstancedMesh(geo, mat, count)
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
