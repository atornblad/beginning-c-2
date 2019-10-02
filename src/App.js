import React from 'react';
import './App.css';
import CodeEditorPage from './pages/CodeEditorPage.js';
import { BrowserRouter, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Route exact path="/" component={CodeEditorPage} />
      </BrowserRouter>
    </div>
  );
}

export default App;
