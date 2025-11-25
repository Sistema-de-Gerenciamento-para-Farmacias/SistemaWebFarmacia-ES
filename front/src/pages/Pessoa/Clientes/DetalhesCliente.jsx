import { useParams, useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/detalhes.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import clientesDb from "../../../db/DbTempClientes";

function DetalhesCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cliente = clientesDb.find((c) => String(c.id) === String(id));

  if (!cliente) return <div className={styles.container}>Cliente não encontrado.</div>;

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Detalhes do Cliente</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}><strong>ID:</strong> {cliente.id}</div>
          <div className={styles.box}><strong>Nome:</strong> {cliente.nome}</div>
          <div className={styles.box}><strong>CPF:</strong> {cliente.cpf}</div>
          <div className={styles.box}><strong>Telefone:</strong> {cliente.telefone}</div>
          <div className={styles.box}><strong>Email:</strong> {cliente.email}</div>
          <div className={styles.box}><strong>Senha (hash/demo):</strong> {cliente.senha}</div>
          <div className={styles.box}><strong>Token:</strong> {cliente.token}</div>
          <div className={styles.box}><strong>Existe:</strong> {cliente.existe ? "Sim" : "Não"}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaClientes")}>⬅ Voltar</button>
        <button className={styles.editButton} onClick={() => navigate(`/editar-cliente/${cliente.id}`)}>✏️ Editar</button>
      </div>
    </div>
  );
}

export default DetalhesCliente;
