//import { useState } from 'react'
import { BrowserRouter as Router } from "react-router-dom";
import RoutesList from "./routes";


import './App.css'
import './styles/styles.css'

function App() {

  return (
    <>
    <Router>
      <RoutesList />
    </Router>
      
    </>
  )
}
export default App
