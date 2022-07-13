import React, { useState,useEffect } from "react";
import CompletedForecast from "./CompletedForecast";
import classes from './CompletedForecasts.module.css';
import ReactPaginate from "react-paginate";

const CompletedForecasts = props => {
    const [forecasts,setForecasts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchForecasts = async () =>{      
            const response = await fetch('http://localhost:8000/completed');
            if (!response.ok){
            throw new Error();
            }
            const responseData = await response.json();
            const loadedForecasts = [];
            responseData.forEach(completed => {
            loadedForecasts.push({
                project_name: completed.project_name,
                time: completed.time,
                horizon: completed.horizon,
                input: completed.window,
                predictions_A: completed.predictions_A,
                predictions_B: completed.predictions_B,
                predictions_C: completed.predictions_C,
                algorithms: completed.algorithms
            });
            }) 
            setIsLoading(false);
            setForecasts(loadedForecasts);
        }
        
        fetchForecasts().catch((error) => {
            alert('Σφάλμα στην φόρτωση των προβλέψεων...');
        });      
      },[])
      
    
    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])
    
    const backHandler = () => {
        props.onBack('Menu')
    }

    const moreHandler = (infos) => {
        props.onMore(infos)
    }
    
    const [pageNumber, setPageNumber] = useState(0);
    
    const forecastsPerPage = 5;
    const forecastsShown = pageNumber*forecastsPerPage;
    const displayForecasts = forecasts.slice(forecastsShown, forecastsShown+forecastsPerPage)
                                 .map(forecast => <CompletedForecast 
                                    id = {Math.random()}
                                    time={forecast.time} 
                                    project_name={forecast.project_name}
                                    horizon = {forecast.horizon}
                                    input = {forecast.input}
                                    predictions_A = {forecast.predictions_A}
                                    predictions_B = {forecast.predictions_B}
                                    predictions_C = {forecast.predictions_C}
                                    algorithms={forecast.algorithms}
                                    more={moreHandler}
                                />)

    const pageCount = Math.ceil(forecasts.length / forecastsPerPage);
    const changePage = ({selected}) => {
        setPageNumber(selected);
    };

    return(
        <>
            <button className={classes['back-button']} onClick={backHandler}>Πίσω</button>
            <div className={classes['main-content']}>
                {isLoading && <h1 className={classes['title']}>Loading...</h1>}
                {
                !isLoading &&
                <>
                    <h1 className={classes['title']}>Ολοκληρωμένες Προβλέψεις</h1>
                    <ul className={classes['forecasts-list']}>
                        {displayForecasts}
                    </ul>
                    <div className={classes['pagination']}>
                        <ReactPaginate
                            previousLabel={"Προηγούμενο"}
                            nextLabel={"Επόμενο"}
                            pageCount={pageCount}
                            onPageChange={changePage}
                            containerClassName={classes["paginationBttns"]}
                            previousLinkClassName={classes["previousBttn"]}
                            nextLinkClassName={classes["nextBttn"]}
                            disabledClassName={classes["paginationDisable"]}
                            activeClassName={classes["paginationActive"]}
                        />
                    </div> 
                </>                
                }  
            </div>
        </>
    )    
}

export default CompletedForecasts;