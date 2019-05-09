<template>
  <div class="map card">
    <div class="card-content">
      <h3>{{ map.name }}</h3>
      <p>{{ map.id }}</p>
      <div class="action-buttons">
        <router-link class="button is-primary is-small" :to="{name: 'map-detail', params: {id: map.id}}">View</router-link>
        <confirmation-modal classes="delete"
          @confirmationSuccess="deleteMap(map.id)"
          dialog-title="Warning!"
          :dialog-body="dialogWarningBody"
        >Delete</confirmation-modal>
      </div>
    </div>
  </div>
</template>

<script>
import ConfirmationModal from '@/components/elements/functional/ConfirmationModal.vue'

export default {
  components: {
    ConfirmationModal
  },
  props: {
    map: { required: true, type: Object }
  },
  computed: {
    dialogWarningBody () {
      return `You are about to delete the map called "${this.map.name}" and all of its data. This is <em>permanent</em> and you cannot undo this action! &#x1f62e; Do you want to continue?`
    }
  },
  methods: {
    deleteMap (id) {
      this.$store.dispatch('map/deleteMap', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
