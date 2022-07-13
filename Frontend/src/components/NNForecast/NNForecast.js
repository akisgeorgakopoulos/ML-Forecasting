import React,{useEffect,useState,useContext} from 'react';
import classes from './NNForecast.module.css';
import HeaderContext from '../../store/header-context';
import Modal from '../Layout/Modal';

const NNForecast = props => {
    const headerCtx = useContext(HeaderContext);

    const [hasError,setHasError] = useState(false,[]);
    const [projectNames,setProjectNames] = useState({"names":[]});

    const [inputs, setInputs] = useState({
        "project_name":"",
        "pwrA":false,
        "pwrB":false,
        "pwrC":false,
        "horizon":0,
        "input_size":0,
        "hidden_layers":0,
        "hidden_size":[],
        "activation_hidden":[],
        "epochs":0,
        "learning_rate":0,
        "batch_size":0,
        "technique":"multioutput"
    });
        
    useEffect(() => {
        window.scrollTo(0, 0);
        //get used project names
        const fetchProjectNames = async () =>{ 
            const response = await fetch(`http://localhost:8000/completed-names`);
            if (!response.ok){
            throw new Error();
            }
            const responseData = await response.json();
            let names = {"names":[]};
            responseData.forEach(name => {
                names.names.push(name.project_name);
            }
            );
            setProjectNames(names);
        }

        fetchProjectNames().catch(error => {
            alert('Σφάλμα στην φόρτωση των ονομάτων χρονοσειρών...');
        });
    }, [])
    
    const cancelHandler = () => {
        props.onBack('Menu');
    }

    const changeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        const valueFields = ["batch_size","epochs","horizon","input_size","learning_rate"]
        //handle changes of new fields
        if (name === 'pwrA' || name === 'pwrB' || name === 'pwrC'){
            setInputs(values => ({...values, [name]: !values[name]}));
        }
        else if (name.startsWith('hidden_size')){
            setInputs(values => {
                let arr = [].concat(values.hidden_size);
                const index = parseInt(name.slice(-1)) - 1;
                arr[index] = parseInt(value)
                return ({...values, ['hidden_size']: arr})
            });
        }
        else if (name.startsWith('activation_hidden')){
            setInputs(values => {
                let arr = [].concat(values.activation_hidden);
                const index = parseInt(name.slice(-1)) - 1;
                arr[index] = value
                return ({...values, ['activation_hidden']: arr})
            });
        }
        else if (name === 'hidden_layers'){
            setInputs(values => {
                let arr = [].concat(values.activation_hidden);
                let arrSize = [].concat(values.hidden_size);
                if (values.hidden_layers < parseInt(value)){
                    //added layer
                    arr.push('relu')
                    arrSize.push(0)
                    return ({...values, ['activation_hidden']: arr, ['hidden_size']:arrSize, [name]: parseInt(value) })
                }
                else {
                    //removed a layer
                    arr.pop()
                    arrSize.pop()
                    return ({...values, ['activation_hidden']: arr,['hidden_size']:arrSize, [name]: parseInt(value) })
                }
            });
        }
        else if (valueFields.includes(name)){
            if (name === 'learning_rate'){
                setInputs(values => ({...values, [name]: ( isNaN(parseFloat(value)) || parseFloat(value) === 0) ? 0 : parseFloat(value)}));      
            }
            else{
                setInputs(values => ({...values, [name]: ( isNaN(parseInt(value)) || parseInt(value) === 0) ? 0 : parseInt(value)}));    
            }
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
        if (!inputs.pwrA && !inputs.pwrB && !inputs.pwrC){
            errMsgs.push('Δεν έχει επιλεγεί καμία φάση');
            err = true;
        }
        if (inputs.horizon < 1 || inputs.horizon > 72 ){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρος ορίζοντας πρόβλεψης (1-72)');
            err = true;    
        }
        if (inputs.input_size < 1 || inputs.input_size > 120){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρο πλήθος των νευρώνων εισόδου (1-120)');
            err = true;    
        }
        if (inputs.hidden_size.length !== 0 && inputs.hidden_size.includes(0)){
            errMsgs.push('Δεν έχει προσδιοριστεί το μέγεθος όλων των κρυφών επιπέδων');
            err = true;    
        }
        if (inputs.epochs < 25 || inputs.epochs > 300){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρος αριθμός εποχών εκπαίδευσης (25-300)');
            err = true;    
        }
        if (inputs.learning_rate < 0.0001 || inputs.learning_rate > 0.01){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρος ρυθμός εκπαίδευσης (0.0001-0.01)');
            err = true;    
        }
        if (inputs.batch_size < 16 || inputs.batch_size > 128){
            errMsgs.push('Δεν έχει προσδιοριστεί έγκυρο μέγεθος δέσμης δειγμάτων (16-128)');
            err = true;    
        }
        if (projectNames.names.includes(inputs.project_name.trim())){
            errMsgs.push(`Το όνομα project "${inputs.project_name.trim()}" υπάρχει ήδη`);
            err = true;
        }
        if(err){
            setHasError([err,errMsgs])
        }
        else{
            headerCtx.addPending();
            props.onBack('Menu');
            try{
                const  response = await fetch('http://localhost:8000/completed-nn',{
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

    const createHidden = (layers) => {
        let arr = [];
        for (let i=0 ; i< layers ; i++){
            arr.push(
            <>
                <div className={classes["option"]}>
                    <label htmlFor={`hidden_size${i+1}`}>{`Νευρώνες στο επίπεδο ${i+1}`}</label>
                    <input type="number" min="1" name={`hidden_size${i+1}`} id={`hidden_size${i+1}`} onChange={changeHandler}/>
                </div>
                <div className={classes["dropdown"]}>
                    <label htmlFor={`activation_hidden${i+1}`}>
                        {`Συνάρτηση Ενεργοποίησης επιπέδου ${i+1}`}
                    </label>
                    <select name={`activation_hidden${i+1}`} id={`activation_hidden${i+1}`} onChange={changeHandler}>
                        <option value="relu">ReLu</option>
                        <option value="elu">ELU</option>
                    </select>
                </div>
            </>
            )
        }
        return arr
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
                <h3 className={classes["title"]}>Δημιουργία Νευρωνικού Δικτύου για Πρόβλεψη</h3>
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
                        <label htmlFor="input_size">Πλήθος Νευρώνων Εισόδου</label>
                        <input type="number" min="1" max="100" name="input_size" id="input_size" onChange={changeHandler}/>
                    </div>
                    <div className={classes["option"]}>
                        <label htmlFor="hidden_layers">Πλήθος Κρυφών Επιπέδων</label>
                        <input type="number" min="0" defaultValue={0} name="hidden_layers" id="hidden_layers" onChange={changeHandler}/>
                    </div>
                    {createHidden(inputs.hidden_layers)}
                    <div className={classes["dropdown"]}>
                        <label htmlFor="technique">
                            Μέθοδος-Μοντέλο
                        </label>
                        <select name="technique" id="technique" onChange={changeHandler}>
                            <option value="multioutput">Multioutput</option>
                            <option value="multistep">Multistep</option>
                            <option value="multimodel">Multimodel</option>
                        </select>
                    </div>
                    <div className={classes["option"]}>
                        <label htmlFor="epochs">Εποχές Εκπαίδευσης</label>
                        <input type="number" min="25" max="300" name="epochs" id="epochs" onChange={changeHandler}/>
                    </div>
                    <div className={classes["option"]}>
                        <label htmlFor="learning_rate">Ρυθμός Εκπαίδευσης</label>
                        <input type="number" min="0.0001" max="0.01" name="learning_rate" step={0.0001}  id="learning_rate" onChange={changeHandler}/>
                    </div>
                    <div className={classes["option"]}>
                        <label htmlFor="batch_size">Μέγεθος Δέσμης Δειγμάτων</label>
                        <input type="number" min="16" max="128" name="batch_size" id="batch_size" onChange={changeHandler}/>
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

export default NNForecast;