<template>
  <div class="webglmap-container">
    <vgl-renderer ref="threeRenderer" class="vgl-map-canvas" :antialias="true">
      <vgl-scene name="scene">
        <!-- Textures -->
        <vgl-texture name="checkerboard" ref="checkerboard"
          src="/threejs/small-checkerboard.png"
          encoding="linear"
          :repeat="`${map.tilesWidth / 2 + 2}, ${map.tilesLength / 2 + 2}`"
          anisotropy="16"
          wrap-s="repeat"
          wrap-t="repeat"
          mag-filter="nearest"
        ></vgl-texture>

        <!-- Material -->
        <vgl-mesh-standard-material name="board" map="checkerboard" side="double"></vgl-mesh-standard-material>
        <vgl-mesh-standard-material name="tile1" color="red"></vgl-mesh-standard-material>
        <vgl-mesh-standard-material name="tile2" color="green"></vgl-mesh-standard-material>
        <vgl-mesh-standard-material name="tile3" color="blue"></vgl-mesh-standard-material>
        <vgl-mesh-standard-material name="tile4" color="yellow"></vgl-mesh-standard-material>
        <vgl-mesh-standard-material name="tile5" color="purple"></vgl-mesh-standard-material>
        <vgl-mesh-standard-material name="std"></vgl-mesh-standard-material>

        <!-- Geometries -->
        <vgl-plane-geometry name="plane" :width="map.tilesWidth + 4" :height="map.tilesLength + 4"></vgl-plane-geometry>
        <vgl-box-geometry name="tile" width="1" height="1" depth="0.25"></vgl-box-geometry>

        <!-- Meshes -->
        <vgl-group :rotation="`${Math.PI * -0.5}, 0, 0`">
          <vgl-mesh geometry="plane" material="board"></vgl-mesh>
          <template v-for="x in map.tilesWidth">
            <vgl-mesh v-for="y in map.tilesLength" :key="`${x}-${y}`"
              geometry="tile"
              :material="`tile${Math.floor(Math.random() * 5) + 1}`"
              :position="`${x - map.tilesWidth / 2 - 0.5}, ${y - map.tilesLength / 2 - 0.5}, 0.126`"
            ></vgl-mesh>
          </template>
        </vgl-group>

        <!-- Tiles -->

        <!-- Lights -->
        <vgl-hemisphere-light color="#ddeeff" ground="#202020" intensity="5"></vgl-hemisphere-light>
        <vgl-directional-light color="#ffffff" intensity="5" position="10 10 10"></vgl-directional-light>

        <!-- Camera -->
        <vgl-perspective-camera name="myCamera" ref="threeCamera" orbit-position="20 0 0" fov="60" near="0.1" far="60"></vgl-perspective-camera>
        <orbit-controls camera="myCamera"></orbit-controls>
      </vgl-scene>
    </vgl-renderer>
  </div>
</template>

<script>
import * as THREE from 'three'
import OrbitControls from '@/components/threejs/OrbitControls.vue'

export default {
  name: 'display-webglmap',
  components: {
    OrbitControls
  },
  props: {
    map: {
      default: null,
      required: true,
      type: Object
    },
    editable: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      initialTileWidth: null,
      initialTileLength: null,
      centeredTop: null,
      centeredLeft: null,
      isDragging: false,
      animationDone: false,
      // threejs objects
      controls: null
    }
  },
  computed: {
    tilesAsArray () {
      let tiles = this.map.tiles
      let startCoords = this.map.startCoords
      let length = this.map.tilesLength
      let width = this.map.tilesWidth

      let rows = []
      for (let l = startCoords.y; l < (startCoords.y + length); l++) {
        let row = { position: l, tiles: [] }
        for (let w = startCoords.x; w < (startCoords.x + width); w++) {
          row.tiles.push(tiles[l][w])
        }
        rows.push(row)
      }

      console.log('tiles as array!', rows)

      return rows
    },
    initialTileWidthValue () {
      console.log('test', this.initialTileWidth)
      return (this.initialTileWidth * 100) + 'px'
    },
    initialTileLengthValue () {
      return (this.initialTileLength * 100) + 'px'
    },
    tilesAsSingleArray () {
      let tiles = this.map.tiles
      let startCoords = this.map.startCoords
      let length = this.map.tilesLength
      let width = this.map.tilesWidth

      let tilesArray = []
      for (let l = startCoords.y; l < (startCoords.y + length); l++) {
        for (let w = startCoords.x; w < (startCoords.x + width); w++) {
          tilesArray.push(tiles[l][w])
        }
      }

      return tilesArray
    },
    tilesWidthOffsetStart () {
      return this.map.tilesWidth / -2
    },
    tilesWidthOffsetEnd () {
      return this.map.tilesWidth / 2
    },
    tilesLengthOffsetStart () {
      return this.map.tilesLength / -2
    },
    tilesLengthOffsetEnd () {
      return this.map.tilesLength / 2
    }
  },
  methods: {
    tileTop (yOffset) {
      return ((yOffset - this.initialStartCoords.y) * 100) + 'px'
    },
    tileLeft (xOffset) {
      return ((xOffset - this.initialStartCoords.x) * 100) + 'px'
    },
    getRandomColor () {
      return '#' + (Math.random().toString(16) + "000000").slice(2, 8)
    }
  },
  created () {
    this.initialTileLength = this.map.tilesLength
    this.initialTileWidth = this.map.tilesWidth
    this.initialStartCoords = this.map.startCoords
  },
  mounted () {
    // const texture = this.$refs.checkerboard.inst
    // const camera = this.$refs.threeCamera.inst
  }
}
</script>

<style lang="scss">
.vgl-map-canvas {
  height: 100vh;
  width: 100vw;
}
</style>
