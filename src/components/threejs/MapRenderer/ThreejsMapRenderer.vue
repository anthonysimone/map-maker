<template>
  <div class="threejs-map-renderer">
    <div id="scene-container" ref="sceneContainer"></div>
    <div class="stats-container" ref="statsContainer"></div>
    <div class="loading-screen" :class="{'loading': loading}" v-if="showLoading"><div class="loader"></div></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'

import Stats from 'stats.js'
import * as TWEEN from 'es6-tween'
import * as Hammer from 'hammerjs'

import { setMouse, transformSize } from './helpers'
import { loadTileTextures } from './loadTextures'
import {
  toggleTileActiveState,
  getTilePosition,
  hideRollover,
  showRollover,
  setRolloverIsValid
} from './tileActions'
import { getModelUrl } from './modelHelpers'
import { createTileMesh, getTileModel, getTileDetails } from './tileModels'
import { Board } from './classes/Board'

import { threeMap } from '@/helpers/services/threeMapService'
import { threeAssets } from '@/helpers/services/threeAssetService'

export default {
  name: 'threejs-map-renderer',
  components: {
  },
  props: {
    map: {
      default: null,
      required: true,
      type: Object
    }
  },
  data () {
    return {
      loading: false,
      showLoading: false,

      id: this.$route.params.id,
      tilesNumber: this.map.tilesWidth,
      // tilesNumber: this.map.tilesWidth,
      stats: null,
      wasdEnabled: false,
      showControls: true,
      stopScene: false,
      clock: null,

      // three map objects
      container: null,

      // three helper ojects
      backgroundColor: new THREE.Color(0x8fbcd4),
      rolloverGeo: null,
      rolloverMaterial: null,
      rolloverMesh: null,
      objects: [],
      transform: new THREE.Object3D(),
      matrix: new THREE.Matrix4(),
      instanceMatrix: new THREE.Matrix4(),
      boardDepth: -0.1,

      // default values
      usedTiles: ['first', 'second', 'third', 'fourth', 'fifth', 'specialFloor', 'specialFloorLarge', 'archDoorWithFloorMerged', 'cornerColumn', 'threeWayColumn', 'fourWayColumn', 'wallModular'],
      usedCharacters: ['robot', 'slime', 'skeleton', 'goblin', 'bat', 'barrel']
    }
  },
  computed: {
    ...mapGetters('threeMap', [
      'editTool',
      'editMode',
      'selectedTile',
      'creationTile',
      'addModelType',
      'creationTileOrientation'
    ]),
    boardSize () {
      return this.tilesNumber % 2 === 0 ? this.tilesNumber : this.tilesNumber + 2 - (this.tilesNumber % 2)
    },
    // TODO: at some point this needs to be dynamic based on tiles used, for now it's just a static definition
    numberOfInstancedMeshes () {
      return 5
    }
  },
  methods: {
    queueAssetsToLoad () {
      // Queue necessary assets for tiles
      let usedTiles = this.map.threejsTiles.reduce((uniqueTiles, tile) => {
        if (uniqueTiles.indexOf(tile.type) === -1) {
          uniqueTiles.push(tile.type)
        }

        return uniqueTiles
      }, this.usedTiles)

      this.usedTiles = usedTiles

      this.usedTiles.forEach(tile => {
        const tileModel = getTileModel(tile)
        if (tileModel.type === 'basic') {
          threeAssets.queueAsset('texture', tile, tileModel.url)
        } else if (tileModel.type === 'gltf') {
          threeAssets.queueAsset('gltf', tile, tileModel.url)
        }
      })

      const tileModel = getTileModel('specialFloor')
      threeAssets.queueAsset('gltf', 'specialFloor', tileModel.url)

      // Queue necessary assets for characters
      let usedCharacters = this.map.threejsCharacters.reduce((uniqueChars, character) => {
        if (uniqueChars.indexOf(character.type) === -1) {
          uniqueChars.push(character.type)
        }

        return uniqueChars
      }, this.usedCharacters)

      this.usedCharacters = usedCharacters

      this.usedCharacters.forEach(character => {
        threeAssets.queueAsset('gltf', character, getModelUrl(character))
      })
    },
    loadQueuedAssets () {
      let loadingManager = new THREE.LoadingManager()

      loadingManager.onStart = () => {
        this.loading = true
        this.showLoading = true
      }

      loadingManager.onProgress = (item, loaded, total) => {
        // progressBar.style.width = (loaded / total * 100) + '%'
        // console.log('loading... queued item...', item, loaded, total)
      }

      let queuedAssetsLoaded = new Promise((resolve, reject) => {
        loadingManager.onLoad = () => {
          this.loading = false
          setTimeout(() => {
            this.showLoading = false
          }, 2000)

          resolve('done')
        }
      })

      threeAssets.loadQueuedAssets(loadingManager)

      return queuedAssetsLoaded
    },
    /**
     * Init scene
     */
    init () {
      // TODO: only show stats in dev
      this.stats = new Stats()
      this.stats.dom.style.removeProperty('position')
      this.$refs.statsContainer.appendChild(this.stats.dom)

      const scene = new THREE.Scene()
      scene.background = this.backgroundColor
      threeMap.setScene(scene)

      this.clock = new THREE.Clock()

      // add fog
      // threeMap.scene.fog = new THREE.Fog(this.backgroundColor, 20, 22)

      threeMap.setCamera(this.createCamera())
      threeMap.setControls(this.createControls())

      let minPan = new THREE.Vector3(-this.boardSize / 2, -this.boardSize / 2, -this.boardSize / 2)
      let maxPan = new THREE.Vector3(this.boardSize / 2, this.boardSize / 2, this.boardSize / 2)
      threeMap.restrictControlsPan(minPan, maxPan)

      this.createLights()

      this.createGrid()

      // Create board
      threeMap.setMaterials(this.createMaterials())
      threeMap.setGeometries(this.createGeometries())

      this.createMeshes()

      this.createRenderer()

      threeMap.renderer.setAnimationLoop((time) => {
        if (this.stopScene) {
          return null
        }

        this.update(time)
        this.render()
      })
    },
    /**
     * Create camera
     */
    createCamera () {
      const fov = 60 // Field of view
      const aspect = this.container.clientWidth / this.container.clientHeight
      const near = 0.1 // the near clipping plane
      const far = 60 // the far clipping plane

      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

      camera.position.set(0, 10, 10)

      return camera
    },
    /**
     * Create the camera map controls
     */
    createControls () {
      let controls = new MapControls(threeMap.camera, this.container)
      controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      controls.dampingFactor = 0.15
      controls.screenSpacePanning = false
      controls.minDistance = 4
      controls.maxDistance = 20
      controls.maxPolarAngle = Math.PI / 2.2

      return controls
    },
    /**
     * Create lights
     */
    createLights () {
      // Add ambient light
      const ambientLight = new THREE.HemisphereLight(
        0xffffff, // bright sky color
        0x222222, // dim ground color
        1 // intensity
      )

      // Add directional light, position, add to scene
      const mainLight = new THREE.DirectionalLight(0xffffff, 4.0)
      mainLight.position.set(10, 10, 10)

      threeMap.scene.add(ambientLight, mainLight)
    },

    /**
     * Create grid
     */
    createGrid () {
      // Initialize Grid
      // new SquareGrid(length, width)
      // cell - this handles gameplay things (walkability, pathfinding details, position)
      // tile - the actual threejs instance of an instanced mesh

      // Add grid group
      const gridGroup = new THREE.Group()

      // add roller helpers
      this.rolloverGeo = new THREE.BoxBufferGeometry(1, 0.4, 1)
      this.rolloverMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.5,
        transparent: true
      })
      this.rolloverMesh = new THREE.Mesh(this.rolloverGeo, this.rolloverMaterial)
      hideRollover(this.rolloverMesh)
      gridGroup.add(this.rolloverMesh)

      // add grid
      let gridHelper = new THREE.GridHelper(this.boardSize, this.boardSize, 0x444444, 0x666666)
      gridHelper.name = 'board-grid-helper'
      gridGroup.add(gridHelper)

      let planeGeometry = new THREE.PlaneBufferGeometry(this.boardSize, this.boardSize)
      planeGeometry.rotateX(Math.PI * -0.5)
      let plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
        visible: false
      }))
      gridGroup.add(plane)

      gridGroup.position.y = this.boardDepth

      threeMap.scene.add(gridGroup)
      this.objects.push(plane)
    },
    /**
     * Create materials
     */
    createMaterials () {
      // tile material
      const tile = new THREE.MeshStandardMaterial({
        color: 0xff3333, // red
        flatShading: true
      })
      tile.color.convertSRGBToLinear()

      // Load tile textures and fillers
      const tiles = loadTileTextures()

      // The material for the base of the grid
      const stage = new THREE.MeshStandardMaterial({
        color: this.backgroundColor,
        flatShading: true
      })

      // TODO: decide if this should be removed for an alternate fog of war mechanism
      // // The material for the fog of war
      // // create a typed array to hold texture data
      // const totalMaskSize = this.checkerboardSize * this.checkerboardSize
      // const mask = new Array(totalMaskSize)
      // mask.fill(1)
      // mask.fill(0, Math.floor(totalMaskSize / 2))
      // const fogofwarData = new Uint8Array(totalMaskSize)
      // // copy mask into the typed array
      // fogofwarData.set(mask.map(v => v * 255))
      // // create the texture
      // const fogofwarTexture = new THREE.DataTexture(fogofwarData, this.checkerboardSize, this.checkerboardSize, THREE.LuminanceFormat, THREE.UnsignedByteType)
      // fogofwarTexture.flipY = true
      // fogofwarTexture.wrapS = THREE.ClampToEdgeWrapping
      // fogofwarTexture.wrapT = THREE.ClampToEdgeWrapping
      // // it's likely that our texture will not have "power of two" size, meaning that mipmaps are not going to be supported on WebGL 1.0, so let's turn them off
      // fogofwarTexture.generateMipmaps = false

      // fogofwarTexture.magFilter = THREE.NearestFilter
      // fogofwarTexture.minFilter = THREE.NearestFilter

      // const fogofwar = new THREE.MeshBasicMaterial({
      //   color: 0x000000,
      //   alphaMap: fogofwarTexture,
      //   side: THREE.DoubleSide,
      //   transparent: true,
      //   depthWrite: false,
      //   // depthTest: false,
      //   opacity: 1
      // })

      return {
        tile,
        tiles,
        stage
        // fogofwar
      }
    },
    /**
     * Create geometries
     */
    createGeometries () {
      const tile = new THREE.BoxBufferGeometry(1, 0.25, 1)
      const flatTile = new THREE.PlaneBufferGeometry(1, 1)
      const board = new THREE.PlaneBufferGeometry(this.boardSize, this.boardSize)
      const cone = new THREE.ConeBufferGeometry(0.3, 1, 8)

      const tiles = []
      for (let i = 0; i < this.numberOfInstancedMeshes; i++) {
        tiles.push(new THREE.BoxBufferGeometry(1, 0.25, 1))
      }

      return {
        tile,
        tiles,
        flatTile,
        board,
        cone
      }
    },
    /**
     * Create meshes
     */
    createMeshes () {
      // Initializie board class
      threeMap.boardClass = new Board(this.tilesNumber, this.tilesNumber)

      // create the train group that will hold all train pieces
      threeMap.setBoardGroup(new THREE.Group())

      threeMap.scene.add(threeMap.boardGroup)

      // Add checkerboard
      // TODO: determine what to do with checkerboard
      const boardBase = new THREE.Mesh(threeMap.geometries.board, threeMap.materials.stage)
      boardBase.name = 'board-grid'
      boardBase.position.y = this.boardDepth - 0.01
      boardBase.rotation.x = Math.PI * -0.5
      threeMap.boardGroup.add(boardBase)

      // Add fog of war
      // TODO: probably remove this for an alternate fog of war mechanism
      // const fogofwar = new THREE.Mesh(threeMap.geometries.board, threeMap.materials.fogofwar)
      // fogofwar.position.y = 0.251
      // fogofwar.rotation.x = Math.PI * -0.5

      // threeMap.scene.add(fogofwar)

      /** Create Tiles Instanced - Start */
      let count = this.tilesNumber * this.tilesNumber

      // Create all instanced meshes
      let tiles = {}
      for (let i = 0; i < this.usedTiles.length; i++) {
        // let key = this.getInstancedMeshKeyByIndex(i)
        let key = this.usedTiles[i]
        let { size } = getTileDetails(key)
        let tileMesh = createTileMesh(key, count)
        tiles[key] = {
          mesh: tileMesh,
          count: 0,
          size
        }
        tiles[key].mesh.count = 0
        tiles[key].mesh.frustumCulled = false
        tiles[key].mesh.name = key
        tiles[key].mesh.itemType = 'tile'
      }

      // Set tileMeshes
      threeMap.setMeshes(tiles)

      // Add all instanced tileMeshes to the scene
      for (let i = 0; i < this.usedTiles.length; i++) {
        let key = this.usedTiles[i]
        threeMap.boardGroup.add(threeMap.tileInstancedMeshes[key].mesh)
      }

      // Add saved tiles
      if (this.map.threejsTiles) {
        this.map.threejsTiles.forEach(tile => {
          const size = tile.orientation === 'default' ? threeMap.tileInstancedMeshes[tile.type].size : transformSize(threeMap.tileInstancedMeshes[tile.type].size)
          const tilePos = threeMap.boardClass.getTilePositionFromBoardCoords(tile.coords.q, tile.coords.s, size)
          let rotation = tile.rotation
          if (tile.orientation === 'alternate') {
            rotation += 1
          }

          this.instanceMatrix.makeTranslation(tilePos.x, 0, tilePos.z)
          this.matrix.makeRotationY(rotation * Math.PI / 2)
          this.instanceMatrix.multiply(this.matrix)

          threeMap.addInstance({ matrix: this.instanceMatrix, name: tile.type, rotation: tile.rotation }, tile.coords, tile.orientation)
        })
      }

      // Add saved characters
      if (this.map.threejsCharacters) {
        this.map.threejsCharacters.forEach(character => {
          this.addModelByType(character.type, character.coords, character.rotation, character.defaultAction)
        })
      }

      // Create and add the selection mesh
      const selectionHighlighter = new THREE.Group()
      const highlighter = new THREE.Mesh(threeMap.geometries.cone, threeMap.materials.tile)

      highlighter.position.set(0, 0.85, 0)
      highlighter.rotation.set(Math.PI, 0, 0)
      selectionHighlighter.visible = false
      selectionHighlighter.add(highlighter)

      threeMap.boardGroup.add(selectionHighlighter)
      threeMap.setSelectionHighlighter(selectionHighlighter)
    },
    /**
     * Create renderer
     */
    createRenderer () {
      const renderer = new THREE.WebGLRenderer({
        antialias: true
      })
      renderer.setSize(this.container.clientWidth, this.container.clientHeight)

      renderer.setPixelRatio(window.devicePixelRatio)

      renderer.gammaFactor = 2.2
      renderer.outputEncoding = THREE.sRGBEncoding

      renderer.physicallyCorrectLights = true

      renderer.domElement.id = 'map-canvas'

      // Add the canvas element
      this.container.appendChild(renderer.domElement)

      threeMap.setRenderer(renderer)
    },
    /**
     * Perform app updates, this will be called once per frame
     */
    update (time) {
      TWEEN.update()
      threeMap.controls.update()

      // Handle updating objects with animation mixers
      let dt = this.clock.getDelta()
      if (threeMap.mixers.length) {
        threeMap.mixers.forEach(mixer => {
          mixer.update(dt)
        })
      }

      if (threeMap.selectionHighlighter.visible) {
        threeMap.selectionHighlighter.children[0].rotateY(0.02)
        threeMap.selectionHighlighter.children[0].position.y = 0.85 + Math.sin(time / 200) * 0.1
      }
    },
    /**
     * Render the app
     */
    render () { // TODO: change to 'renderScene'
      // Render the SCENE!!
      threeMap.renderer.render(threeMap.scene, threeMap.camera)
      this.stats.update()
    },
    /**
     * resize canvas helper
     */
    onWindowResize () {
      // set aspect ratio to match the new browser window aspect ratio
      threeMap.camera.aspect = this.container.clientWidth / this.container.clientHeight

      // update the camera's frustum
      threeMap.camera.updateProjectionMatrix()

      // update the size of the renderer AND canvas
      threeMap.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    },
    /**
     * Click helper
     */
    onMouseClick (event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      setMouse(threeMap.mouse, event, this.container)

      // update the picking ray with the camera and mouse position
      threeMap.raycaster.setFromCamera(threeMap.mouse, threeMap.camera)

      // calculate objects intersecting the picking ray
      let intersects = threeMap.raycaster.intersectObjects(threeMap.boardGroup.children, true)

      const hasHitTile = intersects.length && intersects[0].object.itemType === 'tile'
      const hasHitModel = intersects.length && intersects[0].object.userData.modelGroupName

      if (hasHitModel) {
        const modelGroup = threeMap.getObjectByName(hasHitModel)
        if (this.editTool === 'select') {
          this.selectObject(modelGroup)
        } else if (this.editTool === 'deleteModel') {
          threeMap.deleteModel(modelGroup)
        }
      }

      // All actions that should be done if a tile is hit
      if (hasHitTile) {
        const name = intersects[0].object.name
        const instanceId = intersects[0].instanceId
        if (event.shiftKey || this.editTool === 'delete') {
          // When shift key is pressed or in delete mode, "delete"
          const coords = threeMap.boardClass.pointToCoords(intersects[0].point)
          const anchorCell = threeMap.boardClass.getAnchorCell(coords.q, coords.s)
          threeMap.deleteInstance({ name, instanceId }, { q: anchorCell.q, s: anchorCell.s })
        } else if (this.editTool === 'select') {
          this.selectTile(name, instanceId)
        } else if (this.editTool === 'activate') {
          // no shift key, activate
          toggleTileActiveState(name, instanceId, threeMap.tileInstancedMeshes[name].mesh)
        } else if (this.editTool === 'addModel' && this.addModelType !== null) {
          const coords = threeMap.boardClass.pointToCoords(intersects[0].point)
          this.addModelByType(this.addModelType, coords)
        }
      }

      // "unoccupied" board spaces intersections
      if (this.editTool === 'create' && this.creationTile !== null && !hasHitTile && this.rolloverMesh.userData.isValid) {
        if (intersects.length > 0) {
          let intersect = intersects[0]

          // Get normalized position for the mouse point
          // const normalizedPoint = threeMap.boardClass.pointToNormalizedOffset(intersect.point)

          const size = this.creationTileOrientation === 'default'
            ? threeMap.tileInstancedMeshes[this.creationTile.name].size
            : transformSize(threeMap.tileInstancedMeshes[this.creationTile.name].size)
          const coords = threeMap.boardClass.pointToCoords(intersect.point)
          const position = threeMap.boardClass.getTilePositionFromBoardCoords(coords.q, coords.s, size)

          // Set position for new tile
          this.transform.position.x = position.x
          this.transform.position.y = 0
          this.transform.position.z = position.z
          this.transform.rotation.y = this.creationTileOrientation === 'default' ? 0 : Math.PI / 2
          this.transform.updateMatrix()

          this.addTileByType(this.creationTile.name, this.transform, coords, this.creationTileOrientation)
          hideRollover(this.rolloverMesh)
        }
      }
    },
    /**
     * onMouseMove
     */
    onDocumentMouseMove (event) {
      event.preventDefault()
      if (event.target.id !== 'map-canvas' || this.editTool !== 'create' || this.creationTile === null) {
        return
      }

      setMouse(threeMap.mouse, event, this.container)
      threeMap.raycaster.setFromCamera(threeMap.mouse, threeMap.camera)

      // Get the cell we hit, and check the status.
      let boardIntersect = threeMap.raycaster.intersectObject(threeMap.boardGroup.getObjectByName('board-grid'))
      const cell = boardIntersect.length === 1 ? threeMap.boardClass.getCellByPoint(boardIntersect[0].point) : null
      const changed = threeMap.currentRolloverCell !== cell

      if (cell && !cell.hasTile && changed) {
        threeMap.currentRolloverCell = cell
        const offsetPoint = threeMap.boardClass.pointToNormalizedOffset(boardIntersect[0].point)
        const tileSize = this.creationTileOrientation === 'default' ? this.creationTile.size : transformSize(this.creationTile.size)

        showRollover(this.rolloverMesh, offsetPoint, tileSize)
        setRolloverIsValid(this.rolloverMesh, threeMap.boardClass.canPlaceTile(cell.q, cell.s, tileSize))
      } else if (changed) {
        threeMap.currentRolloverCell = cell
        hideRollover(this.rolloverMesh)
      }
    },
    /**
     * Hammer pan
     */
    onHammerPan (hammerEvent) {
      this.onMouseClick(hammerEvent.srcEvent)
    },
    selectTile (name, instanceId) {
      // set selected tile
      this.$store.dispatch('threeMap/selectTile', { name, instanceId })

      // get position of selected tile and assign marker to that position
      let positionVec = getTilePosition(name, instanceId, threeMap.tileInstancedMeshes)
      const currentY = 0.25
      threeMap.highlighterTargetTile({ x: positionVec.x, y: currentY, z: positionVec.z })
    },
    selectObject (object) {
      // set selected object
      this.$store.dispatch('threeMap/selectModel', object.name)

      const position = object.getWorldPosition()
      const boundingBox = new THREE.Box3().setFromObject(object)
      position.y = boundingBox.max.y
      threeMap.highlighterTargetTile(position)
    },
    addTileByType (type, position, coords, orientation) {
      if (threeMap.tileInstancedMeshes.hasOwnProperty(type)) {
        threeMap.addInstance({ matrix: position.matrix, name: type }, coords, orientation)
      } else {
        console.error(`Invalid tile type: '${type}'`)
      }
    },
    addModelByType (type, coords, rotation, defaultAction = null) {
      const modelGltf = threeAssets.getLoadedGltf(type)
      const clonedScene = threeAssets.getClonedGltfScene(type)
      threeMap.addModelItem(type, clonedScene, modelGltf.animations, defaultAction, coords, rotation)
    },
    toggleControlsVisibility () {
      this.showControls = !this.showControls
    },
    getInstancedMeshKeyByIndex (index) {
      return Object.keys(threeMap.tileInstancedMeshes)[index]
    },
    disposeScene () {
      this.stopScene = true

      threeMap.disposeScene()
    }
  },
  destroyed () {
    // Remove our manually added event listeners
    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('onorientationchange', this.onWindowResize)
    window.removeEventListener('mousemove', this.onDocumentMouseMove, false)

    // Remove all local objects
    this.disposeScene()

    // Clear vuex three relatetd map state
    this.$store.dispatch('threeMap/destroy')
    threeMap.clearMap()
  },
  mounted () {
    // Set the container reference
    this.container = this.$refs.sceneContainer

    // Collect all assets that are required and queue them to be loaded
    this.queueAssetsToLoad()

    // Load all queued assets and return promise that will resolve on completion
    const assetsPromise = this.loadQueuedAssets()

    // Once all queued assets are loading, initialize the scene
    assetsPromise.then(result => {
      this.init()
    })

    // Initialize all event listeners for the scene
    // TODO: implement these the right way
    // Need to resize on both resize and orientation changes
    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('onorientationchange', this.onWindowResize)
    window.addEventListener('mousemove', this.onDocumentMouseMove, false)

    // Add hammertime with tap and pan (disabled by default)
    const hammerManager = new Hammer.Manager(this.container, {
      recognizers: [
        [Hammer.Tap],
        [Hammer.Pan, { enable: false }]
      ]
    })

    // Add tap listener
    hammerManager.on('tap', e => {
      this.onMouseClick(e.srcEvent)
    })

    // Add pan listener
    hammerManager.on('pan', this.onHammerPan)

    // Initialize the hammer manager in vuex
    this.$store.dispatch('threeMap/initHammerManager', hammerManager)
  }
}
</script>

<style lang="scss">
@keyframes spin {
  0%   {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

#scene-container {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.stats-container {
  position: absolute;
  bottom: 0;
  left: 0;
}

.loading-screen {
  position: absolute;
  height: 100%;
  width: 100%;
  background: #ffffff;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0ms 1200ms, opacity 1200ms 0ms;

  &.loading {
    opacity: 1;
    visibility: visible;
    transition: visibility 0ms 0ms, opacity 0ms 0ms;
  }
}

.loader {
  display: block;
  position: relative;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #9370db;
  animation: spin 2s linear infinite;
}

.loader:before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #ba55d3;
  animation: spin 3s linear infinite;
}

.loader:after {
  content: '';
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #ff00ff;
  animation: spin 1.5s linear infinite;
}
</style>
