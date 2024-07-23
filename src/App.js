import './App.css'

import React from 'react'

import Puzzle from './Puzzle'

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

let App = React.createClass({
  render() {
    return <div className="App">
      <Puzzle name="TEST-1" puzzle={WEIGHTLIFTER}/>
    </div>
  }
})

export default App
