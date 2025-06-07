
import styles from "./HomeStyles/Home.module.css";

import Navbar from "./components/Navbar";
import Home from "./components/Home";


const HomeApp = () => {
  return (
    <div className={styles.HomeApp}>
      <Navbar />
      <Home/>
      
     
      
      </div>
  );
};

export default HomeApp;