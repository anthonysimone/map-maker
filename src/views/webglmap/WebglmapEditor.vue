<template>
  <div class="map-editor">
    <div class="editor-toolbar">
      <h1>Edit: {{ editableMapData.name }}</h1>
      <router-link class="button is-primary is-small edit-map" :to="{name: 'dashboard'}">Dashboard</router-link>
    </div>
    <threejs-map-renderer :map="map"></threejs-map-renderer>
    <div class="editor-panel-container" :class="{'is-active': showEditorPanel }">
      <button class="side-panel-toggle" @click="toggleEditorPanel">Toggle Controls</button>
      <editor-side-panel @saveMap="saveMap"></editor-side-panel>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ThreejsMapRenderer from '@/components/threejs/MapRenderer/ThreejsMapRenderer'
import EditorSidePanel from '@/components/map/editor/EditorSidePanel'

export default {
  name: 'map-editor',
  components: {
    ThreejsMapRenderer,
    EditorSidePanel
  },
  data () {
    return {
      id: this.$route.params.id,
      editableMapData: null,

      // Editor side panel related state
      showEditorPanel: false
    }
  },
  computed: {
    ...mapGetters('map', ['mapById']),
    map () {
      return this.mapById(this.id)
    }
  },
  methods: {
    saveMap ({ tilesJson }) {
      this.editableMapData.threejsTiles = tilesJson

      // Save map: Update action
      this.$store.dispatch('map/updateMap', {
        id: this.id,
        dataToUpdate: this.editableMapData
      })
    },
    setEditableMapData () {
      this.editableMapData = JSON.parse(JSON.stringify(this.map))
    },
    toggleEditorPanel () {
      this.showEditorPanel = !this.showEditorPanel
    }
  },
  created () {
    this.setEditableMapData()
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
.map-editor {
  flex: 1;
}

.editor-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(#ffffff, 0.9);
  z-index: 10;
}

.side-panel-toggle {
  color: transparent;
  font-size: 0;
  height: 20px;
  width: 20px;
  padding: 0;
  text-align: center;
  border-color: purple;
  &:before {
    content: '\2190';
    color: purple;
    font-size: 12px;
    line-height: 20px;

    .editor-panel-container.is-active & {
      content: '\2192';
    }
  }
}

.editor-panel-container {
  position: absolute;
  z-index: 20;
  top: 0;
  right: 0;
  width: 200px;
  border: 2px solid #232323;
  background: white;
  padding: 5px;
  font-size: 14px;
  font-family: Helvetica, sans-serif;
  transform: translateX(170px);
  transition: transform 300ms ease;

  &.is-active {
    transform: translateX(0);
  }
}
</style>
