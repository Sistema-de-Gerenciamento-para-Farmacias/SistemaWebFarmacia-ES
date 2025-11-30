// front/src/components/NavBarAdm/NavBarAdm.jsx
import styles from "./NavBarAdm.module.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function NavBarAdm() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.userInfo}>
      </div>
      
      <button className={styles.backButton} onClick={() => navigate("/")}>
        Voltar ao Início
      </button>
      <div className={styles.links}>
        <button className={styles.link} onClick={() => navigate("/homeAdmin")}>
          Home
        </button>
        <button className={styles.link} onClick={() => navigate("/listaClientes")}>
          Clientes
        </button>
        <button className={styles.link} onClick={() => navigate("/listaFuncionarios")}>
          Funcionários
        </button>
        <button className={styles.link} onClick={() => navigate("/listaAdministradores")}>
          Administradores
        </button>
        <button className={styles.link} onClick={() => navigate("/listaVendas")}>
          Vendas
        </button>
        <button className={styles.link} onClick={() => navigate("/listarProdutos")}>
          Produtos
        </button>
      </div>
      <button className={styles.logout} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default NavBarAdm;