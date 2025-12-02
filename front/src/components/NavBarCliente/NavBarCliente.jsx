// front/src/components/NavBarCliente/NavBarCliente.jsx

import styles from "./NavBarCliente.module.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

/**
 * Barra de navegação superior para clientes
 * @component
 * @returns {JSX.Element} Navbar horizontal com opções de cliente
 */
function NavBarCliente() {
  const navigate = useNavigate(); // Hook para navegação
  const { logout } = useContext(AuthContext); // Contexto de autenticação

  /**
   * Manipulador de logout do cliente
   * Realiza logout e redireciona para página inicial
   */
  const handleLogout = () => {
    logout(); // Remove autenticação do cliente
    navigate("/"); // Redireciona para home pública
  };

  return (
    // Navbar principal com layout flex horizontal
    <div className={styles.navbar}>
      {/* Seção esquerda: marca/logo */}
      <div className={styles.left}>
        <div className={styles.brand}>Farmácia Digital</div>
      </div>

      {/* Seção central: botão de logout */}
      <div className={styles.center}>
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Seção direita: links de navegação */}
      <div className={styles.right}>
        {/* Link para home do cliente */}
        <button className={styles.link} onClick={() => navigate("/homeCliente")}>
          Home
        </button>
        {/* Link para página de produtos */}
        <button className={styles.link} onClick={() => navigate("/produtosCliente")}>
          Produtos
        </button>
        {/* Link para carrinho de compras */}
        <button className={styles.link} onClick={() => navigate("/carrinho")}>
          Carrinho
        </button>
        {/* Link para histórico de compras */}
        <button className={styles.link} onClick={() => navigate("/minhasCompras")}>
          Minhas Compras
        </button>
      </div>
    </div>
  );
}

export default NavBarCliente;