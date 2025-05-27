import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import { useState } from 'react'
import { BrowserRouter as Router } from "react-router-dom";
import RoutesList from "./routes";


import './App.css'
import './styles/styles.css'

function App() {

  return (
    <>
    <ToastContainer />
    <Router>
      <RoutesList />
    </Router>
      
    </>
  )
}
export default App
