import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="1048309122374-fc2cckttrlh1vk1e9q641901m1tafb2m.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)
