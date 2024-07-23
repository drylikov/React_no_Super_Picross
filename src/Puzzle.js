import './Puzzle.css'

import React, {PropTypes as t} from 'react'

export function pad(n) {
  return `${n < 10 ? '0' : ''}${n}`
}

export function formatTime(seconds) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`
}

export function checkCompletion(etched, solution) {
  return Object.keys(solution).every(coord => etched[coord])
}

export function parsePuzzle(puzzle) {
  let rows = puzzle.trim().replace(/ /g, '').split(/\n/g)
  let colCount = rows[0].length
  let colClues = new Array(colCount)
  let rowClues = new Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    rowClues[i] = [0]
  }
  for (let i = 0; i < colCount; i++) {
    colClues[i] = [0]
  }
  let solution = {}
  for (let row = rows.length - 1; row >= 0; row--) {
    for (let col = colCount - 1; col >= 0; col--) {
      switch (rows[row].charAt(col)) {
        case '-':
          if (colClues[col][0] !== 0) {
            colClues[col].unshift(0)
          }
          if (rowClues[row][0] !== 0) {
            rowClues[row].unshift(0)
          }
          break
        case 'X':
          colClues[col][0]++
          rowClues[row][0]++
          solution[`${row}x${col}`] = true
          break
      }
      if (col === 0) {
        // We've reached the start of the row - remove any hanging zero
        if (rowClues[row].length > 1 && rowClues[row][0] === 0) {
          rowClues[row].shift()
        }
      }
      if (row === 0) {
        // We've reached the start of the column - remove any hanging zero
        if (colClues[col].length > 1 && colClues[col][0] === 0) {
          colClues[col].shift()
        }
      }
    }
  }

  return {height: rows.length, width: colCount, colClues, rowClues, solution}
}

let Puzzle = React.createClass({
  propTypes: {
    // The name the puzzle is represented by
    name: t.string,
    // An ASCII representation of the puzzle using '-'' for empty squares and 'X'
    // for filled squares, which may also contain spaces.
    puzzle: t.string,
  },
  getInitialState() {
    return {
      completed: false,
      failed: false,
      // Coords which have been successfully etched
      etched: {},
      // Coords which have been marked as empty
      marked: {},
      // Time remaining (in seconds) to complete the puzzle
      time: 30 * 60,
      // Penalty (in minutes) for attempting an incorrect etch
      penalty: 2,
      // Current X coord
      x: 0,
      // Current Y coord
      y: 0,
    }
  },
  componentWillMount() {
    let {width, height, colClues, rowClues, solution} = parsePuzzle(this.props.puzzle)
    this.width = width
    this.height = height
    this.colClues = colClues
    this.rowClues = rowClues
    this.solution = solution
  },
  componentDidMount() {
    this.startTimer()
  },
  componentWillUnmount() {
    this.stopTimer()
  },

  startTimer () {
    if (!this.timerInterval) {
      this.timerInterval = window.setInterval(this.tick, 1000)
    }
  },
  stopTimer() {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },
  tick() {
    this.setState(({time}) => {
      let nextTime = Math.max(0, time - 1)
      if (nextTime === 0) {
        this.stopTimer()
      }
      return {
        time: nextTime,
        failed: nextTime === 0,
      }
    })
  },

  /**
   * Create a state change object for cleaning the given coord if it's etched or
   * marked.
   */
  _clean(coord) {
    if (this.state.etched[coord]) {
      return {etched: {...this.state.etched, [coord]: false}}
    }
    if (this.state.marked[coord]) {
      return {marked: {...this.state.marked, [coord]: false}}
    }
  },
  /**
   * Create a state change object for an etch at the given coords.
   */
  _etch(coord) {
    // Successful un-etch (why?)
    if (this.state.etched[coord]) {
      return {
        etched: {...this.state.etched, [coord]: false},
        action: 'clean'
      }
    }
    // Successful etch
    else if (this.solution[coord]) {
      let etched = {...this.state.etched, [coord]: true}
      let completed = checkCompletion(etched, this.solution)
      if (completed) {
        this.stopTimer()
      }
      return {
        etched,
        completed,
        marked: {...this.state.marked, [coord]: false},
        action: 'etch',
      }
    }
    // Unsuccessful etch
    else {
      return {
        marked: {...this.state.marked, [coord]: true},
        penalty: Math.min(8, this.state.penalty * 2),
        time: Math.max(0, this.state.time - (this.state.penalty * 60)),
        action: 'etch',
      }
    }
  },
  /**
   * Create a state change object for a mark at the given coords.
   */
  _mark(coord) {
    // Un-mark
    if (this.state.marked[coord]) {
      return {
        marked: {...this.state.marked, [coord]: false},
        action: 'clean',
      }
    }
    // Mark
    else {
      return {
        marked: {...this.state.marked, [coord]: true},
        etched: {...this.state.etched, [coord]: false},
        action: 'mark',
      }
    }
  },
  /**
   * Perform a move, also performing an appropriate action if a button is held
   * down.
   */
  _move(x, y) {
    let coord = `${y}x${x}`
    let stateChange = {x, y}
    if (this.ctrlDown || this.shiftDown) {
      if (this.action === 'clean') {
        Object.assign(stateChange, this._clean(coord))
      }
      else if (this.action === 'etch') {
        if (!this.state.etched[coord]) {
          Object.assign(stateChange, this._etch(coord))
        }
      }
      else if (this.action === 'mark') {
        if (!this.state.marked[coord]) {
          Object.assign(stateChange, this._mark(coord))
        }
      }
    }
    this.setState(stateChange)
  },

  handleKeyDown(e) {
    if (this.state.completed || this.state.failed) return

    if (e.key === 'ArrowRight') {
      if (this.state.x < this.width - 1) {
        this._move(this.state.x + 1, this.state.y)
      }
      e.preventDefault()
    }
    else if (e.key === 'ArrowLeft') {
      if (this.state.x > 0) {
        this._move(this.state.x - 1, this.state.y)
      }
      e.preventDefault()
    }
    else if (e.key === 'ArrowDown') {
      if (this.state.y < this.height - 1) {
        this._move(this.state.x, this.state.y + 1)
      }
      e.preventDefault()
    }
    else if (e.key === 'ArrowUp') {
      if (this.state.y > 0) {
        this._move(this.state.x, this.state.y - 1)
      }
      e.preventDefault()
    }
    else if (e.key === 'Control') {
      if (!this.ctrlDown) {
        let {action, ...stateChange} = this._etch(`${this.state.y}x${this.state.x}`)
        this.setState(stateChange)
        this.action = action
        this.ctrlDown = true
      }
      e.preventDefault()
    }
    else if (e.key === 'Shift') {
      if (!this.shiftDown) {
        let {action, ...stateChange} = this._mark(`${this.state.y}x${this.state.x}`)
        this.setState(stateChange)
        this.action = action
        this.shiftDown = true
      }
      e.preventDefault()
    }
  },
  handleKeyUp(e) {
    if (e.key === 'Control') {
      this.ctrlDown = false
      this.action = null
      e.preventDefault()
    }
    if (e.key === 'Shift') {
      this.shiftDown = false
      this.action = null
      e.preventDefault()
    }
  },

  getCursorClass() {
    if (this.action === 'clean') {
      return 'cleaning'
    }
    else if (this.action === 'etch') {
      return 'etching'
    }
    else if (this.action === 'mark') {
      return 'marking'
    }
  },
  render() {
    let {name} = this.props
    let {completed, failed, etched, marked, time, x, y} = this.state
    let currentCoord = `${y}x${x}`
    let className = 'Puzzle'
    if (completed) {
      className += ' completed'
    }
    return <div className={className} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} tabIndex={0}>
      <table>
        <tbody>
          <tr>
            <td style={{textAlign: 'center'}}>
              {name}
              <br/>
              <span style={{color: time < 120 || failed ? 'red' : 'black'}}>
                {formatTime(time)}
              </span>
            </td>
            {this.colClues.map((clues, col) => {
              let className = 'ColClues'
              if (!completed && x === col) {
                className += ' highlight'
              }
              return <td className={className} key={col}>
                {clues.join(' ')}
              </td>
            })}
          </tr>
          {this.rowClues.map((clues, row) => {
            let clueClassName = 'RowClues'
            if (!completed && y === row) {
              clueClassName += ' highlight'
            }
            return <tr className="Row" key={row}>
              <td className={clueClassName}>
                {clues.join(' ')}
              </td>
              {this.colClues.map((clues, col) => {
                let blockCoord = `${row}x${col}`
                let className = 'Block'
                if (etched[blockCoord]) {
                  className += ' etched'
                }
                else if (marked[blockCoord]) {
                  className += ' marked'
                }
                if (!completed && !failed && currentCoord === blockCoord) {
                  className += ' selected ' + this.getCursorClass()
                }
                return <td className={className} key={blockCoord}>
                  {marked[blockCoord] && !completed ? 'x' : <span>&nbsp;</span>}
                </td>
              })}
            </tr>
          })}
        </tbody>
      </table>
    </div>
  }
})

export default Puzzle
