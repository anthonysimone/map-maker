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
   * Convert any point to the q/s position.
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
    return this.boardPositionToRowCol(coords)
  }

  /**
   * Convert q/s board position to base 0 row/column array index.
   */
  boardPositionToRowCol ({ q, s }) {
    const rowIndex = s + this.s / 2
    const colIndex = q + this.q / 2
    return { rowIndex, colIndex }
  }

  /**
   * Get a cell by position.
   *
   * Returns undefined if no cell exists at given position.
   */
  getCellByPosition (qPos, sPos) {
    const { rowIndex, colIndex } = this.boardPositionToRowCol({ q: qPos, s: sPos })
    return this.tiles[rowIndex] && this.tiles[rowIndex][colIndex]
  }

  /**
   * Get a cell by point.
   */
  getCellByPoint (point) {
    const coords = this.pointToCoords(point)
    return this.getCellByPosition(coords.q, coords.s)
  }

  /**********
   * METHODS
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

  /**
   * Set occupied for board tile
   */
  setBoardTile (qPos, sPos) {
    const { rowIndex, colIndex } = this.boardPositionToRowCol({ q: qPos, s: sPos })
    this.tiles[rowIndex][colIndex].hasTile = true
  }

  /**
   * Set unoccupied for board tile
   */
  unsetBoardTile (qPos, sPos) {
    const { rowIndex, colIndex } = this.boardPositionToRowCol({ q: qPos, s: sPos })
    this.tiles[rowIndex][colIndex].hasTile = false
  }

  /**
   * Check to see if a cell can place a tile of a given size.
   */
  canPlaceTile (qPos, sPos, tileSize) {
    // const { rowIndex, colIndex } = this.boardPositionToRowCol({ q: cell.q, s: cell.s })
    const { qLength, sLength } = tileSize

    // for (let s = cell.s; s < cell.s + sLength; s++) {
    //   for (let q = cell.q; q < cell.q + qLength; q++) {
    //     const cell = this.getCellByPosition(q, s)
    //     if (cell === undefined || cell.hasTile) {
    //       return false
    //     }
    //   }
    // }

    for (let s = sPos; s < sPos + sLength; s++) {
      for (let q = qPos; q < qPos + qLength; q++) {
        const cell = this.getCellByPosition(q, s)
        if (cell === undefined || cell.hasTile) {
          return false
        }
      }
    }

    return true
  }
}
