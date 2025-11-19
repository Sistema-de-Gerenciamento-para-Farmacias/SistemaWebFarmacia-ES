// Loading.jsx
// Componente de carregamento reutilizável.
// Pode ser usado em qualquer tela durante requisições ou mudanças de rota.

import styles from "./Loading.module.css";

function Loading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Carregando...</p>
    </div>
  );
}

export default Loading;
