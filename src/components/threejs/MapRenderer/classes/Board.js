import * as THREE from 'three'

import { Cell } from './Cell'

// Helper vars
const initialTileOffsetVector = new THREE.Vector3(0.5, 0.125, 0.5)

export class Board {
  constructor (q, s) {
    this.q = q // like x
    this.s = s // like z

    // build tiles
    this.tiles = this.initializeTiles()

    // build edges from tiles
    this.edges = this.generateEdges()
  }

  /**********
   * HELPERS
   *********/

  /**
   * Convert any point on the board object to the offset position value for that tile.
   */
  pointToNormalizedOffset (point) {
    point.floor()
    point.y = 0
    point.add(initialTileOffsetVector)
    return point
  }

  /**
   * Convert any point to the q/s coords.
   */
  pointToCoords (point) {
    point.floor()
    return { q: point.x, s: point.z }
  }

  /**
   * Convert any point on the board object to the row/column index of the grid tile
   * it is contained in.
   */
  pointToRowCol (point) {
    const coords = this.pointToCoords(point)
    return this.boardCoordsToRowCol(coords)
  }

  /**
   * Convert q/s board coords to base 0 row/column array index.
   */
  boardCoordsToRowCol ({ q, s }) {
    const rowIndex = s + this.s / 2
    const colIndex = q + this.q / 2
    return { rowIndex, colIndex }
  }

  /**
   * Get a cell by coords.
   *
   * Returns undefined if no cell exists at given coords.
   */
  getCellByCoords (qPos, sPos) {
    const { rowIndex, colIndex } = this.boardCoordsToRowCol({ q: qPos, s: sPos })
    return this.tiles[rowIndex] && this.tiles[rowIndex][colIndex]
  }

  getAnchorCell (qPos, sPos) {
    const cell = this.getCellByCoords(qPos, sPos)
    return cell.isAnchor ? cell : this.getCellByCoords(cell.anchorRef.q, cell.anchorRef.s)
  }

  /**
   * Get a cell by point.
   */
  getCellByPoint (point) {
    const coords = this.pointToCoords(point)
    return this.getCellByCoords(coords.q, coords.s)
  }

  /**
   * Get tile position based on the board coords and tile size
   */
  getTilePositionFromBoardCoords (qPos, sPos, tileSize) {
    const { qLength, sLength } = tileSize
    return { x: qPos + qLength / 2, z: sPos + sLength / 2 }
  }

  /**
   * Get tile position based on the board coords and tile size
   */
  getCharacterPositionFromBoardCoords (qPos, sPos, tileSize) {
    const { qLength, sLength } = tileSize
    return { x: qPos + qLength / 2, z: sPos + sLength / 2 }
  }

  /**
   * Get anchor coords from tile position
   */
  getAnchorCoordsFromTilePosition (pos, tileSize) {
    const { qLength, sLength } = tileSize
    return { q: pos.x - qLength / 2, s: pos.z - sLength / 2 }
  }

  /**
   * Get anchor coords from tile position
   */
  getAnchorCoordsFromCharacterPosition (pos, characterSize) {
    const { qLength, sLength } = characterSize
    return { q: pos.x - qLength / 2, s: pos.z - sLength / 2 }
  }

  /**********
   *
   *
   *
   * METHODS
   *
   *
   *
   *********/

  /**
   * Initialize tiles
   */
  initializeTiles () {
    let tiles = []
    const qHalf = Math.ceil(this.q / 2) // widtht
    const sHalf = Math.ceil(this.s / 2) // height

    for (let j = -sHalf; j < sHalf; j++) {
      let tileRow = []
      for (let i = -qHalf; i < qHalf; i++) {
        // TODO: randomly generating walkabilitty for tetsting at the moment
        const walkable = Math.floor(Math.random() * 10) < 2
        const cell = new Cell(i, j, walkable, false)
        tileRow.push(cell)
      }

      tiles.push(tileRow)
    }

    return tiles
  }

  /**
   * Generate walkable edges
   */
  generateEdges () {
    return this.tiles.map(row => row.map(cell => cell.walkable ? 1 : 0))
  }

  updateEdges () {
    this.edges = this.generateEdges()
  }

  /**
   * Set occupied for board tile
   */
  setBoardTile (qPos, sPos, size) {
    const { qLength, sLength } = size
    for (let s = sPos; s < sPos + sLength; s++) {
      for (let q = qPos; q < qPos + qLength; q++) {
        const cell = this.getCellByCoords(q, s)
        const anchor = (qPos === q && sPos === s) ? null : { q: qPos, s: sPos }
        cell.setHasTile(anchor)

      }
    }
  }

  /**
   * Set unoccupied for board tile
   */
  unsetBoardTile (qPos, sPos, size) {
    const { qLength, sLength } = size
    for (let s = sPos; s < sPos + sLength; s++) {
      for (let q = qPos; q < qPos + qLength; q++) {
        const cell = this.getCellByCoords(q, s)
        cell.unsetHasTile()
      }
    }
  }

  /**
   * Check to see if a cell can place a tile of a given size.
   */
  canPlaceTile (qPos, sPos, tileSize) {
    const { qLength, sLength } = tileSize

    for (let s = sPos; s < sPos + sLength; s++) {
      for (let q = qPos; q < qPos + qLength; q++) {
        const cell = this.getCellByCoords(q, s)
        if (cell === undefined || cell.hasTile) {
          return false
        }
      }
    }

    return true
  }
}
