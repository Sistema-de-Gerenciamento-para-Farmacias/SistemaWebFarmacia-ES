// NavBarCliente.jsx
// Barra de navegação do cliente com links principais e botão de logout.

import styles from "./NavBarCliente.module.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function NavBarCliente() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div className={styles.navbar}>
      {/* Esquerda */}
      <div className={styles.left}>Farmácia Digital</div>

      {/* Centro */}
      <div className={styles.center}>
        <button
          className={styles.logout}
          onClick={() => {
            logout();
            navigate("/login-cliente"); // redireciona para login após logout
          }}
        >
          Logout
        </button>
      </div>

      {/* Direita */}
      <div className={styles.right}>
        <button className={styles.link} onClick={() => navigate("/homeCliente")}>
          Home
        </button>
        <button className={styles.link} onClick={() => navigate("/produtosCliente")}>
          Produtos
        </button>
        <button className={styles.link} onClick={() => navigate("/carrinho")}>
          Carrinho
        </button>
        <button className={styles.link} onClick={() => navigate("/minhasCompras")}>
          Minhas Compras
        </button>
      </div>
    </div>
  );
}

export default NavBarCliente;
