<template>
  <div class="display-map" :style="{'height': initialTileLengthValue, 'width': initialTileWidthValue}">
    <transition-group class="tiles-wrapper" name="new-tile" tag="div" :style="{'height': initialTileLengthValue, 'width': initialTileWidthValue}">
      <map-tile v-for="tile in this.tilesAsSingleArray"
        :key="tile.position.x + ',' + tile.position.y"
        :editable="editable"
        :tile="tile"
        :style="{'position': 'absolute', '--tile-top': tileTop(tile.position.y), '--tile-left': tileLeft(tile.position.x)}"
      ></map-tile>
    </transition-group>
  </div>
</template>

<script>
import MapTile from '@/components/map/tile/MapTile.vue'

export default {
  name: 'display-map',
  components: {
    MapTile
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
      centeredLeft: null
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
    }
  },
  methods: {
    tileTop (yOffset) {
      return ((yOffset - this.initialStartCoords.y) * 100) + 'px'
    },
    tileLeft (xOffset) {
      return ((xOffset - this.initialStartCoords.x) * 100) + 'px'
    }
  },
  created () {
    this.initialTileLength = this.map.tilesLength
    this.initialTileWidth = this.map.tilesWidth
    this.initialStartCoords = this.map.startCoords
  }
}
</script>

<style lang="scss">
.display-map {
  position: absolute;
  top: var(--y-offset);
  left: var(--x-offset);
  perspective: 600px;
}

.tiles-wrapper {
  position: absolute;
  transform: scale(var(--scale)) rotateX(var(--rotate-x)) translateZ(var(--translate-z));
  transition: transform 600ms ease;
}

// Tile enter/leave transitions
.new-tile-enter-active {
  transition: opacity 1s, transform 1s;
}
.new-tile-leave-active {
  transition: opacity 500ms, transform 500ms;
}
.new-tile-enter {
  opacity: 0;
  transform: translateY(-40px) rotate(360deg);
}
.new-tile-leave-to {
  opacity: 0;
  transform: scaleX(0.5) scaleY(0.5);
  @for $i from 1 to 7 {
    &:nth-child(5n + #{$i}) {
      transition-delay: 70ms * $i;
    }
  }
}
</style>
