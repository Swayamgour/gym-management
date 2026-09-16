import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import App from './App';
import './index.css';
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("New version available");
  },

  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#171B26',
              color: '#F5F6F1',
              fontSize: '14px',
              borderRadius: '10px'
            }
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
