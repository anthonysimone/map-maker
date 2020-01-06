<template>
  <div class="threejs-map-renderer">
    <div id="scene-container" ref="scene-container"></div>
    <div class="ui-elements" :class="{ 'show-controls': showControls }">
      <button class="controls-toggle" @click="toggleControlsVisibility">Toggle Controls</button>
      <div class="control">
        <label>Tool</label>
        <div class="tool-state horizontal-radios">
          <label class="radio-label">
            <input type="radio" value="activate" checked name="tapState" v-model="tapState" @change="onTapStateChange">
            <span>Activate</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="create" name="tapState" v-model="tapState">
            <span>Create</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="select" name="tapState" v-model="tapState">
            <span>Select</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="delete" name="tapState" v-model="tapState">
            <span>Delete</span>
          </label>
        </div>
      </div>
      <div class="control tool-mode">
        <label>Edit Mode</label>
        <div class="horizontal-radios">
          <label class="radio-label">
            <input type="radio" value="normal" checked name="editMode" v-model="editMode" @change="onEditModeChange">
            <span>Normal</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="quick" name="editMode" v-model="editMode" @change="onEditModeChange">
            <span>Quick</span>
          </label>
        </div>
      </div>
      <div class="control creation-tile-type" :class="{ enabled: tapState === 'create' }">
        <label>Creation Tile Type</label>
        <div class="list-radios">
          <label class="radio-label">
            <input type="radio" value="first" checked name="creationTileType" v-model="creationTileType">
            <span>Floor</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="second" name="creationTileType" v-model="creationTileType">
            <span>Wall</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="third" name="creationTileType" v-model="creationTileType">
            <span>Door</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="fourth" name="creationTileType" v-model="creationTileType">
            <span>Water</span>
          </label>
          <label class="radio-label">
            <input type="radio" value="fifth" name="creationTileType" v-model="creationTileType">
            <span>Pit</span>
          </label>
        </div>
      </div>
      <div class="control">
        <button class="reset-button" @click="resetAllTiles">Reset tile position!</button>
      </div>
      <div class="control selected-tile-actions" :class="{ 'has-selection': selectedTile }">
        <span class="selected-tile-label">{{ selectedTile }}</span>
        <button class="rotate-tile" @click="onRotateTile">Rotate</button>
      </div>
      <div class="control hero-action">
        <label>Add hero to selected tile</label>
        <button class="place-hero" @click="onPlaceHero">Place Hero</button>
        <div class="d-pad">
          <button class="rotate-hero-left">&larr;</button>
          <button class="rotate-hero-right">&rarr;</button>
          <button class="move-hero-forward">&uarr;</button>
          <button class="move-hero-backward">&darr;</button>
          <label class="enable-wasd toggle-check-label">
            <input type="checkbox" value="true" name="enableWASD">
            <span>Enable WASD</span>
          </label>
        </div>
      </div>
      <div class="control">
        <button class="go-fullscreen" @click="fullscreenMap">Go Fullscreen</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'stats.js'
import * as TWEEN from 'es6-tween'
import * as Hammer from 'hammerjs'

import { deconstructTileStringId, setMouse, degToRad, setPan } from './helpers'
import { loadTileTextures } from './loadTextures'
// import { rotateModel, moveForward, moveBackward } from './heroActions'
import { onModelLoad, onModelProgress, onModelError } from './modelHelpers'
import {
  toggleTileActiveState,
  rotateTile,
  deleteTile,
  addTile,
  getTilePosition,
  getSelectedTilePosition,
  hideRollOver
} from './tileActions'
import { tweenActiveTileToggle } from './tweens'

