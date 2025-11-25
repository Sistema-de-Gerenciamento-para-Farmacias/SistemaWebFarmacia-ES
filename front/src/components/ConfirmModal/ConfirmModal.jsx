// ConfirmModal.jsx
// Modal de confirmação de exclusão

import styles from "./ConfirmModal.module.css";

function ConfirmModal({ message, onCancel, onConfirm }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <p>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Cancelar</button>
          <button className={styles.confirm} onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
