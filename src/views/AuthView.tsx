import axios from 'axios';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../reducers/AuthReducer';
import { useNavigate } from "react-router-dom";

const AuthView = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showRegister, setShowRegister] = useState(false);

    const { authState, authDispatch } = useContext(AuthContext);
    let navigate = useNavigate();
    
    useEffect(() => {
        if (authState.token !== null)
            navigate('/');
    }, [authState, navigate]);

    const handleLoginSubmit = async (e: any) => {
        e.preventDefault();

        // if any of the fields are empty, display an error message
        if (!username || !password)
            return authDispatch({ type: 'AUTH_ERROR', payload: 'Please fill in all fields!' });

        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, {
                username,
                password,
            });

            // if we receive a token, log us in!
            if (res.data.token)
                authDispatch({ type: 'LOGIN_SUCCESS', payload: res.data.token });
            else
                authDispatch({ type: 'AUTH_ERROR', payload: res.data.message });
        } 
        // if we get a 401 error, display an 'invalid credentials' error message
        catch (err: any) {
            if (err.response?.status === 401) {
                return authDispatch({ type: 'AUTH_ERROR', payload: 'Username/password combination is incorrect!' });
            } else
                authDispatch({ type: 'AUTH_ERROR', payload: "Something went wrong!" });
        }
    };

    const handleRegisterSubmit = async (e: any) => {
        e.preventDefault();

        // if any of the fields are empty, display an error message
        if (!username || !password || !confirmPassword)
            return authDispatch({ type: 'AUTH_ERROR', payload: 'Please fill in all fields!' });

        // if the passwords don't match, display an error message
        if (password !== confirmPassword)
            return authDispatch({ type: 'AUTH_ERROR', payload: 'Passwords do not match!' });

        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, {
                username,
                password,
            });

            // if we receive a token, log us in!
            if (res.data.token)
                authDispatch({ type: 'LOGIN_SUCCESS', payload: res.data.token });
            else
                authDispatch({ type: 'AUTH_ERROR', payload: res.data.message });
        } 
        // if we get a 401 error, display an 'invalid credentials' error message
        catch (err: any) {
            if (err.response?.status === 401) {
                return authDispatch({ type: 'AUTH_ERROR', payload: 'Username/password combination is incorrect!' });
            } else
                authDispatch({ type: 'AUTH_ERROR', payload: "Something went wrong!" });
        }
    };

    const renderLoginForm = () => {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-4 w-full flex justify-center">synThesis</h1>
                <h1 className="text-2xl font-bold mb-4 w-full flex justify-center">Login to an existing account</h1>

                <form onSubmit={handleLoginSubmit}>
                    {/* form */}
                    <div className="mb-4">
                        <label htmlFor="username" className="text-lg font-medium block mb-2">Username</label>
                        <input type="text" id="username" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="text-lg font-medium block mb-2">Password</label>
                        <input type="password" id="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    </div>

                    {/* submit */}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md w-full">Login</button>

                    {/* error */}
                    {authState.error && <p className="text-red-500 mt-4">{authState.error}</p>}

                    {/* register */}
                    <hr className="my-4" />
                    <p className="hover:text-gray-600 text-gray-400 rounded-md hover:cursor-pointer w-full flex justify-center" onClick={() => { setShowRegister(true) }}>Or register an account</p>
                </form>
            </div>
        )
    };

    const renderRegisterForm = () => {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-4 w-full flex justify-center">synThesis</h1>
                <h1 className="text-2xl font-bold mb-4 w-full flex justify-center">Register an account</h1>
                <form onSubmit={handleRegisterSubmit}>
                    {/* form */}
                    <div className="mb-4">
                        <label htmlFor="username" className="text-lg font-medium block mb-2">Username</label>
                        <input type="text" id="username" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="text-lg font-medium block mb-2">Password</label>
                        <input type="password" id="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="text-lg font-medium block mb-2">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    </div>

                    {/* submit */}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md w-full">Register</button>

                    {/* error */}
                    {authState.error && <p className="text-red-500 mt-4">{authState.error}</p>}


                    {/* login */}
                    <hr className="my-4" />
                    <p className="hover:text-gray-600 text-gray-400 rounded-md hover:cursor-pointer w-full flex justify-center" onClick={() => { setShowRegister(false) }}>Or login to an existing account</p>
                </form>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-white rounded-lg shadow-md p-8 mt-8 w-1/4">
                {showRegister ? renderRegisterForm() : renderLoginForm()}
            </div>
        </div>
    );
}

export default AuthView;
