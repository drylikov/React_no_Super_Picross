import {parsePuzzle} from './Puzzle'

import expect from 'expect'

const EMPTY = `
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
- - - - - - - - - -
`

const WEIGHTLIFTER = `
X X - - - - - - - - - - - X X
X X - - - - - - - - - - - X X
X X X X X X X X X X X X X X X
X X - X - - - - - - - X - X X
X X - X - - X X X - - X - X X
- - - X X - X - X - X X - - -
- - - - X X X - X X X - - - -
- - - - X X X X X X X - - - -
- - - - - X X X X X - - - - -
- - - - - X X X X X - - - - -
- - - - - - X X X - - - - - -
- - - - - X X X X X - - - - -
- - - - - X X - X X - - - - -
- - - - - X - - - X - - - - -
- - - - X X - - - X X - - - -
`

describe('parsePuzzle', () => {
  it('parses an ASCII puzzle', () => {
    expect(parsePuzzle(EMPTY)).toEqual({
      height: 10,
      width: 10,
      rowClues: [[0], [0], [0], [0], [0], [0], [0], [0], [0], [0]],
      colClues: [[0], [0], [0], [0], [0], [0], [0], [0], [0], [0]],
      solution: {},
    })

    expect(parsePuzzle(WEIGHTLIFTER)).toEqual({
      height: 15,
      width: 15,
      colClues: [
        [5],
        [5],
        [1],
        [4],
        [1, 3, 1],
        [1, 4, 4],
        [1, 9],
        [1, 1, 5],
        [1, 9],
        [1, 4, 4],
        [1, 3, 1],
        [4],
        [1],
        [5],
        [5],
      ],
      rowClues: [
        [2, 2],
        [2, 2],
        [15],
        [2, 1, 1, 2],
        [2, 1, 3, 1, 2],
        [2, 1, 1, 2],
        [3, 3],
        [7],
        [5],
        [5],
        [3],
        [5],
        [2, 2],
        [1, 1],
        [2, 2],
      ],
      solution: [
        '0x0', '0x1', '0x13', '0x14',
        '1x0', '1x1', '1x13', '1x14',
        '2x0', '2x1', '2x2', '2x3', '2x4', '2x5', '2x6', '2x7', '2x8', '2x9', '2x10', '2x11', '2x12', '2x13', '2x14',
        '3x0', '3x1', '3x3', '3x11', '3x13', '3x14',
        '4x0', '4x1', '4x3', '4x6', '4x7', '4x8', '4x11', '4x13', '4x14',
        '5x3', '5x4', '5x6', '5x8', '5x10', '5x11',
        '6x4', '6x5', '6x6', '6x8', '6x9', '6x10',
        '7x4', '7x5', '7x6', '7x7', '7x8', '7x9', '7x10',
        '8x5', '8x6', '8x7', '8x8', '8x9',
        '9x5', '9x6', '9x7', '9x8', '9x9',
        '10x6', '10x7', '10x8',
        '11x5', '11x6', '11x7', '11x8', '11x9',
        '12x5', '12x6', '12x8', '12x9',
        '13x5', '13x9',
        '14x4', '14x5', '14x9', '14x10',
      ].reduce((result, coord) => (result[coord] = true, result), {})
    })
  })
})
