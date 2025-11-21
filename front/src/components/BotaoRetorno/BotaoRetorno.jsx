// BotaoRetorno.jsx
// Componente que renderiza um botão fixo no topo esquerdo da tela.
// Ao clicar, volta para a página anterior usando useNavigate(-1).

import { useNavigate } from "react-router-dom";
import styles from "./BotaoRetorno.module.css";

function BotaoRetorno() {
  const navigate = useNavigate();

  return (
    <button className={styles.botao} onClick={() => navigate(-1)}>
      <span className={styles.seta}>&#x276E;</span>
    </button>
  );
}

export default BotaoRetorno;
