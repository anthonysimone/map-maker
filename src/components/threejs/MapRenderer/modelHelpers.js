import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Reusable onLoad function
export const onModelLoad = (gltf, modelGroup, modelMatrix, mixers) => {
  // console.log('model load', gltf, modelGroup, modelMatrix)
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

const models = {
  dad: {
    url: '/threejs/models/90s_dad/scene.gltf',
    normalizationScale: { x: 0.125, y: 0.125, z: 0.125 }
  },
  robot: {
    url: '/threejs/models/RobotExpressive/RobotExpressive.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  robotStatic: {
    url: '/threejs/models/RobotExpressive/RobotStatic.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  goblin: {
    url: '/threejs/models/Goblin/Goblin.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  bat: {
    url: '/threejs/models/Monsters/Bat.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  slime: {
    url: '/threejs/models/Monsters/Slime.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  dragon: {
    url: '/threejs/models/Monsters/Dragon.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  skeleton: {
    url: '/threejs/models/Monsters/Skeleton.glb',
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  // Dungeon pieces
  tile: {
    url: '/threejs/models/Dungeon_Modules/glb/Floor_Modular.glb',
    normalizationScale: { x: 1, y: 1, z: 1 }
  },
  stairs: {
    url: '/threejs/models/Dungeon_Modules/glb/Stairs_Modular.glb',
    normalizationScale: { x: 1, y: 1, z: 1 }
  },
  wall: {
    url: '/threejs/models/Dungeon_Modules/glb/Wall_Modular.glb',
    normalizationScale: { x: 1, y: 1, z: 1 }
  }
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
