<template>
  <div class="display-map">
    <div class="map-wrapper" :style="{'--column-number': map.tilesWidth, '--row-number': map.tilesLength}">
      <template v-for="(row, rowIndex) in this.map.tiles">
        <div v-for="(tile, colIndex) in row" :key="`${colIndex},${rowIndex}`"
          :class="['tile', tile.walkability ? 'walkable' : 'not-walkable',`row-${rowIndex}`, `col-${colIndex}`]">
          {{ tile.walkability }}, {{ tile.position.x }}, {{ tile.position.y }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  name: 'display-map',
  data () {
    return {

    }
  },
  props: {
    map: {
      default: null,
      required: true,
      type: Object
    }
  }

}
</script>

<style lang="scss" scoped>
.map-wrapper {
  --column-number: 0;
  --row-number: 0;
  display: grid;
  grid-template-columns: repeat(var(--column-number), 100px);
  grid-template-rows: repeat(var(--row-number), 100px);
  grid-gap: 2px;
  border: 2px solid $warning;
}
.tile {
  border: 2px solid $info;
}
</style>
