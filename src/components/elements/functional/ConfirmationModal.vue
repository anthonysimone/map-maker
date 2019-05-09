<template>
  <button :class="classes" @click="openModal">
    <slot>Clear Data</slot>
  </button>
</template>

<script>
export default {
  props: {
    dialogTitle: {
      type: String
    },
    dialogBody: {
      dialogBody: String,
      required: true
    },
    acceptText: {
      type: String,
      default: 'Yes'
    },
    rejectText: {
      type: String,
      default: 'No'
    },
    rejectDefault: {
      type: Boolean,
      default: true
    },
    successEventName: {
      type: String,
      default: 'confirmationSuccess'
    },
    classes: {
      type: String,
      default: 'button is-primary is-inverted'
    }
  },

  methods: {
    openModal () {
      this.$modal.show('dialog', {
        title: this.dialogTitle,
        text: this.dialogBody,
        buttons: [
          {
            title: this.acceptText,
            handler: () => {
              this.$emit(this.successEventName)
              this.$modal.hide('dialog')
            },
            default: !this.rejectDefault
          },
          {
            title: this.rejectText,
            default: this.rejectDefault // Will be triggered by default if 'Enter' pressed.
          }
        ]
      })
    },
    opened () {
      console.log('modal opened')
    }
  }
}
</script>

<style lang="scss">
.v--modal-overlay {
  // color: $body-font-color;
}
.vue-dialog-buttons {
  button:first-child {
    color: $white;
    background-color: rgba($danger, 0.8);
    &:hover {
      background-color: rgba($danger, 1);
    }
  }
}
</style>
