// front/src/components/MessageBox/MessageBox.jsx
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