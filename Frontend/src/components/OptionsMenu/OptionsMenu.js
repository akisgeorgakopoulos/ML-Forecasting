import React, {useEffect} from 'react';
import classes from './OptionsMenu.module.css';

const OptionsMenu = props => {
    
    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])
      
    const backToWelcomeHandler = () => {
        props.onChangeState('Welcome')
    }
    const toPhasesHandler = () => {
        props.onChangeState('Phases Plots')
    }
    const toForecastHandler = () => {
        props.onChangeState('New Forecast')
    }
    const toNeuralHandler = () => {
        props.onChangeState('New Neural')
    }
    const toCompletedHandler = () => {
        props.onChangeState('Completed Forecasts')
    }

    return(
        <>
            <button className={classes["back-button"]} onClick={backToWelcomeHandler}>Πίσω</button>
            <div className={classes["options"]}>
                <h1 className={classes['title']}>ΜΕΝΟΥ</h1> 
                <ul className={classes["options-list"]}>
                    <li className={classes["option"]}>
                        <div>
                            <h2>ΕΠΙΣΚΟΠΗΣΗ ΔΕΔΟΜΕΝΩΝ</h2>
                            <p>Για καθεμία από τις τρείς φάσεις επιλέγουμε το χρονικό διάστημα εντός του οποίου θέλουμε να δούμε την κάθε 
                                χρονοσειρά. Στην επιλογή μας δεν λαμβάνονται υπόψιν τα λεπτά, αλλά μόνο η ημερομηνία και η ώρα. Αρχικά, βλέπουμε
                                ολόκληρες τις χρονοσειρές μας.
                            </p>
                            <button className={classes["option-button"]} onClick={toPhasesHandler}>Προβολή</button>
                        </div>
                    </li>
                    <li className={classes["option"]}>
                        <div>
                            <h2>ΝΕΑ ΠΡΟΒΛΕΨΗ ΜΗΧΑΝΙΚΗΣ ΜΑΘΗΣΗΣ</h2>
                            <p>
                                Δημιουργία νέας πρόβλεψης χρησιμοποιώντας όποιους από τους αλγορίθμους μηχανικής μάθησης θέλουμε. Παράλληλα,
                                επιλέγουμε την μέθοδο βελτιστοποίσης των υπερπαραμέτρων καθενός απ'τους αλγορίθμους, κάτι που επηρεάζει την 
                                απόδοση και τον χρόνο ολοκλήρωσης. Επιλέγουμε ορίζοντα πρόβλεψης και μέγεθος δειγμάτων
                                εκπαίδευσης των αλγορίθμων.
                            </p>
                            <button className={classes["option-button"]} onClick={toForecastHandler}>ML Πρόβλεψη</button>
                        </div>
                    </li>
                    <li className={classes["option"]}>
                        <div>
                            <h2>ΝΕΑ ΠΡΟΒΛΕΨΗ ΝΕΥΡΩΝΙΚΟΥ ΔΙΚΤΥΟΥ</h2>
                            <p>
                                Δημιουργία πρόβλεψης μέσω νευρωνικού δικτύου. Επιλέγουμε πλήθος κρυφών επιπέδων, αριθμό νευρώνων σε αυτά
                                καθώς και στα στρώματα εισόδου και εξόδου. Διαμορφώνουμε την εκπαίδευση του δικτύου ρυθμίζοντας τις αντίστοιχες παραμέτρους. 
                            </p>
                            <button className={classes["option-button"]} onClick={toNeuralHandler}>NN Πρόβλεψη</button>
                        </div>
                    </li>
                    <li className={classes["option"]}>
                        <div>
                            <h2>ΟΛΟΚΛΗΡΩΜΕΝΕΣ ΠΡΟΒΛΕΨΕΙΣ</h2>
                            <p> Προβλέψεις, είτε με νευρωνικά δίκτυα είτε με αλγορίθμους μηχανικής μάθησης, που έχουν ολοκληρωθεί. 
                                Κάθεμια από αυτές περιέχει πληροφορίες για τον καλύτερο αλγόριθμο βάσει MAPE, τα σκορ όλων των επιλεγμένων αλγορίθμων, την ημερομηνία ολοκλήρωσης
                                καθώς και περισσότερες πληροφορίες για τον "νικητή" αλγορίθμο. 
                            </p>
                            <button className={classes["option-button"]} onClick={toCompletedHandler}>Προβλέψεις</button>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    );
}

export default OptionsMenu;