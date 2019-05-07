<template>
  <div class="dashboard">
    <h1>This the dashboard page.</h1>
    <ul class="items">
      <li v-for="(item, index) in items" :key="index">
        {{ item }} <button @click="deleteItem(index)">x</button>
      </li>
    </ul>
    <div>
      <form @submit.prevent="addItem">
        <label>New Item
          <input type="text" v-model="newItem">
        </label>
        <button>Add Item</button>
      </form>
    </div>
    <div class="my-maps">
      <ul v-if="mapsByUser.length" class="maps">
        <li v-for="map in mapsByUser"  :key="map.id" class="map">
          {{ map.name }} | {{ map.id }} <button @click="deleteMap(map.id)">X</button>
        </li>
      </ul>
      <div v-else>You have no maps!</div>
      <form @submit.prevent="addMap">
        <label>Map Name
          <input type="text" v-model="newMap.name">
        </label>
        <button>Add Map!</button>
      </form>
    </div>
    <div class="my-todos">
      <ul v-if="todos.length" class="todos">
        <li v-for="todo in todos" :key="todo.id" class="todo">
          {{ todo.name }} | {{ todo.id }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '@/firebase/firestore/index'

export default {
  name: 'dashboard',
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
    ...mapState('item', ['items']),
    ...mapState('map', ['mapsByUser']),
    ...mapState('user', ['userProfile']),
    ...mapState('todo', ['todos'])
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
    this.$store.dispatch('todo/bindTodos', db.collection('todos'))
  }
}
</script>
