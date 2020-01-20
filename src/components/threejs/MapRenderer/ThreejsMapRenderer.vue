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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'stats.js'
import * as TWEEN from 'es6-tween'
import * as Hammer from 'hammerjs'

import { setMouse, degToRad } from './helpers'
import { loadTileTextures } from './loadTextures'
import { onModelLoad, onModelProgress, onModelError } from './modelHelpers'
import {
  toggleTileActiveState,
  getTilePosition,
  hideRollOver
} from './tileActions'

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

      // three map objects
      container: null,
      camera: null,
      renderer: null,
      scene: null,
      geometries: null,
      materials: null,
      boardGroup: null,

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
    ...mapGetters('threeMap', {
      instancedMeshesVuex: 'instancedMeshes',
      selectedTile: 'selectedTile',
      controls: 'controls',
      selectionHighlighter: 'selectionHighlighter',
      characterGroup: 'characterGroup'
    }),
    editMode: {
      get () {
        return this.$store.state.threeMap.editMode
      },
      set (editMode) {
        this.$store.dispatch('threeMap/setEditMode', editMode)
      }
    },
    editTool: {
      get () {
        return this.$store.state.threeMap.editTool
      },
      set (editTool) {
        this.$store.dispatch('threeMap/setEditTool', editTool)
      }
    },
    creationTileType: {
      get () {
        return this.$store.state.threeMap.creationTileType
      },
      set (tileType) {
        this.$store.dispatch('threeMap/setCreationTileType', tileType)
      }
    },
    checkerboardSize () {
      return this.tilesNumber % 4 === 0 ? this.tilesNumber : this.tilesNumber + 4 - (this.tilesNumber % 4)
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

      this.scene = new THREE.Scene()
      this.scene.background = this.backgroundColor

      // add fog
      // this.scene.fog = new THREE.Fog(this.backgroundColor, 20, 22)

      this.createCamera()
      this.createControls()
      this.createLights()

      this.createGrid()

      this.materials = this.createMaterials()
      this.geometries = this.createGeometries()

      this.createMeshes()

      this.loadCharacterModel()
      this.createRenderer()

      this.renderer.setAnimationLoop((time) => {
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

      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

      this.camera.position.set(0, 10, 0)
    },
    /**
     * Create the camera map controls
     */
    createControls () {
      let controls = new MapControls(this.camera, this.container)
      controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      controls.dampingFactor = 0.15
      controls.screenSpacePanning = false
      controls.minDistance = 4
      controls.maxDistance = 50
      controls.maxPolarAngle = Math.PI / 2.2
      this.$store.dispatch('threeMap/setControls', controls)
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

      this.scene.add(ambientLight, mainLight)
    },
    /**
     * Load Models
     */
    loadCharacterModel () {
      const loader = new GLTFLoader()

      // Load 90s dad
      const characterGroup = new THREE.Group()
      characterGroup.name = 'character_group'

      // Hide 90s dad under board (TODO: figure out if he can be loaded without being added)
      characterGroup.position.set(0.5, -5, 0.5)

      this.$store.dispatch('threeMap/setCharacterGroup', characterGroup)

      this.boardGroup.add(characterGroup)

      // Load 90s dad
      const dadMatrix = new THREE.Matrix4()
      dadMatrix.makeScale(0.125, 0.125, 0.125)
      dadMatrix.setPosition(0, 0, 0)
      loader.load(
        '/threejs/models/90s_dad/scene.gltf',
        gltf => onModelLoad(gltf, this.characterGroup, dadMatrix),
        onModelProgress,
        onModelError
      )

      // Load 90s dad's sword
      const swordMatrix = new THREE.Matrix4()
      swordMatrix.makeRotationFromEuler(new THREE.Euler(degToRad(70), degToRad(15), degToRad(-80), 'XYZ'))
      swordMatrix.multiply(this.matrix.makeScale(0.4, 0.4, 0.4))
      swordMatrix.setPosition(0.17, 0.71, 0.175)
      loader.load(
        '/threejs/models/medieval_sword/scene.gltf',
        gltf => onModelLoad(gltf, this.characterGroup, swordMatrix),
        onModelProgress,
        onModelError
      )
    },
    /**
     * Create grid
     */
    createGrid () {
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
      let gridHelper = new THREE.GridHelper(this.checkerboardSize, this.checkerboardSize, 0x444444, 0x666666)
      gridGroup.add(gridHelper)

      let planeGeometry = new THREE.PlaneBufferGeometry(this.checkerboardSize, this.checkerboardSize)
      planeGeometry.rotateX(Math.PI * -0.5)
      let plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
        visible: false
      }))
      gridGroup.add(plane)

      this.scene.add(gridGroup)
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

      // checker material
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load('/threejs/textures/checkerboard.jpg')
      texture.repeat.set(this.checkerboardSize / 4, this.checkerboardSize / 4)
      texture.encoding = THREE.sRGBEncoding
      texture.anisotropy = 16
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.magFilter = THREE.NearestFilter

      const board = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
      })

      return {
        tile,
        tiles,
        board,
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
      const board = new THREE.PlaneBufferGeometry(this.checkerboardSize, this.checkerboardSize)
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
      this.boardGroup = new THREE.Group()

      this.scene.add(this.boardGroup)

      // Add checkerboard
      // TODO: determine what to do with checkerboard
      const boardBase = new THREE.Mesh(this.geometries.board, this.materials.stage)
      boardBase.position.y = -0.01
      boardBase.rotation.x = Math.PI * -0.5
      this.boardGroup.add(boardBase)

      // Add fog of war
      // TODO: probably remove this for an alternate fog of war mechanism
      // const fogofwar = new THREE.Mesh(this.geometries.board, this.materials.fogofwar)
      // fogofwar.position.y = 0.251
      // fogofwar.rotation.x = Math.PI * -0.5

      // this.scene.add(fogofwar)

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
          mesh: new THREE.InstancedMesh(this.geometries.tiles[i], this.materials.tiles[i], count),
          count: 0
        }
        buildingMeshes[key].mesh.count = 0
        buildingMeshes[key].mesh.frustumCulled = false
        buildingMeshes[key].mesh.name = key
        buildingMeshes[key].mesh.itemType = 'tile'
      }

      // Set vuex instancedMeshes
      this.$store.dispatch('threeMap/setMeshes', buildingMeshes)

      // Add all instancedMeshes to the scene
      for (let i = 0; i < buildingKeys.length; i++) {
        // let key = this.getInstancedMeshKeyByIndex(i)
        let key = buildingKeys[i]
        this.boardGroup.add(buildingMeshes[key].mesh)
      }

      if (this.map.threejsTiles) {
        this.map.threejsTiles.forEach(tile => {
          this.instanceMatrix.makeTranslation(tile.position.x, tile.position.y, tile.position.z)
          this.matrix.makeRotationY(tile.rotation * Math.PI / 2)
          this.instanceMatrix.multiply(this.matrix)

          this.transform.position.set(tile.position.x, tile.position.y, tile.position.z)
          // this.transform.rotation.set()
          this.transform.rotateY(tile.rotation * Math.PI / 2)
          this.transform.updateMatrix()
          this.$store.dispatch('threeMap/addInstance', { matrix: this.instanceMatrix, name: tile.type, rotation: tile.rotation })
        })
      }

      // Create and add the selection mesh
      const selectionHighlighter = new THREE.Mesh(this.geometries.cone, this.materials.tile)

      selectionHighlighter.position.set(0, 0.85, 0)
      selectionHighlighter.rotation.set(Math.PI, 0, 0)
      selectionHighlighter.visible = false

      this.boardGroup.add(selectionHighlighter)
      this.$store.dispatch('threeMap/setSelectionHighlighter', selectionHighlighter)
    },
    /**
     * Create renderer
     */
    createRenderer () {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      })
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)

      this.renderer.setPixelRatio(window.devicePixelRatio)

      this.renderer.gammaFactor = 2.2
      this.renderer.gammaOutput = true

      this.renderer.physicallyCorrectLights = true

      this.renderer.domElement.id = 'map-canvas'

      // Add the canvas element
      this.container.appendChild(this.renderer.domElement)
    },
    /**
     * Perform app updates, this will be called once per frame
     */
    update (time) {
      TWEEN.update()
      this.controls.update()

      if (this.selectionHighlighter.visible) {
        this.selectionHighlighter.rotateY(0.02)
        this.selectionHighlighter.position.y = 0.85 + Math.sin(time / 200) * 0.1
      }
    },
    /**
     * Render the app
     */
    render () { // TODO: change to 'renderScene'
      // Render the SCENE!!
      this.renderer.render(this.scene, this.camera)
      this.stats.update()
    },
    /**
     * resize canvas helper
     */
    onWindowResize () {
      // set aspect ratio to match the new browser window aspect ratio
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight

      // update the camera's frustum
      this.camera.updateProjectionMatrix()

      // update the size of the renderer AND canvas
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    },
    /**
     * Click helper
     */
    onMouseClick (event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      setMouse(this.mouse, event, this.container)

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera)

      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects(this.boardGroup.children, true)
      const hasHitTile = intersects.length && intersects[0].object.itemType === 'tile'

      // Flag all intersections
      if (hasHitTile) {
        const name = intersects[0].object.name
        const instanceId = intersects[0].instanceId
        if (event.shiftKey || this.editTool === 'delete') {
          // When shift key is pressed or in delete mode, "delete"
          this.$store.dispatch('threeMap/deleteInstance', { name, instanceId })
        } else if (this.editTool === 'select') {
          this.selectTile(name, instanceId)
        } else if (this.editTool === 'activate') {
          // no shift key, activate
          toggleTileActiveState(name, instanceId, this.instancedMeshesVuex[name].mesh)
        }
      }

      // "unoccupied" board spaces intersections
      if (this.editTool === 'create' && this.creationTileType !== null && !hasHitTile) {
        this.raycaster.setFromCamera(this.mouse, this.camera)

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
      this.raycaster.setFromCamera(this.mouse, this.camera)

      // Check if we hit a tile, if so we don't want to hide the mesh
      let boardIntersects = this.raycaster.intersectObjects(this.boardGroup.children, true)
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
        this.rollOverMesh.position.floor()
        this.rollOverMesh.position.y = 0
        this.rollOverMesh.position.add(this.rolloverOffsetVector)
      }
    },
    /**
     * Hammer pan
     */
    onHammerPan (hammerEvent) {
      console.log('in renderer on hammer pan')
      this.onMouseClick(hammerEvent.srcEvent)
    },
    selectTile (name, instanceId) {
      // set selected tile
      this.$store.dispatch('threeMap/selectTile', { name, instanceId })

      // get position of selected tile and assign marker to that position
      let positionVec = getTilePosition(name, instanceId, this.instancedMeshesVuex)
      const currentY = this.selectionHighlighter.position.y
      this.$store.dispatch('threeMap/highlighterTargetTile', { x: positionVec.x, y: currentY, z: positionVec.z })
    },
    addTileByType (type, position) {
      if (this.instancedMeshesVuex.hasOwnProperty(type)) {
        this.$store.dispatch('threeMap/addInstance', { matrix: position.matrix, name: type })
      } else {
        console.error(`Invalid tile type: '${type}'`)
      }
    },
    toggleControlsVisibility () {
      this.showControls = !this.showControls
    },
    getInstancedMeshKeyByIndex (index) {
      return Object.keys(this.instancedMeshesVuex)[index]
    },
    disposeScene () {
      this.stopScene = true

      this.controls.dispose()
      this.scene.traverse(object => {
        if (!object.isMesh) return

        object.geometry.dispose()

        if (object.material.isMaterial) {
          this.cleanMaterial(object.material)
        } else {
          // an array of materials
          for (const material of object.material) this.cleanMaterial(material)
        }
      })
      this.scene = null
    },
    cleanMaterial (material) {
      material.dispose()

      // dispose textures
      for (const key of Object.keys(material)) {
        const value = material[key]
        if (value && typeof value === 'object' && 'minFilter' in value) {
          value.dispose()
        }
      }
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
