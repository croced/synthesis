import _ from 'lodash';
import { createContext, useReducer } from 'react';
import { PatchModel } from '../context/PatchContext';

export type PatchBankAction =
  | { type: 'FETCH_BANK', payload: any }
  | { type: 'ADD_PATCH_TO_BANK', payload: PatchModel }
  | { type: 'REMOVE_PATCH_FROM_BANK', payload: PatchModel };

export const patchBankReducer = (bank: PatchModel[] = [], action: PatchBankAction) => {
    switch (action.type) {
        case "FETCH_BANK":
            return [...bank, action.payload];
        case "ADD_PATCH_TO_BANK":
            return [...bank, action.payload];
        case "REMOVE_PATCH_FROM_BANK":
            return bank.filter((patch: PatchModel) => patch._id !== action.payload._id);
        default: 
            return bank;
    }
}

export const PatchBankContext = createContext<{
    patchBank: PatchModel[];
    bankDispatch: React.Dispatch<PatchBankAction>;
}>({
    patchBank: [],
    bankDispatch: () => null,
});

interface ProviderProps {
    children: React.ReactNode;
}

export const PatchBankProvider: React.FC<ProviderProps> = ({children}) => {
    const [patchBank, bankDispatch] = useReducer(patchBankReducer, []);

    return (
        <PatchBankContext.Provider value={{ patchBank, bankDispatch }}>
            {children}
        </PatchBankContext.Provider>
    );
};