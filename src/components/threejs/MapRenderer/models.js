export const models = {
  robot: {
    name: 'robot',
    url: '/threejs/models/characters/RobotExpressive.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 },
    animations: [
      {
        name: 'Idle',
        clipName: 'Idle',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Dance',
        clipName: 'Dance',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Walking',
        clipName: 'Walking',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Running',
        clipName: 'Running',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Sitting',
        clipName: 'Sitting',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Standing',
        clipName: 'Standing',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Death',
        clipName: 'Death',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'WalkJump',
        clipName: 'WalkJump',
        type: 'emote'
      },
      {
        name: 'Jump',
        clipName: 'Jump',
        type: 'emote'
      },
      {
        name: 'No',
        clipName: 'No',
        type: 'emote'
      },
      {
        name: 'Punch',
        clipName: 'Punch',
        type: 'emote'
      },
      {
        name: 'ThumbsUp',
        clipName: 'ThumbsUp',
        type: 'emote'
      },
      {
        name: 'Wave',
        clipName: 'Wave',
        type: 'emote'
      },
      {
        name: 'Yes',
        clipName: 'Yes',
        type: 'emote'
      }
    ]
  },
  goblin: {
    name: 'goblin',
    url: '/threejs/models/characters/Goblin.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 },
    animations: [
      {
        name: 'Death',
        clipName: 'GoblinArmature|Goblin_Death',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Idle',
        clipName: 'GoblinArmature|Goblin_Idle',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Run',
        clipName: 'GoblinArmature|Goblin_Run',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Walk',
        clipName: 'GoblinArmature|Goblin_Walk',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Attack',
        clipName: 'GoblinArmature|Goblin_Attack',
        type: 'emote'
      },
      {
        name: 'Attack2',
        clipName: 'GoblinArmature|Goblin_Attack2',
        type: 'emote'
      },
      {
        name: 'Jump',
        clipName: 'GoblinArmature|Goblin_Jump',
        type: 'emote'
      },
      {
        name: 'Roll',
        clipName: 'GoblinArmature|Goblin_Roll',
        type: 'emote'
      }
    ]
  },
  bat: {
    name: 'bat',
    url: '/threejs/models/characters/Bat.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 },
    animations: [
      {
        name: 'Death',
        clipName: 'BatArmature|Bat_Death',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Flying',
        clipName: 'BatArmature|Bat_Flying',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Attack',
        clipName: 'BatArmature|Bat_Attack',
        type: 'emote'
      },
      {
        name: 'Attack2',
        clipName: 'BatArmature|Bat_Attack2',
        type: 'emote'
      },
      {
        name: 'Hit',
        clipName: 'BatArmature|Bat_Hit',
        type: 'emote'
      }
    ]
  },
  slime: {
    name: 'slime',
    url: '/threejs/models/characters/Slime.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 },
    normalizationRotation: -Math.PI / 2,
    animations: [
      {
        name: 'Idle',
        clipName: 'Armature|Slime_Idle',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Walking',
        clipName: 'Armature|Slime_Walk',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Death',
        clipName: 'Armature|Slime_Death',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Attack',
        clipName: 'Armature|Slime_Attack',
        type: 'emote'
      }
    ]
  },
  dragon: {
    name: 'dragon',
    url: '/threejs/models/characters/Dragon.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 }
  },
  skeleton: {
    name: 'skeleton',
    url: '/threejs/models/characters/Skeleton.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.2, y: 0.2, z: 0.2 },
    animations: [
      {
        name: 'Death',
        clipName: 'SkeletonArmature|Skeleton_Death',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Idle',
        clipName: 'SkeletonArmature|Skeleton_Idle',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Running',
        clipName: 'SkeletonArmature|Skeleton_Running',
        type: 'state',
        clampEnd: false
      },
      {
        name: 'Spawn',
        clipName: 'SkeletonArmature|Skeleton_Spawn',
        type: 'state',
        clampEnd: true
      },
      {
        name: 'Attack',
        clipName: 'SkeletonArmature|Skeleton_Attack',
        type: 'emote'
      }
    ]
  },
  barrel: {
    name: 'barrel',
    url: '/threejs/models/characters/barrel.glb',
    size: { qLength: 1, sLength: 1 },
    normalizationScale: { x: 0.5, y: 0.5, z: 0.5 }
  }
}
