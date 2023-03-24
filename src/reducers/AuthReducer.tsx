import { createContext, useReducer } from 'react';
import jwt_decode from 'jwt-decode';

interface AuthState {
    token: string | null;
    user: any | null;
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
        {
            // save JWT token to localStorage
            const user = jwt_decode(action.payload);

            localStorage.setItem('token', action.payload);
            localStorage.setItem('user', JSON.stringify(user));

            return {
                ...state,
                token: action.payload,
                user,
                error: null,
            };
        };
        case 'LOGOUT':
        {
            // remove JWT token from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return {
                ...state,
                token: null,
                user: null,
                error: null,
            };
        };
        case 'AUTH_ERROR':
        {
            return {
                ...state,
                token: null,
                user: null,
                error: action.payload,
            };
        };
        default:
            return state;
    }
};

const initialState: AuthState = {
    token: localStorage.getItem('token') || null,
    user: null,
    error: null,
};

export const AuthContext = createContext<{
    authState: AuthState;
    authDispatch: React.Dispatch<AuthAction>;
}>({
    authState: initialState,
    authDispatch: () => null,
});

interface ProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<ProviderProps> = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ authState: state, authDispatch: dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
