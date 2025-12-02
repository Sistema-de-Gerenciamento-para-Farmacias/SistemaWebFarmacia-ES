import styles from "./NavBarAdm.module.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

/**
 * Barra de navegação lateral para administradores
 * @component
 * @returns {JSX.Element} Sidebar com menus de administração
 */
function NavBarAdm() {
  const navigate = useNavigate(); // Hook para navegação entre rotas
  const { logout, user } = useContext(AuthContext); // Contexto de autenticação

  /**
   * Manipulador de logout do usuário
   * Realiza logout e redireciona para a página inicial
   */
  const handleLogout = () => {
    logout(); // Remove token e dados de autenticação
    navigate("/"); // Redireciona para página inicial
  };

  // Verifica se o usuário atual é um administrador
  const isAdmin = user?.tipoUsuario === 'ADMIN';

  return (
    // Sidebar fixa no lado esquerdo da tela
    <div className={styles.sidebar}>
      {/* Área para informações do usuário (atualmente vazia) */}
      <div className={styles.userInfo}></div>

      {/* Botão para voltar à página inicial pública */}
      <button className={styles.backButton} onClick={() => navigate("/")}>
        Voltar ao Início
      </button>

      {/* Container principal dos links de navegação */}
      <div className={styles.links}>
        {/* Link para a home administrativa */}
        <button className={styles.link} onClick={() => navigate("/homeAdmin")}>
          Home
        </button>

        {/* Link para gerenciamento de clientes */}
        <button className={styles.link} onClick={() => navigate("/listaClientes")}>
          Clientes
        </button>

        {/* Link para gerenciamento de funcionários - APENAS ADMIN */}
        {isAdmin && (
          <button className={styles.link} onClick={() => navigate("/listaFuncionarios")}>
            Funcionários
          </button>
        )}

        {/* Link para gerenciamento de administradores - APENAS ADMIN */}
        {isAdmin && (
          <button className={styles.link} onClick={() => navigate("/listaAdministradores")}>
            Administradores
          </button>
        )}

        {/* Link para visualização de vendas */}
        <button className={styles.link} onClick={() => navigate("/listaVendas")}>
          Vendas
        </button>

        {/* Link para gerenciamento de produtos */}
        <button className={styles.link} onClick={() => navigate("/listarProdutos")}>
          Produtos
        </button>
      </div>

      {/* Botão de logout fixo na parte inferior */}
      <button className={styles.logout} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default NavBarAdm;