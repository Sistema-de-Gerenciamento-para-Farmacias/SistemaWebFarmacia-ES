// NavBarAdm.jsx
// Barra lateral vertical para administrador com logout

import styles from "./NavBarAdm.module.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function NavBarAdm() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div className={styles.sidebar}>
      <button className={styles.backButton} onClick={() => navigate("/")}>
        ⬅ Voltar
      </button>
      <div className={styles.links}>
        <button className={styles.link} onClick={() => navigate("/homeAdm")}>
          Área do ADM
        </button>
      </div>
      <button className={styles.logout} onClick={logout}>Logout</button>
    </div>
  );
}

export default NavBarAdm;
