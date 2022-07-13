import React,{useEffect,useState,useContext} from 'react';
import classes from './NewForecast.module.css';
import HeaderContext from '../../store/header-context';
import Modal from '../Layout/Modal';

const NewForeacast = props => {
    const [hasError,setHasError] = useState(false,[]);
    const [projectNames,setProjectNames] = useState({"names":[]});

    const headerCtx = useContext(HeaderContext);
    
    const [inputs, setInputs] = useState({
        "project_name":"",
        "pwrA":false,
        "pwrB":false,
        "pwrC":false,
        "horizon":0,
        "window_size":0,
        "rf":false,
        "rf_ho":"rs",
        "rf_iter":1000,
        "rf_tech":"multistep",
        "knn":false,
        "knn_ho":"rs",
        "knn_iter":1000,
        "knn_tech":"multistep",
        "svr":false,
        "svr_ho":"rs",
        "svr_iter":1000,
        "svr_tech":"multistep",
        "grb":false,
        "grb_ho":"rs",
        "grb_iter":1000,
        "grb_tech":"multistep",
        "lr":false,
        "lr_tech":"multistep",
        "dt":false,
        "dt_ho":"rs",
        "dt_iter":1000,
        "dt_tech":"multistep",
    });
    
    useEffect(() => {
        window.scrollTo(0, 0);
        //get used project names
        const fetchProjectNames = async () =>{ 
        
            const response = await fetch(`http://localhost:8000/completed-names`);
    
            if (!response.ok){
            throw new Error('Error occured during data fetching...');
            }
            const responseData = await response.json();
            let names = {"names":[]};
            responseData.forEach(name => {
                names.names.push(name.project_name);
            }
            );
            setProjectNames(names);
        }
    
        fetchProjectNames().catch(error =>{
            alert('Σφάλμα στην φόρτωση των ονομάτων χρονοσειρών...')
        });
    }, [])
    
    const cancelHandler = () => {
        props.onBack('Menu');
    }

    const changeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        const valueFields = ["horizon", "window_size", "dt_iter", "rf_iter", "knn_iter", "svr_iter", "grb_iter"];
        const booleanFields = ["pwrA", "pwrB", "pwrC", "lr", "rf", "grb", "knn", "svr", "dt"]

        if (booleanFields.includes(name)){
            setInputs(values => ({...values, [name]: !values[name]}));
        }
        else if (valueFields.includes(name)){
            setInputs(values => ({...values, [name]: ( isNaN(parseInt(value)) || parseInt(value) === 0) ? 0 : parseInt(value)}));    
        }
        else{
            setInputs(values => ({...values, [name]: value}));
        }
    }

    const submitHandler = async (event) =>{
        event.preventDefault();
 
        let err = false;
        let errMsgs = [];
        if (inputs.project_name.trim() === ""){
            errMsgs.push('Κενό όνομα project');
            err = true;
        }
        if (projectNames.names.includes(inputs.project_name.trim())){
            errMsgs.push(`Το όνομα project "${inputs.project_name.trim()}" υπάρχει ήδη`);
            err = true;
        }
        if (!inputs.pwrA && !inputs.pwrB && !inputs.pwrC){
            errMsgs.push('Δεν έχει επιλεγεί καμία φάση');
            err = true;
        }
        if (!inputs.knn && !inputs.lr && !inputs.svr && !inputs.grb && !inputs.rf  && !inputs.dt){
            errMsgs.push('Δεν έχει επιλεγεί κανένας αλγόριθμος');
            err = true;
        }
        if (inputs.horizon < 1 || inputs.horizon > 72 ){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρος ορίζοντας πρόβλεψης (1-72)');
            err = true;    
        }
        if (inputs.window_size < 1 || inputs.window_size > 120){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρο μέγεθος εισόδου (1-120)');
            err = true;    
        }
        if(err){
            setHasError([err,errMsgs])
        }
        else{            
            headerCtx.addPending();
            props.onBack('Menu');
            try{
                const response = await fetch('http://localhost:8000/completed',{
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(inputs)
                });
                if (response.status !== 200){
                    throw new Error();
                }
                headerCtx.updateCompleted();
            }catch(error){
                alert('Σφάλμα κατά την εκτέλεση της πρόβλεψης...');    
            }
            headerCtx.removePending();            
        }    
    }
    
    const errorsList = () => {
        return(<ul className={classes["errors-list"]}>
            {hasError[1].map(msg => <li key={Math.random()}>{msg}</li>)}
        </ul>)
    }

    const hideHandler = () =>{
        setHasError(false,[]);
    }

    return(
        <>
            {hasError[0] && 
            <Modal onClose={hideHandler}>
                <h3 className={classes["title"]}>Λάθη στην υποβληθείσα φόρμα</h3>
                <h4>Πιο συγκεκριμένα πρέπει να διορθωθούν τα ακόλουθα:</h4>
                {errorsList()}
                <div className={classes['ok-button-container']}>
                    <button className={classes['ok-button']} onClick={hideHandler}>Κλείσιμο</button>
                </div>  
            </Modal>}
            <form className={classes["forma"]} onSubmit={submitHandler}>
                <h3>Βασικές Επιλογές</h3>
                <div className={classes["basic-options"]}>
                    <div className={classes["option"]}>
                        <label htmlFor="project_name">Όνομα Project</label>
                        <input type="text" id="project_name" name="project_name" onChange={changeHandler}/>
                    </div>
                    <div className={classes["option-checkbox"]}>
                        <label htmlFor="phase">Επιλογή Φάσεων</label>
                        <input type="checkbox" name="pwrA" value="Power A" id="phase" onChange={changeHandler}/>Φάση A
                        <input type="checkbox" name="pwrB" value="Power B" id="phase" onChange={changeHandler}/>Φάση B
                        <input type="checkbox" name="pwrC" value="Power C" id="phase" onChange={changeHandler}/>Φάση C
                    </div>      
                    <div className={classes["option"]}>
                        <label htmlFor="horizon">Ορίζοντας Πρόβλεψης</label>
                        <input type="number" min="1" max="96" name="horizon" id="horizon" onChange={changeHandler}/>
                    </div>
                    <div className={classes["option"]}>
                        <label htmlFor="window_size">Μέγεθος Παραθύρου</label>
                        <input type="number" min="1" max="100" name="window_size" id="window_size" onChange={changeHandler}/>
                    </div>
                </div>
                <h3>Αλγόριθμοι Μηχανικής Μάθησης</h3>
                <div className={classes["ml-models"]}>
                    <div className={classes["models-container"]}>
                        <div className={classes["ml-model"]}>
                            <h4 className={classes["model-title"]}>Linear Regresson</h4>
                            <div className={classes["model-params"]}>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="rf">Επιλογή LR</label><br/>
                                    <input type="radio" name="lr" value="yes" id="lr" onChange={changeHandler}/>yes
                                    <input type="radio" name="lr" value="no" id="lr" defaultChecked onChange={changeHandler}/>no 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="lr_tech">Μέθοδος</label><br/>
                                    <select name="lr_tech" id="lr_tech" onChange={changeHandler}>
                                        <option value="multistep">Multistep</option>
                                        <option value="multimodel">Multimodel</option>
                                        <option value="chained-multimodel">Chained-Multimodel</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className={classes["ml-model"]}>
                            <h4 className={classes["model-title"]}>Random Forest</h4>
                            <div className={classes["model-params"]}>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="rf">Επιλογή Random Forest</label><br/>
                                    <input type="radio" name="rf" value="yes" id="rf" onChange={changeHandler}/>yes
                                    <input type="radio" name="rf" value="no" id="rf" defaultChecked onChange={changeHandler}/>no 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="rf_ho">Τρόπος Βελτιστοποίησης Υπερπαραμέτρων</label><br/>
                                    <input type="radio" name="rf_ho" value="rs" id="rf_ho" defaultChecked onChange={changeHandler}/>RandomizedSearchCV
                                    <input type="radio" name="rf_ho" value="gs" id="rf_ho" onChange={changeHandler}/>GridSearchCV
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="rf_iter">Πλήθος Επαναλήψεων(Για RandomizedSearchCV)</label><br/>
                                    <div className={classes["slider-wrapper"]}>
                                        <input type="range" id="rf_iter" name="rf_iter"
                                        min="50" step="10" max="3000" defaultValue="1000" onChange={changeHandler}/>
                                    </div>
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="rf_tech">Μέθοδος</label><br/>
                                    <select name="rf_tech" id="rf_tech" onChange={changeHandler}>
                                        <option value="multistep">Multistep</option>
                                        <option value="multimodel">Multimodel</option>
                                        <option value="chained-multimodel">Chained-Multimodel</option>
                                    </select>
                                </div>
                            </div>
                        </div>            
                    </div>
                    <div className={classes["models-container"]}>
                        <div className={classes["ml-model"]}>
                            <h4 className={classes["model-title"]}>Support Vector Regressor</h4>
                            <div className={classes["model-params"]}>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="svr">Επιλογή SVR</label><br/>
                                    <input type="radio" name="svr" value="yes" id="svr" onChange={changeHandler}/>yes
                                    <input type="radio" name="svr" value="no" id="svr" defaultChecked onChange={changeHandler}/>no 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="svr_ho">Τρόπος Βελτιστοποίησης Υπερπαραμέτρων</label><br/>
                                    <input type="radio" name="svr_ho" value="rs" id="svr_ho" defaultChecked onChange={changeHandler}/>RandomizedSearchCV
                                    <input type="radio" name="svr_ho" value="gs" id="svr_ho" onChange={changeHandler}/>GridSearchCV
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="svr_iter">Πλήθος Επαναλήψεων(Για RandomizedSearchCV)</label><br/>
                                    <div className={classes["slider-wrapper"]}>
                                        <input type="range" id="svr_iter" name="svr_iter"
                                        min="50" step="10" max="3000" defaultValue="1000" onChange={changeHandler}/>
                                    </div> 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="svr_tech">Μέθοδος</label><br/>
                                    <select name="svr_tech" id="svr_tech" onChange={changeHandler}>
                                        <option value="multistep">Multistep</option>
                                        <option value="multimodel">Multimodel</option>
                                        <option value="chained-multimodel">Chained-Multimodel</option>
                                    </select>
                                </div>
                            </div>    
                        </div>
                        <div className={classes["ml-model"]}>
                            <h4 className={classes["model-title"]}>Gradient Boosting</h4>
                            <div className={classes["model-params"]}>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="grb">Επιλογή Gradient Boosting</label><br/>
                                    <input type="radio" name="grb" value="yes" id="grb" onChange={changeHandler}/>yes
                                    <input type="radio" name="grb" value="no" id="grb" defaultChecked onChange={changeHandler}/>no 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="grb_ho">Τρόπος Βελτιστοποίησης Υπερπαραμέτρων</label><br/>
                                    <input type="radio" name="grb_ho" value="rs" id="grb_ho" defaultChecked onChange={changeHandler}/>RandomizedSearchCV
                                    <input type="radio" name="grb_ho" value="gs" id="grb_ho" onChange={changeHandler}/>GridSearchCV
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="grb_iter">Πλήθος Επαναλήψεων(Για RandomizedSearchCV)</label><br/>
                                    <div className={classes["slider-wrapper"]}>
                                        <input type="range" id="grb_iter" name="grb_iter"
                                        min="50" step="10" max="3000" defaultValue="1000" onChange={changeHandler}/>
                                    </div> 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="grb_tech">Μέθοδος</label><br/>
                                    <select name="grb_tech" id="grb_tech" onChange={changeHandler}>
                                        <option value="multistep">Multistep</option>
                                        <option value="multimodel">Multimodel</option>
                                        <option value="chained-multimodel">Chained-Multimodel</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={classes["models-container"]}>
                        <div className={classes["ml-model"]}>
                            <h4 className={classes["model-title"]}>K-Nearest Neighbors</h4>
                            <div className={classes["model-params"]}>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="knn">Επιλογή KNN</label><br/>
                                    <input type="radio" name="knn" value="yes" id="knn" onChange={changeHandler}/>yes
                                    <input type="radio" name="knn" value="no" id="knn" defaultChecked onChange={changeHandler}/>no 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="knn_ho">Τρόπος Βελτιστοποίησης Υπερπαραμέτρων</label><br/>
                                    <input type="radio" name="knn_ho" value="rs" id="knn_ho" defaultChecked onChange={changeHandler}/>RandomizedSearchCV
                                    <input type="radio" name="knn_ho" value="gs" id="knn_ho" onChange={changeHandler}/>GridSearchCV
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="knn_iter">Πλήθος Επαναλήψεων(Για RandomizedSearchCV)</label><br/>
                                    <div className={classes["slider-wrapper"]}>
                                        <input type="range" id="knn_iter" name="knn_iter"
                                        min="50" step="10" max="3000" defaultValue="1000" onChange={changeHandler}/>
                                    </div>    
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="knn_tech">Μέθοδος</label><br/>
                                    <select name="knn_tech" id="knn_tech" onChange={changeHandler}>
                                        <option value="multistep">Multistep</option>
                                        <option value="multimodel">Multimodel</option>
                                        <option value="chained-multimodel">Chained-Multimodel</option>
                                    </select>
                                </div>
                            </div>    
                        </div>
                        <div className={classes["ml-model"]}>
                            <h4 className={classes["model-title"]}>Decision Tree</h4>
                            <div className={classes["model-params"]}>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="dt">Επιλογή Model</label><br/>
                                    <input type="radio" name="dt" value="yes" id="dt" onChange={changeHandler}/>yes
                                    <input type="radio" name="dt" value="no" id="dt" defaultChecked onChange={changeHandler}/>no 
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="dt_ho">Τρόπος Βελτιστοποίησης Υπερπαραμέτρων</label><br/>
                                    <input type="radio" name="dt_ho" value="rs" id="dt_ho" defaultChecked onChange={changeHandler}/>RandomizedSearchCV
                                    <input type="radio" name="dt_ho" value="gs" id="dt_ho" onChange={changeHandler}/>GridSearchCV
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="dt_iter">Πλήθος Επαναλήψεων(Για RandomizedSearchCV)</label><br/>
                                    <div className={classes["slider-wrapper"]}>
                                        <input type="range" id="dt_iter" name="dt_iter"
                                        min="50" step="10" max="3000" defaultValue="1000" onChange={changeHandler}/>
                                    </div>
                                </div>
                                <div className={classes["model-option"]}>
                                    <label htmlFor="dt_tech">Μέθοδος</label><br/>
                                    <select name="dt_tech" id="dt_tech" onChange={changeHandler}>
                                        <option value="multistep">Multistep</option>
                                        <option value="multimodel">Multimodel</option>
                                        <option value="chained-multimodel">Chained-Multimodel</option>
                                    </select>
                                </div>
                            </div>
                        </div> 
                    </div>        
                </div>
                <div className={classes["buttons"]}>
                    <button type="submit" className={classes["submit-button"]}>Υποβολή</button>
                    <button type="button" className={classes["cancel-button"]} onClick={cancelHandler}>Άκυρο</button> 
                </div>
            </form>
        </>
    );
}

export default NewForeacast;