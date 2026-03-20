import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ClientPortal from './client/ClientPortal.jsx'
import './index.css'

// If URL contains ?token=..., render the client portal instead of the advisor app
const params = new URLSearchParams(window.location.search)
const token  = params.get('token')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {token ? <ClientPortal token={token} /> : <App />}
  </React.StrictMode>
)
