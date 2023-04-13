import { createContext, useContext, useEffect, useState } from "react";
import { IFilter, IPatch } from "../types/Synthesiser";
import axios, { AxiosError } from "axios";
import { AuthContext } from "../reducers/AuthReducer";

export type PatchModel = IPatch & { _id: any };

/**
 * The default patch to use when the app is loaded.
 */

export const defaultFilter: IFilter = {
  type: "lowpass",
  frequency: 1000,
  emphasis: 1,
  gain: 0,
  signal: "1",
};

export const defaultPatch: IPatch = {
  meta: {
    version: 1,
    author: "641de89ac96452e7150fd600", // 'synthesis' user id
    name: "untitled-patch",
  },
  oscillators: [
    {
      waveType: "sine",
      detune: 0,
      octave: 0,
    },
    {
      waveType: "sine",
      detune: 0,
      octave: 0,
    },
  ],
  filters: [defaultFilter],
  mixer: {
    type: "volume",
    mix: 0.5,
    carrierOsc: 0,
    fmModIndex: 50,
  },
};

export const PatchContext = createContext({
    defaultPatch,
    patch: defaultPatch,
    setPatch: (patch: IPatch) => {},
    patchBank: [] as PatchModel[],
    setPatchBank: (patchBank: PatchModel[]) => {},
});

const usePatchBank = () => {

    const { setPatchBank } = useContext(PatchContext);
    const [patchBank, setPatchBankState] = useState<PatchModel[]>([]);
    const { user } = useContext(AuthContext);

    // fetch patch bank from server
    useEffect(() => {
        
        async function fetchPatchBank() {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/patchBank/${user}`);
                setPatchBankState(response.data.patchBank || []);
            } catch (error) {
                console.error(error);
            }
        }

        if (user)
            fetchPatchBank();
    }, [user]);

    // update patch bank in context
    useEffect(() => {
        setPatchBank(patchBank);
    }, [patchBank, setPatchBank]);

    // add patch to patch bank
    async function pushToPatchBank(patchId: string) {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/patchBank/${user}`,
                { patchId: patchId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            
            if (response.data.patchBank)
                setPatchBankState(response.data.patchBank);
        } catch (error: any) {
            handleError(error);
        }
    }

    // remove patch from patch bank
    async function removeFromPatchBank(patchId: string) {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/patchBank/${user}`, {
                data: {
                    patchId: patchId,
                },
            });

            if (response.data.patchBank)
                setPatchBankState(response.data.patchBank);
        } catch (error: any) {
            handleError(error);
        }
    }

    // error handling
    function handleError(error: AxiosError) {
        console.error(error);
    }

    return { patchBank, pushToPatchBank, removeFromPatchBank };
}

export default usePatchBank;