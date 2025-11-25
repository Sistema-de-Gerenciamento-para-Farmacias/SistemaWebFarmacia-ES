// NavBarAdm.jsx
// Barra lateral vertical para administrador com navegação

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
        ⬅ Voltar ao Início
      </button>
      <div className={styles.links}>
        <button className={styles.link} onClick={() => navigate("/listaClientes")}>
          Clientes
        </button>
        <button className={styles.link} onClick={() => navigate("/listaFuncionarios")}>
          Funcionários
        </button>
        <button className={styles.link} onClick={() => navigate("/listaAdms")}>
          Administradores
        </button>
      </div>
      <button className={styles.logout} onClick={logout}>Logout</button>
    </div>
  );
}

export default NavBarAdm;
