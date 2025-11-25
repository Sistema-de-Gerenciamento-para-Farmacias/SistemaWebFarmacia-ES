import { useParams, useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/detalhes.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import usuariosDb from "../../../db/DbTempUsuarios";

function DetalhesFuncionario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const func = usuariosDb.find((u) => String(u.id) === String(id) && !u.EhAdmin);

  if (!func) return <div className={styles.container}>Funcionário não encontrado.</div>;

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Detalhes do Funcionário</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}><strong>ID:</strong> {func.id}</div>
          <div className={styles.box}><strong>Nome:</strong> {func.nome}</div>
          <div className={styles.box}><strong>Email:</strong> {func.email}</div>
          <div className={styles.box}><strong>É Admin:</strong> {func.EhAdmin ? "Sim" : "Não"}</div>
          <div className={styles.box}><strong>Senha (hash/demo):</strong> {func.senha}</div>
          <div className={styles.box}><strong>Token:</strong> {func.token}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaFuncionarios")}>⬅ Voltar</button>
        <button className={styles.editButton} onClick={() => navigate(`/editar-funcionario/${func.id}`)}>✏️ Editar</button>
      </div>
    </div>
  );
}

export default DetalhesFuncionario;
