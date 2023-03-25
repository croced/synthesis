import { createContext, useEffect, useReducer, useState } from 'react';
import jwt_decode from 'jwt-decode';

interface AuthState {
    token: string | null;
    error: string | null;
}

type AuthAction =
    | { type: 'LOGIN_SUCCESS'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'AUTH_ERROR'; payload: string };

/**
 * Auth Reducer for handling authentication state.
 * @param state The current state of the application.
 */

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            // save JWT token to localStorage
            localStorage.setItem('token', action.payload);

            return {
                ...state,
                token: action.payload,
                error: null,
            };
        case 'LOGOUT':
            // remove JWT token from localStorage
            localStorage.removeItem('token');

            return {
                ...state,
                token: null,
                error: null,
            };
        case 'AUTH_ERROR':
            return {
                ...state,
                token: null,
                error: action.payload,
            };
        default:
            return state;
    }
};

const initialState: AuthState = {
    token: localStorage.getItem('token') || null,
    error: null,
};

export const AuthContext = createContext<{
    authState: AuthState;
    authDispatch: React.Dispatch<AuthAction>;
    user: string | null;
}>({
    authState: initialState,
    authDispatch: () => null,
    user: null,
});

interface ProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<ProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [user, setUser] = useState<string | null>(null);

    // decode token and set user (if token exists)
    useEffect(() => {
        if (state.token === null)
            setUser(null);
        else
        {
            const decoded: any = jwt_decode(state.token);

            if (!decoded.id) return;
            setUser(decoded.id);
        }
    }, [state]);

    return (
        <AuthContext.Provider value={{ authState: state, authDispatch: dispatch, user }}>
        {children}
        </AuthContext.Provider>
    );
};
