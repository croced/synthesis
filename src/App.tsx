import React from 'react';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { defaultPatch, PatchContext } from './context/PatchContext';
import { AuthProvider } from './reducers/AuthReducer';
import AuthView from './views/AuthView';
import SynthView from './views/SynthView/SynthView';

const router = createBrowserRouter([
    {
      path: "/",
      element: <SynthView />,
    },
    {
      path: "/login",
      element: <AuthView />,
    },
]);

const App: React.FC = () => {

  const [patch, setPatch] = React.useState(defaultPatch);
  const patchVal = { patch, setPatch };

  return (
    <AuthProvider>
      <PatchContext.Provider value={patchVal}>
        <RouterProvider router={router} />
      </PatchContext.Provider>
    </AuthProvider>
  );
};

export default App;
