<template>
  <div class="threejs-map-renderer">
    <div id="scene-container" ref="sceneContainer"></div>
    <div class="stats-container" ref="statsContainer"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats.js'
import * as TWEEN from 'es6-tween'
import * as Hammer from 'hammerjs'

import { setMouse } from './helpers'
import { loadTileTextures } from './loadTextures'
import {
  toggleTileActiveState,
  getTilePosition,
  hideRollOver
} from './tileActions'

import { threeMap } from '@/helpers/services/threeMapService'

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

      // animation helpers
      mixers: [], // probably move this over to threeMap once I'm actually using it

      // three helper ojects
      backgroundColor: new THREE.Color(0x8fbcd4),
      rollOverGeo: null,
      rollOverMaterial: null,
      rollOverMesh: null,
      objects: [],
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      transform: new THREE.Object3D(),
      rolloverOffsetVector: new THREE.Vector3(0.5, 0.125, 0.5),
      initialTileOffsetVector: new THREE.Vector3(0.5, 0.125, 0.5),
      matrix: new THREE.Matrix4(),
      instanceMatrix: new THREE.Matrix4()
    }
  },
  computed: {
    ...mapGetters('threeMap', [
      'editTool',
      'editMode',
      'selectedTile',
      'creationTileType',
      'addModelType'
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
    /**
     * Init scene
     */
    init () {
      // TODO: only show stats in dev
      this.stats = new Stats()
      this.stats.dom.style.removeProperty('position')
      this.$refs.statsContainer.appendChild(this.stats.dom)

      this.container = this.$refs.sceneContainer

      const scene = new THREE.Scene()
      scene.background = this.backgroundColor
      threeMap.setScene(scene)

      this.clock = new THREE.Clock()

      // add fog
      // threeMap.scene.fog = new THREE.Fog(this.backgroundColor, 20, 22)

      threeMap.setCamera(this.createCamera())
      threeMap.setControls(this.createControls())
      this.createLights()

      this.createGrid()

      // Create board
      threeMap.setMaterials(this.createMaterials())
      threeMap.setGeometries(this.createGeometries())

      this.createMeshes()

      this.loadRobotModel()
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
      const far = 30 // the far clipping plane

      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

      camera.position.set(0, 10, -10)

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
     * Generic load model method using the service setup via veux
     * TODO: does this still need to be / should this still be async?
     */
    async loadModelAsync (modelKey, position, rotation) {
      await threeMap.loadModelObject({ modelKey, position, rotation })
    },
    /**
     * Load Robot Model
     */
    loadRobotModel () {
      // this.loadModelAsync('robot', { x: 0.5, y: 0.25, z: 0.5 })

      // this.loadModelAsync('tile', { x: 0.5, y: 0.25, z: 0.5 })
      // this.loadModelAsync('wall', { x: 2.5, y: 0.25, z: 2.5 })
      // this.loadModelAsync('stairs', { x: 0.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('tile', { x: 1.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('slime', { x: 3.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('slime', { x: 4.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('slime', { x: 5.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('slime', { x: 1.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('slime', { x: 2.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('slime', { x: 3.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('slime', { x: 4.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('slime', { x: 5.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('slime', { x: 1.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('slime', { x: 2.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('slime', { x: 3.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('slime', { x: 4.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('slime', { x: 5.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('slime', { x: 1.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('slime', { x: 2.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('slime', { x: 3.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('slime', { x: 4.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('slime', { x: 5.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('slime', { x: 1.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('skeleton', { x: 2.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('skeleton', { x: 3.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('skeleton', { x: 4.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('skeleton', { x: 5.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('skeleton', { x: 1.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('skeleton', { x: 2.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('skeleton', { x: 3.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('skeleton', { x: 4.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('skeleton', { x: 5.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('skeleton', { x: 5.5, y: 2.25, z: 5.5 })

      // this.loadModelAsync('dad', { x: 0.5, y: 0.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 0.25, z: 2.5 })
      // this.loadModelAsync('dad', { x: 0.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 1.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 3.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 4.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 0.5 })
      // this.loadModelAsync('dad', { x: 1.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('dad', { x: 3.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('dad', { x: 4.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 1.5 })
      // this.loadModelAsync('dad', { x: 1.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('dad', { x: 3.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('dad', { x: 4.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 2.5 })
      // this.loadModelAsync('dad', { x: 1.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('dad', { x: 3.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('dad', { x: 4.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 3.5 })
      // this.loadModelAsync('dad', { x: 1.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('dad', { x: 3.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('dad', { x: 4.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 4.5 })
      // this.loadModelAsync('dad', { x: 1.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('dad', { x: 2.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('dad', { x: 3.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('dad', { x: 4.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 5.5 })
      // this.loadModelAsync('dad', { x: 5.5, y: 2.25, z: 5.5 })
    },
    /**
     * Load Models
     * TODO: Refactor 90s dad to use loadModelAsync function
     */
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
      this.rollOverGeo = new THREE.BoxBufferGeometry(1, 0.25, 1)
      this.rollOverMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true
      })
      this.rollOverMesh = new THREE.Mesh(this.rollOverGeo, this.rollOverMaterial)
      hideRollOver(this.rollOverMesh)
      gridGroup.add(this.rollOverMesh)

      // add grid
      let gridHelper = new THREE.GridHelper(this.boardSize, this.boardSize, 0x444444, 0x666666)
      gridGroup.add(gridHelper)

      let planeGeometry = new THREE.PlaneBufferGeometry(this.boardSize, this.boardSize)
      planeGeometry.rotateX(Math.PI * -0.5)
      let plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
        visible: false
      }))
      gridGroup.add(plane)

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
      // create the train group that will hold all train pieces
      threeMap.setBoardGroup(new THREE.Group())

      threeMap.scene.add(threeMap.boardGroup)

      // Add checkerboard
      // TODO: determine what to do with checkerboard
      const boardBase = new THREE.Mesh(threeMap.geometries.board, threeMap.materials.stage)
      boardBase.position.y = -0.01
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

      // arbitrary constnat at this point
      let buildingMeshes = {
        first: {},
        second: {},
        third: {},
        fourth: {},
        fifth: {}
      }

      let buildingKeys = Object.keys(buildingMeshes)
      // Create all instanced meshes
      for (let i = 0; i < buildingKeys.length; i++) {
        // let key = this.getInstancedMeshKeyByIndex(i)
        let key = buildingKeys[i]
        buildingMeshes[key] = {
          mesh: new THREE.InstancedMesh(threeMap.geometries.tiles[i], threeMap.materials.tiles[i], count),
          count: 0
        }
        buildingMeshes[key].mesh.count = 0
        buildingMeshes[key].mesh.frustumCulled = false
        buildingMeshes[key].mesh.name = key
        buildingMeshes[key].mesh.itemType = 'tile'
      }

      // Set vuex instancedMeshes
      threeMap.setMeshes(buildingMeshes)

      // Add all instancedMeshes to the scene
      for (let i = 0; i < buildingKeys.length; i++) {
        // let key = this.getInstancedMeshKeyByIndex(i)
        let key = buildingKeys[i]
        threeMap.boardGroup.add(buildingMeshes[key].mesh)
      }

      // Add saved tiles
      if (this.map.threejsTiles) {
        this.map.threejsTiles.forEach(tile => {
          this.instanceMatrix.makeTranslation(tile.position.x, tile.position.y, tile.position.z)
          this.matrix.makeRotationY(tile.rotation * Math.PI / 2)
          this.instanceMatrix.multiply(this.matrix)

          this.transform.position.set(tile.position.x, tile.position.y, tile.position.z)
          // this.transform.rotation.set()
          this.transform.rotateY(tile.rotation * Math.PI / 2)
          this.transform.updateMatrix()
          threeMap.addInstance({ matrix: this.instanceMatrix, name: tile.type, rotation: tile.rotation })
        })
      }

      // Add saved characters
      if (this.map.threejsCharacters) {
        this.map.threejsCharacters.forEach(character => {
          this.addModelByType(character.type, character.position, character.rotation)
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
      renderer.gammaOutput = true

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
      if (this.mixers.length) {
        this.mixers.forEach(mixer => {
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
      setMouse(this.mouse, event, this.container)

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, threeMap.camera)

      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects(threeMap.boardGroup.children, true)

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
          threeMap.deleteInstance({ name, instanceId })
        } else if (this.editTool === 'select') {
          this.selectTile(name, instanceId)
        } else if (this.editTool === 'activate') {
          // no shift key, activate
          toggleTileActiveState(name, instanceId, threeMap.instancedMeshes[name].mesh)
        } else if (this.editTool === 'addModel' && this.addModelType !== null) {
          let positionVec = getTilePosition(name, instanceId, threeMap.instancedMeshes)
          this.addModelByType(this.addModelType, positionVec)
        }
      }

      // "unoccupied" board spaces intersections
      if (this.editTool === 'create' && this.creationTileType !== null && !hasHitTile) {
        this.raycaster.setFromCamera(this.mouse, threeMap.camera)

        let objectsIntersects = this.raycaster.intersectObjects(this.objects, true)

        if (objectsIntersects.length > 0) {
          let intersect = objectsIntersects[0]

          intersect.point.floor()
          intersect.point.y = 0
          intersect.point.add(this.initialTileOffsetVector)
          this.transform.position.copy(intersect.point)
          this.transform.updateMatrix()

          this.addTileByType(this.creationTileType, this.transform)
          hideRollOver(this.rollOverMesh)
        }
      }
    },
    /**
     * onMouseMove
     */
    onDocumentMouseMove (event) {
      event.preventDefault()
      if (event.target.id !== 'map-canvas') {
        return
      }

      setMouse(this.mouse, event, this.container)
      this.raycaster.setFromCamera(this.mouse, threeMap.camera)

      // Check if we hit a tile, if so we don't want to hide the mesh
      let boardIntersects = this.raycaster.intersectObjects(threeMap.boardGroup.children, true)
      const hasHitTile = boardIntersects.length && boardIntersects[0].object.itemType === 'tile'
      if (hasHitTile) {
        hideRollOver(this.rollOverMesh)
        return
      }

      // If we haven't hit a tile, check where in the grid we are and position rollover
      let intersects = this.raycaster.intersectObjects(this.objects, true)
      if (intersects.length > 0) {
        var intersect = intersects[0]

        this.rollOverMesh.position.copy(intersect.point)
        // this.rollOverMesh.position.add(this.oddOffsetVec)
        this.rollOverMesh.position.floor()
        this.rollOverMesh.position.y = 0
        this.rollOverMesh.position.add(this.rolloverOffsetVector)
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
      let positionVec = getTilePosition(name, instanceId, threeMap.instancedMeshes)
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
    addTileByType (type, position) {
      if (threeMap.instancedMeshes.hasOwnProperty(type)) {
        threeMap.addInstance({ matrix: position.matrix, name: type })
      } else {
        console.error(`Invalid tile type: '${type}'`)
      }
    },
    addModelByType (type, position, rotation) {
      this.loadModelAsync(type, position, rotation)
    },
    toggleControlsVisibility () {
      this.showControls = !this.showControls
    },
    getInstancedMeshKeyByIndex (index) {
      return Object.keys(threeMap.instancedMeshes)[index]
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
    // Set everything up
    this.init()
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
</style>
