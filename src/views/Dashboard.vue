<template>
  <div class="dashboard">
    <page-header pageTitle="Dashboard" subTitle="Find all your stuff!"></page-header>
    <div class="container page-container">
      <section class="section">
        <ul v-if="mapsByUser.length" class="maps">
          <li v-for="map in mapsByUser"  :key="map.id" class="map-item">
            <map-teaser :map="map"></map-teaser>
          </li>
        </ul>
      </section>
    </div>

    <form @submit.prevent="addMap">
      <label>Map Name
        <input type="text" v-model="newMap.name">
      </label>
      <button>Add Map!</button>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import PageHeader from '@/components/elements/layout/PageHeader.vue'
import MapTeaser from '@/components/map/MapTeaser.vue'

export default {
  name: 'dashboard',
  components: {
    PageHeader,
    MapTeaser
  },
  data () {
    return {
      newItem: '',
      newMap: {
        name: '',
        createdBy: ''
      }
    }
  },
  computed: {
    ...mapState('map', ['mapsByUser']),
    ...mapState('user', ['userProfile'])
    // ...mapState('todo', ['todos'])
  },
  methods: {
    addItem () {
      this.$store.dispatch('item/addItem', this.newItem)
    },
    deleteItem (index) {
      this.$store.dispatch('item/deleteItem', index)
    },
    addMap () {
      this.$store.dispatch('map/addMap', Object.assign({}, this.newMap))
      this.newMap.name = ''
    },
    deleteMap (id) {
      this.$store.dispatch('map/deleteMap', id)
    }
  },
  mounted () {
    // On mount, add the created by key for current user
    this.newMap.createdBy = this.userProfile.id
  },
  created () {
    // this.$store.dispatch('todo/bindTodos', db.collection('todos'))
  }
}
</script>

<style lang="scss" scoped>
.maps {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-gap: 10px;
}
</style>
