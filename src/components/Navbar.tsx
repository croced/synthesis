import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PatchContext } from '../context/PatchContext';
import { AuthContext } from '../reducers/AuthReducer';

const Navbar: React.FC = () => {
  const { authState, authDispatch } = useContext(AuthContext);
  const { setPatch, defaultPatch, setPatchBank } = useContext(PatchContext);

  const location = useLocation();
  const navigate = useNavigate();

    // logout handling
    const handleLogout = () => {
        authDispatch({ type: 'LOGOUT' });

        // reset patch
        setPatch(defaultPatch);
        setPatchBank([]);

        navigate('/login');
    };

    // don't show navbar on login page
    if (location.pathname === '/login')
        return <></>;

    return (
        <nav className="bg-gray-200 py-3 border-b-2 border-b-gray-500">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex justify-between">
            <div className="flex items-center">
            <span className="text-xl font-bold">synThesis (prototype)</span>
            </div>
            <div className="flex items-center">
            <Link
                to="/"
                className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
                Synth View
            </Link>
            <Link
                to="/patch-browser"
                className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
            >
                Patch Browser
            </Link>

            {authState.token && (
                <>
                <Link
                    to="/my-account"
                    className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
                >
                    My Account
                </Link>
                <button
                    className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
                    onClick={handleLogout}
                >
                Logout
                </button>
                </>
            )}
            </div>
        </div>
        </nav>
    );
};

export default Navbar;