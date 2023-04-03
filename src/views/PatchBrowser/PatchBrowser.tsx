import axios from 'axios';
import _ from 'lodash';
import React, { useEffect, useCallback } from 'react';
import { PatchModel } from '../../context/PatchContext';
import Sidebar from './Sidebar';

const PatchBrowser: React.FC = () => {

    const [searchText, setSearchText] = React.useState<string>("");
    const [searchResults, setSearchResults] = React.useState<PatchModel[]>([]);

    /**
     * Debouncing search text so that it's live (but not too live)!
     * @param searchText search text string
     */
    
    const handleSearchDebounce = (searchText: string) => {
        setSearchText(searchText);

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/patches`, {
            patchName: searchText,
        }).then((res) => {
            setSearchResults(res.data.patches);
        });
    }

    const debounceSearch = useCallback(_.debounce(handleSearchDebounce, 500), []); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Fetch all patches from the database!
     */
    
    useEffect(() => {
        (async () => {

            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getPatches`);
                if (res.data.patches)
                {
                    setSearchResults(res.data.patches);
                } else console.log('No patches found!');
            } 
            catch (err: any) {
                console.log("Something went wrong!");
            }
        })();
    }, []);

    const onSearchChange = (searchText: string) => {
        if (searchText.length < 3){
            setSearchText("");
            return;
        }

        debounceSearch(searchText);
    }

    const renderSearchResults = () => {
        if (!searchResults) return <p>(Empty)</p>;

        return searchResults.map((patch, index) => {
            return (
                <div className='flex gap-x-4' key={`patch-${patch._id}`}>
                    <p key={index} className='hover:cursor-pointer'>
                        <span>{index + 1}: {patch.meta.name}</span>
                    </p>
                </div>
            )
        });
    }; 

    return (
        <>        
            <div className="flex flex-row flex-grow">                
                <div className="flex w-full">
                    <Sidebar />

                    {/* main content */}
                    <div className="m-4 w-full">

                        {/* search bar */}
                        <div>
                            <label htmlFor="searchText" className='font-bold'>Search for patch...</label>
                            <input 
                                type="text" 
                                name="searchText" 
                                id="searchText" 
                                className='w-full mt-2 border-2 rounded-md' 
                                placeholder='patch name, author, etc'
                                onChange={(e) => onSearchChange(e.target.value)} 
                            / >
                        </div>

                        {/* results list */}
                        <div className='mt-4'>
                            <p className='font-bold mb-4'>Showing: {searchText.length >= 3 ? `Results for '${searchText}'...` : "(All patches)"}</p>
                            {renderSearchResults()}
                        </div> 
                    </div>
                </div>
            </div>
        </>
    );

}

export default PatchBrowser;