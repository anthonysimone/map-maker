<template>
  <div class="display-map">
    <div :style="{'--column-number': map.tilesWidth, '--row-number': map.tilesLength}">
      <transition-group class="map-wrapper" name="tile-row" tag="div" :duration="1000">
      <transition-group v-for="row in this.tilesAsArray" class="tile-row" :key="row.position" name="tile" tag="div">
        <map-tile v-for="tile in row.tiles" :key="tile.position.x"
          :editable="editable"
          :tile="tile"
        ></map-tile>
      </transition-group>
      </transition-group>
    </div>
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
      scale: 1
    }
  },
  computed: {
    tilesAsArray () {
      let tiles = this.map.tiles
      let startCoords = this.map.startCoords
      let length = this.map.tilesLength
      let width = this.map.tilesWidth

      console.log('passed map object', this.map)

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
    }
    // tilesWidth () {
    //   return this.map.tilesWidth
    // },
    // tilesLength () {
    //   return this.map.tilesLength
    // }
  },
  created () {
  },
  mounted () {
  }
}
</script>

<style lang="scss">
.display-map {
  position: absolute;
  top: var(--y-offset);
  left: var(--x-offset);
  // transform: translate3d(-50%, -50%, 0) translate3d(var(--x-offset), var(--y-offset), 0) scale(var(--scale));
  // transform: translate3d(var(--x-offset), var(--y-offset), 0) scale(var(--scale));
}
.map-wrapper {
  --column-number: 0;
  --row-number: 0;
  display: inline-block;
  // display: grid;
  // grid-template-columns: repeat(var(--column-number), 100px);
  // grid-template-rows: repeat(var(--row-number), 100px);
  // grid-gap: 2px;
  // border: 2px solid $warning;
}
.tile-row {
  & > div {
    // float: left;
  }
  display: flex;
}

// Row enter/leave transitions
.tile-row-enter-active, .tile-row-leave-active {
  .map-tile {
    transition: opacity 1s, transform 1s;
  }
}
.tile-row-enter .map-tile {
  opacity: 0;
  transform: translateY(-40px) rotate(360deg);
}
.tile-row-leave-to .map-tile {
  opacity: 0;
  transform: scaleX(0) scaleY(0);
}

// Tile enter/leave transitions
.tile-enter-active, .tile-leave-active {
  transition: opacity 1s, transform 1s;
}
.tile-enter {
  opacity: 0;
  transform: translateY(-40px) rotate(360deg);
}
.tile-leave-to {
  opacity: 0;
  transform: scaleX(0) scaleY(0);
}
</style>
