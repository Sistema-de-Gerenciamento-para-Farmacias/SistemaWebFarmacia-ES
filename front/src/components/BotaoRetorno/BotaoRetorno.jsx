// BotaoRetorno.jsx
// Componente que renderiza um botão fixo no topo esquerdo da tela.
// Ao clicar, volta para a página anterior usando useNavigate(-1).

import { useNavigate } from "react-router-dom";
import styles from "./BotaoRetorno.module.css";

/**
 * Componente de botão de retorno para navegação
 * @component
 * @returns {JSX.Element} Botão de retorno estilizado
 */
function BotaoRetorno() {
  const navigate = useNavigate(); // Hook do React Router para navegação programática

  return (
    <button className={styles.botao} onClick={() => navigate(-1)}>
      {/* Seta Unicode que aponta para a esquerda, indicando retorno */}
      <span className={styles.seta}>&#x276E;</span>
    </button>
  );
}

export default BotaoRetorno;