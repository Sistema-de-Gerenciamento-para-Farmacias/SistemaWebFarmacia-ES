// MessageBox.jsx
// Caixa de mensagem reutilizável (modal).
// Props:
// - message: texto da mensagem exibida
// - onClose: função chamada ao fechar (X ou OK)

import styles from "./MessageBox.module.css";

function MessageBox({ message, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <button className={styles.close} onClick={onClose}>
          ✖
        </button>
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        <button className={styles.okButton} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default MessageBox;
