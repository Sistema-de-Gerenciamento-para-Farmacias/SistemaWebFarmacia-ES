// front/src/pages/Inicial/Inicial.jsx
import { useNavigate } from "react-router-dom";
import styles from "./Inicial.module.css";

/**
 * Componente da página inicial - Primeira tela do sistema
 * Oferece acesso ao login para usuários existentes
 */
function Inicial() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bem vindo a farmácia digital</h1>
      <div className={styles.buttons}>
        <button
          className={styles.button}
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Inicial;