<template>
  <div :class="['map-tile', tile.walkability ? 'walkable' : 'not-walkable',`row-${tile.position.y}`, `col-${tile.position.x}`]">
    <div>{{ tile.walkability }}, {{ tile.position.x }}, {{ tile.position.y }}</div>
    <div v-if="editable" class="edit-actions">
      <label class="label is-small">
        <input type="checkbox" v-model="tile.walkability">
        <span v-if="tile.walkability">Walkable</span><span v-else>Not Walkable</span>
      </label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tile: {
      default: null,
      required: true,
      type: Object
    },
    editable: {
      default: false,
      type: Boolean
    }
  }
}
</script>

<style lang="scss" scoped>
.map-tile {
  --tile-top: 0;
  --tile-left: 0;
  top: var(--tile-top);
  left: var(--tile-left);
  height: 100px;
  width: 100px;
  border: 2px solid $info;
}
.walkable {
  background-color: #ddd;
}
.not-walkable {
  background-color: #444;
  color: $white;
  .label {
    color: $white;
  }
}
</style>
