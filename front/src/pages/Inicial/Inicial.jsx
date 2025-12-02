// front/src/pages/Inicial/Inicial.jsx

import { useNavigate } from "react-router-dom";
import styles from "./Inicial.module.css";

/**
 * Componente da página inicial - Primeira tela do sistema
 * @component
 * @returns {JSX.Element} Tela de boas-vindas com opção de login
 * @description Página de entrada do sistema, apresenta breve mensagem e direciona para login
 */
function Inicial() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();

  /**
   * Renderiza a página inicial
   * Interface mínima com título e botão de login
   */
  return (
    <div className={styles.container}>
      {/* Título principal da página */}
      <h1 className={styles.title}>Bem vindo a farmácia digital</h1>
      
      {/* Container para botões de ação */}
      <div className={styles.buttons}>
        {/* Botão principal para acessar a tela de login */}
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