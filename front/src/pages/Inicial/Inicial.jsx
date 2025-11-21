// Inicial.jsx
// Página inicial centralizada em toda a tela.
// Título "Farmácia Digital" e dois botões vermelhos, um embaixo do outro.

import { useNavigate } from "react-router-dom";
import styles from "./Inicial.module.css";

function Inicial() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Farmácia Digital</h1>
      <div className={styles.buttons}>
        <button
          className={styles.button}
          onClick={() => navigate("/login-cliente")}
        >
          Login Cliente
        </button>
        <button
          className={styles.button}
          onClick={() => navigate("/login-adm")}
        >
          Login Administrador
        </button>
      </div>
    </div>
  );
}

export default Inicial;
