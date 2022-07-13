import React, {useEffect, useState} from 'react';
import PhasePlot from './PhasePlot';
import classes from './PhasesPlots.module.css';

const PhasesPlots = props => {
    const backHandler = () => {
        props.onBack('Menu')
    }
    const [isLoading,setIsLoading] = useState(true);
    const [loadedData,setLoadedData] = useState({"time":[],
                                                 "pwrA":[],
                                                 "pwrB":[],
                                                 "pwrC":[]
                                                });
    
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () =>{      
            const response = await fetch('http://localhost:8000/data');
            if (!response.ok){
            throw new Error();
            }
            const responseData = await response.json();
            let timeseries = {"time":[],"pwrA":[],"pwrB":[],"pwrC":[]};
            responseData.forEach(datapoint => {
                timeseries.time.push(datapoint.Time);
                timeseries.pwrA.push(datapoint.pwrA);
                timeseries.pwrB.push(datapoint.pwrB);
                timeseries.pwrC.push(datapoint.pwrC);
            }
            );
            setLoadedData(timeseries);
            setIsLoading(false);
        }
        fetchData().catch(error => {
            alert('Σφάλμα στην φόρτωση των χρονοσειρών...')
        });
      }, [])

    return(
            <>
                <button className={classes['back-button']} onClick={backHandler}>Πίσω</button>
                {isLoading && 
                <div className={classes["main-content"]}>
                    <h2 className={classes.title}>Loading...</h2>
                </div>
                }
                {!isLoading &&
                <>
                    <PhasePlot phase='pwrA' data={{'time':loadedData.time, "phase":loadedData.pwrA}}/>  
                    <PhasePlot phase='pwrB' data={{'time':loadedData.time, "phase":loadedData.pwrB}}/>  
                    <PhasePlot phase='pwrC' data={{'time':loadedData.time, "phase":loadedData.pwrC}}/>
                </>
                }
            </>
    )
}

export default PhasesPlots;