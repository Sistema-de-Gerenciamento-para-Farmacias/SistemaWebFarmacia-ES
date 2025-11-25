// front/src/pages/Produtos/ProdutosAdministrador/ListarProdutos/ListarProdutos.jsx
// Lista de produtos com busca, editar, excluir e ver detalhes

import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./listarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import { AuthContext } from "../../../../context/AuthContext";

import produtosDb from "../../../../db/DbTempProdutos";

function ListarProdutos() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [produtos, setProdutos] = useState(produtosDb);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.fabricante.toLowerCase().includes(termo)
    );
  }, [produtos, busca]);

  const excluirProduto = (id) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
    setMessage("Produto excluído com sucesso!");
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Produtos</h2>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <span className={styles.searchIcon}>🔎</span>
          <input
            type="text"
            placeholder="Buscar por nome ou fabricante..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.createButton}
          onClick={() => navigate("/cadastrarProduto")}
          title="Cadastrar Produto"
        >
          ➕ Cadastrar Produto
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Fabricante</th>
            <th>Preço</th>
            <th className={styles.acoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((p) => (
            <tr key={p.id}>
              <td>
                <img
                  src={p.linkImagem}
                  alt={p.nome}
                  className={styles.produtoImg}
                />
              </td>
              <td>{p.nome}</td>
              <td>{p.fabricante}</td>
              <td>R$ {p.preco.toFixed(2)}</td>
              <td className={styles.actionsCell}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/editarProduto/${p.id}`)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setConfirmId(p.id)}
                  title="Excluir"
                >
                  🗑️
                </button>
                <button
                  className={styles.detailsButton}
                  onClick={() => navigate(`/detalhesProduto/${p.id}`)}
                  title="Ver Detalhes"
                >
                  🔍
                </button>
              </td>
            </tr>
          ))}
          {filtrados.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.empty}>
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir este produto?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirProduto(confirmId)}
        />
      )}

      {message && (
        <MessageBox message={message} onClose={() => setMessage("")} />
      )}
    </div>
  );
}

export default ListarProdutos;
