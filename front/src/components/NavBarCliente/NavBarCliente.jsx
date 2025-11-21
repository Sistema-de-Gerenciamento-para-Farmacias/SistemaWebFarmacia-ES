// NavBarCliente.jsx
// Barra superior para cliente com textos e hover

import styles from "./NavBarCliente.module.css";
import { useNavigate } from "react-router-dom";

function NavBarCliente({ logout }) {
  const navigate = useNavigate();

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>Farmácia Digital</div>

      <button className={styles.logout} onClick={logout}>Logout</button>

      <div className={styles.right}>
        <button className={styles.icon} onClick={() => navigate("/carrinho")}>
          🛒 Carrinho
        </button>
        <button className={styles.icon} onClick={() => navigate("/compras")}>
          📦 Visualizar compras
        </button>
      </div>
    </div>
  );
}

export default NavBarCliente;