export default {
  name: 'threejs-map-renderer',
  components: {
  },
  props: {
  },
  data () {
    return {
      container: null,
      camera: null,
      controls: null,
      renderer: null,
      scene: null,
      mesh: null,
      geometries: null,
      materials: null,
      selectionHighlighter: null,
      boardGroup: null,
      characterGroup: null,
      tilesNumber: 30,
      stats: null,
      backgroundColor: new THREE.Color(0x8fbcd4),
      instancedMeshes: {
        first: {},
        second: {},
        third: {},
        fourth: {},
        fifth: {},
        sixth: {},
        seventh: {},
        eighth: {},
        ninth: {},
        tenth: {}
      },
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
      selectedTile: null,
      tapState: 'activate',
      creationTileType: 'first',
      editMode: 'normal',
      wasdEnabled: false,
      showControls: true,
      hammerContainer: null
    }
  },
  computed: {
    checkerboardSize () {
      return this.tilesNumber % 4 === 0 ? this.tilesNumber : this.tilesNumber + 4 - (this.tilesNumber % 4)
    },
    numberOfInstancedMeshes () {
      return Object.keys(this.instancedMeshes).length
    }
  },
  methods: {
    /**
     * Init scene
     */
    init () {
      this.stats = new Stats() // <-- remove me
      document.body.appendChild(this.stats.dom) // <-- remove me

      this.container = document.querySelector('#scene-container')

      this.scene = new THREE.Scene()
      this.scene.background = this.backgroundColor

      // add fog
      // scene.fog = new THREE.Fog(backgroundColor, 30, 40);

      this.createCamera()
      this.createControls()
      this.createLights()

      this.createGrid()

      this.materials = this.createMaterials()
      this.geometries = this.createGeometries()

      this.createMeshes(false)

      this.loadCharacterModel()
      this.createRenderer()

      this.renderer.setAnimationLoop((time) => {
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
      this.controls = new MapControls(this.camera, this.container)
      this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.15
      this.controls.screenSpacePanning = false
      this.controls.minDistance = 4
      this.controls.maxDistance = 50
      this.controls.maxPolarAngle = Math.PI / 2.2
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
      this.characterGroup = new THREE.Group()
      this.characterGroup.name = 'character_group'

      // Hide 90s dad under board (TODO: figure out if he can be loaded without being added)
      this.characterGroup.position.set(0.5, -5, 0.5)

      this.boardGroup.add(this.characterGroup)

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
      let gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x666666)
      // gridHelper.colorGrid = 0x666666;
      gridGroup.add(gridHelper)

      let planeGeometry = new THREE.PlaneBufferGeometry(100, 100)
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

      for (let i = 0; i < this.numberOfInstancedMeshes - 5; i++) {
        let tileColor = new THREE.MeshStandardMaterial({
          color: Math.random() * 0xffffff,
          flatShading: true
        })
        tiles.push(tileColor)
      }

      // checker material
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load('/threejs/textures/checkerboard.jpg')
      console.log('texture', texture)
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
        board
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
    createMeshes (withTiles) {
      // create the train group that will hold all train pieces
      this.boardGroup = new THREE.Group()

      this.scene.add(this.boardGroup)

      // Add checkerboard
      const checkerboard = new THREE.Mesh(this.geometries.board, this.materials.board)
      checkerboard.rotation.x = Math.PI * -0.5
      this.boardGroup.add(checkerboard)

      /** Create Tiles Instanced - Start */
      let count = this.tilesNumber * this.tilesNumber

      // Create all instanced meshes
      for (let i = 0; i < this.numberOfInstancedMeshes; i++) {
        let key = this.getInstancedMeshKeyByIndex(i)
        this.instancedMeshes[key] = {
          mesh: new THREE.InstancedMesh(this.geometries.tiles[i], this.materials.tiles[i], count),
          count: 0
        }
        // console.log(this.instancedMeshes[key].mesh)
        this.instancedMeshes[key].mesh.count = 0
        this.instancedMeshes[key].mesh.frustumCulled = false
        this.instancedMeshes[key].mesh.name = key
        this.instancedMeshes[key].mesh.itemType = 'tile'
      }

      if (withTiles) {
        // Populate all the instance meshes randomly
        let offset = (this.tilesNumber - 1) / 2
        let instancedKeys = Object.keys(this.instancedMeshes)

        for (let x = 0; x < this.tilesNumber; x++) {
          for (let z = 0; z < this.tilesNumber; z++) {
            // set transform based on position
            this.transform.position.set(offset - x, 0.125, offset - z)
            this.transform.updateMatrix()

            // Choose the instanced mesh to add to
            let inst = Math.floor(Math.random() * this.numberOfInstancedMeshes)
            let key = instancedKeys[inst]

            // add the tile
            addTile(this.transform, this.instancedMeshes[key])
          }
        }
      }

      // Add all instancedMeshes to the scene
      for (let i = 0; i < this.numberOfInstancedMeshes; i++) {
        let key = this.getInstancedMeshKeyByIndex(i)
        this.boardGroup.add(this.instancedMeshes[key].mesh)
      }

      // Create and add the selection mesh
      this.selectionHighlighter = new THREE.Mesh(this.geometries.cone, this.materials.tile)

      this.selectionHighlighter.position.set(0, 0.85, 0)
      this.selectionHighlighter.rotation.set(Math.PI, 0, 0)
      this.selectionHighlighter.visible = false

      this.boardGroup.add(this.selectionHighlighter)
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
     * Reset all tiles
     */
    resetAllTiles () {
      console.log('resetting tiles')
      let instancedMeshNamnes = Object.keys(this.instancedMeshes)
      instancedMeshNamnes.forEach(name => {
        let instanceKeys = Object.keys(this.instancedMeshes[name].mesh.userData)
        instanceKeys.forEach(instanceId => {
          if (this.instancedMeshes[name].mesh.userData[instanceId].isActive) {
            tweenActiveTileToggle(this.instancedMeshes[name].mesh, instanceId, false)
          }
        })
      })
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
        if (event.shiftKey || this.tapState === 'delete') {
          // shift key is pressed, "delete"
          deleteTile(name, instanceId, this.instancedMeshes[name].mesh)
        } else if (this.tapState === 'select') {
          this.selectTile(name, instanceId)
        } else if (this.tapState === 'activate') {
          // no shift key, activate
          toggleTileActiveState(name, instanceId, this.instancedMeshes[name].mesh)
        }
      }

      // "unoccupied" board spaces intersections
      if (this.tapState === 'create' && this.creationTileType !== null && !hasHitTile) {
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
      this.onMouseClick(hammerEvent.srcEvent)
    },
    selectTile (name, instanceId) {
      // set selected tile
      this.selectedTile = `${name}-${instanceId}`

      // set selectedTile name in dom
      // this.selectedTileLabel.textContent = this.selectedTile
      // this.selectedTileActions.classList.add('has-selection')

      // get position of selected tile and assign marker to that position
      let positionVec = getTilePosition(name, instanceId, this.instancedMeshes)
      const currentY = this.selectionHighlighter.position.y
      this.selectionHighlighter.position.set(positionVec.x, currentY, positionVec.z)
      this.selectionHighlighter.visible = true
    },
    addModelToSelectedTile () {
      if (this.selectedTile) {
        let v = getSelectedTilePosition(this.selectedTile, this.instancedMeshes)
        v.y = 0.25
        this.characterGroup.position.set(v.x, v.y, v.z)
      } else {
        alert('You must select a tile!')
      }
    },
    addTileByType (type, position) {
      if (this.instancedMeshes.hasOwnProperty(type)) {
        addTile(position, this.instancedMeshes[type])
      } else {
        console.error(`Invalid tile type: '${type}'`)
      }
    },
    toggleControlsVisibility () {
      this.showControls = !this.showControls
    },
    onTapStateChange (event) {
      if (this.tapState !== 'select') {
        this.selectedTile = null
        this.selectionHighlighter.visible = false
      }
    },
    onEditModeChange () {
      // Enable or disable pan based on editor mode
      if (this.editMode === 'quick') {
        setPan(this.controls, false)
        this.hammerContainer.on('pan', this.onHammerPan)
      } else {
        setPan(this.controls, true)
        this.hammerContainer.off('pan', this.onHammerPan)
      }
    },
    onRotateTile () {
      let { name, instanceId } = deconstructTileStringId(this.selectedTile)
      rotateTile(name, instanceId, this.instancedMeshes[name].mesh)
    },
    onPlaceHero () {
      this.addModelToSelectedTile()
    },
    fullscreenMap () {
      this.goFullscreen(document.body)
    },
    goFullscreen (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen()
      }
    },

    getInstancedMeshKeyByIndex (index) {
      return Object.keys(this.instancedMeshes)[index]
    }
  },
  created () {
  },
  destroyed () {
    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('onorientationchange', this.onWindowResize)
    window.removeEventListener('mousemove', this.onDocumentMouseMove, false)
  },
  mounted () {
    // Set everything up
    this.init()
    // TODO: implement these the right way
    // Need to resize on both resize and orientation changes
    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('onorientationchange', this.onWindowResize)
    window.addEventListener('mousemove', this.onDocumentMouseMove, false)

    // EVENTS

    // Add hammertime
    this.hammerContainer = new Hammer.Manager(this.container)
    let Tap = new Hammer.Tap()
    let Pan = new Hammer.Pan()
    this.hammerContainer.add(Tap)
    this.hammerContainer.add(Pan)
    this.hammerContainer.on('tap', (e) => {
      this.onMouseClick(e.srcEvent)
    })
  }
}
</script>

<style lang="scss">
@keyframes pulsebg {
  0% {
    background: #fff;
  }

  100% {
    background: #beb6ce;
  }
}

#scene-container {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

button {
  cursor: pointer;
}

.ui-elements {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  width: 200px;
  border: 2px solid #232323;
  background: white;
  padding: 5px;
  font-size: 14px;
  font-family: Helvetica, sans-serif;
  transform: translateX(180px);
  transition: transform 300ms ease;
}

.ui-elements.show-controls {
  transform: translateX(0);
}

.controls-toggle {
  color: transparent;
  font-size: 0;
  height: 20px;
  width: 20px;
  padding: 0;
  text-align: center;
  border-color: purple;
}

.controls-toggle:before {
  content: '\2190';
  color: purple;
  font-size: 12px;
  line-height: 20px;
}

.ui-elements.show-controls .controls-toggle:before {
  content: '\2192';
}

.control {
  padding: 10px;
  border: 1px solid pink;
}

.control:not(:first-child) {
  margin-top: 10px;
}

.toggle-check-label {
  display: block;
  position: relative;
  font-size: 12px;
}

.toggle-check-label span {
  display: block;
  padding: 4px;
  border: 2px solid purple;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.toggle-check-label input:checked+span {
  animation: pulsebg infinite 0.5s alternate linear;
}

.horizontal-radios {
  display: flex;
}

.horizontal-radios .radio-label {
  display: block;
  position: relative;
  font-size: 12px;
}

.horizontal-radios .radio-label input,
.toggle-check-label input {
  position: absolute;
  left: 5px;
  bottom: 2px;
  font-size: 0;
  z-index: -1;
}

.horizontal-radios .radio-label span {
  display: block;
  background: #fff;
  padding: 2px;
  border: 1px solid purple;
  cursor: pointer;
}

.horizontal-radios .radio-label:not(:first-child) span {
  border-left: none;
}

.horizontal-radios .radio-label input:checked+span {
  background-color: #beb6ce;
}

.list-radios {
  font-size: 12px;
}

.list-radios label {
  display: block;
}

.selected-tile-actions {
  display: none;
}

.selected-tile-actions.has-selection {
  display: block;
}

.creation-tile-type {
  display: none;
}

.creation-tile-type.enabled {
  display: block;
}

.d-pad {
  display: grid;
  width: 80px;
  grid-template-columns: 1fr 1fr 1fr 60px;
  grid-template-rows: 20px 20px;
  grid-column-gap: 4px;
  grid-row-gap: 4px;
}

.d-pad button {
  background: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
  padding: 2px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1;
}

.rotate-hero-right {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}

.rotate-hero-left {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.move-hero-forward {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.move-hero-backward {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.enable-wasd {
  grid-column: 4 / 5;
  grid-row: 1 / 3;
}
</style>
