// Loading.jsx
// Componente de carregamento reutilizável.
// Pode ser usado em qualquer tela durante requisições ou mudanças de rota.

import styles from "./Loading.module.css";

/**
 * Componente de loading/indicador de carregamento
 * @component
 * @returns {JSX.Element} Overlay de carregamento com spinner
 */
function Loading() {
  return (
    // Overlay que cobre toda a tela durante o carregamento
    <div className={styles.overlay}>
      {/* Elemento de spinner/animado para indicar processamento */}
      <div className={styles.spinner}></div>
      {/* Texto informativo para o usuário */}
      <p className={styles.text}>Carregando...</p>
    </div>
  );
}

export default Loading;