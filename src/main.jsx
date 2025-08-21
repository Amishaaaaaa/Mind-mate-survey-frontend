// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google'


const clientId = '544728379703-t1ljjd1fdj6646nn9r5u0v8nlo08q9hr.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  // </StrictMode>,
)
