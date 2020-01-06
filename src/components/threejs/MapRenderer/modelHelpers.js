// Reusable onLoad function
export const onModelLoad = (gltf, modelGroup, modelMatrix) => {
  const model = gltf.scene.children[0]
  model.applyMatrix(modelMatrix)

  // let box = new THREE.BoxHelper(model, 0xffff00);

  modelGroup.add(model)
  // modelGroup.add(box);
}

// the loader will report the loading progress to this function
export const onModelProgress = () => {}

// the loader will send any error messages to this function, and we'll log
// them to to console
export const onModelError = errorMessage => {
  console.log(errorMessage)
}
