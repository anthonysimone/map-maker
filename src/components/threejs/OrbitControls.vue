<script>
import { string } from 'vue-gl/src/validators.js'
import OrbitControls from 'three-orbitcontrols'

export default {
  inject: ['vglNamespace'],
  props: {
    camera: string
  },
  computed: {
    cmr () {
      return this.vglNamespace.cameras[this.camera]
    }
  },
  watch: {
    cmr: {
      handler (cmr) {
        const domElement = this.vglNamespace.renderers[0].inst.domElement
        const controls = new OrbitControls(cmr, domElement)
        controls.addEventListener('change', () => this.vglNamespace.update())
      },
      immediate: true
    }
  },
  render (h) {
    return h('div')
  }
}
</script>
