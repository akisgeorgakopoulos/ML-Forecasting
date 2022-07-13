import React, {useState} from 'react';
import HeaderContext from './header-context';

const HeaderProvider = props => {
    const [completed,setCompleted] = useState(0);
    const [pending,setPending] = useState(0);
    
    const headerContext = {
        completed:completed,
        pending:pending,
        addPending: () => {setPending((p)=> p+1)},
        removePending: () => {setPending((p)=> p-1)},
        updateCompleted: () => {
            const fetchForecasts = async () =>{      
                const response = await fetch('http://localhost:8000/completed-num');
                if (!response.ok){
                throw new Error();
                }
                const responseData = await response.json();
                setCompleted(responseData.number);
            }
            fetchForecasts().catch(error =>{
                alert('Σφάλμα κατά την εντοπισμό των προβλέψεων...');
            })
        }
    }
    
    return(
        <HeaderContext.Provider value={headerContext} >
            {props.children}
        </HeaderContext.Provider>
    )
}

export default HeaderProvider;