import React from 'react';
import { defaultPatch, PatchContext } from './context/PatchContext';
import SynthView from './views/SynthView/SynthView';


const App: React.FC = () => {

  const [patch, setPatch] = React.useState(defaultPatch);
  const patchVal = { patch, setPatch };

  return (
    <PatchContext.Provider value={patchVal}>
      <SynthView />
    </PatchContext.Provider>
  );
};

export default App;
