// front/src/components/MessageBox/MessageBox.jsx

import styles from "./MessageBox.module.css";

/**
 * Componente de caixa de mensagem/modal informativo
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem a ser exibida
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @returns {JSX.Element} Modal de mensagem com botão de fechar
 */
function MessageBox({ message, onClose }) {
  return (
    // Overlay que cobre o conteúdo da página
    <div className={styles.overlay}>
      {/* Container principal do modal */}
      <div className={styles.box}>
        {/* Botão de fechar (X) no canto superior direito */}
        <button className={styles.close} onClick={onClose}>
          ✖
        </button>
        {/* Container para o conteúdo da mensagem */}
        <div className={styles.content}>
          {/* Mensagem passada como prop */}
          <p>{message}</p>
        </div>
        {/* Botão de confirmação/OK para fechar o modal */}
        <button className={styles.okButton} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default MessageBox;