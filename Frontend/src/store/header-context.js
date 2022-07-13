import React, {createContext} from 'react';

const HeaderContext = createContext({
    completed:0,
    pending:0,
    addPending: () =>{},
    removePending: () => {},
    updateCompleted: () => {}
});

export default HeaderContext;