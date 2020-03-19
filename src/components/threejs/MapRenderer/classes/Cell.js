/**
 * Class to handle each individual cell on a board grid.
 */
export class Cell {
  constructor (q, s, walkable, hasTile) {
    this.q = q // like x
    this.s = s // like z
    this.walkable = walkable // if the cell is walkable
    this.hasTile = hasTile // if the cell is occupied with a tile (regardless if it is the anchor cell)
    this.anchorRef = null
    this.isAnchor = null
  }

  setHasTile (anchorRef) {
    this.hasTile = true
    this.isAnchor = !anchorRef

    if (anchorRef) {
      this.anchorRef = anchorRef
    }
  }

  unsetHasTile () {
    this.hasTile = false
    this.anchorRef = null
    this.isAnchor = null
  }
}
