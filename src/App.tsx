import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { defaultPatch, PatchContext, PatchModel } from './context/PatchContext';
import { AuthProvider } from './reducers/AuthReducer';
import AuthView from './views/AuthView';
import SynthView from './views/SynthView/SynthView';
import Navbar from './components/Navbar';

const App: React.FC = () => {

  const [patch, setPatch] = React.useState(defaultPatch);
  const [patchBank, setPatchBank] = React.useState<PatchModel[]>([]);

  const patchVal = { defaultPatch, patch, setPatch, patchBank, setPatchBank };

  return (
    <AuthProvider>
      <PatchContext.Provider value={patchVal}>
        <Router>
          <div className="flex flex-col h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<SynthView />} />
              <Route path="/login" element={<AuthView />} />
            </Routes>
          </div>
        </Router>
      </PatchContext.Provider>
    </AuthProvider>
  );
};

export default App;