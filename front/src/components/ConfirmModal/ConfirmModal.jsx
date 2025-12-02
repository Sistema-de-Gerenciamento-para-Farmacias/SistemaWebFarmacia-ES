// ConfirmModal.jsx
// Modal de confirmação de exclusão

import styles from "./ConfirmModal.module.css";

/**
 * Modal de confirmação genérico para ações críticas
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem de confirmação a ser exibida
 * @param {Function} props.onCancel - Função chamada ao cancelar
 * @param {Function} props.onConfirm - Função chamada ao confirmar
 * @returns {JSX.Element} Modal de confirmação
 */
function ConfirmModal({ message, onCancel, onConfirm }) {
  return (
    // Overlay escuro que cobre toda a tela
    <div className={styles.overlay}>
      {/* Caixa do modal */}
      <div className={styles.box}>
        {/* Mensagem de confirmação */}
        <p>{message}</p>
        {/* Container para os botões de ação */}
        <div className={styles.actions}>
          {/* Botão de cancelar - ação secundária */}
          <button className={styles.cancel} onClick={onCancel}>
            Cancelar
          </button>
          {/* Botão de confirmar - ação primária */}
          <button className={styles.confirm} onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;