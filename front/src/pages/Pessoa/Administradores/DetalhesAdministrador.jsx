import { useParams, useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/detalhes.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import usuariosDb from "../../../db/DbTempUsuarios";

function DetalhesAdministrador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = usuariosDb.find((u) => String(u.id) === String(id) && u.EhAdmin);

  if (!admin) return <div className={styles.container}>Administrador não encontrado.</div>;

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Detalhes do Administrador</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}><strong>ID:</strong> {admin.id}</div>
          <div className={styles.box}><strong>Nome:</strong> {admin.nome}</div>
          <div className={styles.box}><strong>Email:</strong> {admin.email}</div>
          <div className={styles.box}><strong>É Admin:</strong> {admin.EhAdmin ? "Sim" : "Não"}</div>
          <div className={styles.box}><strong>Senha (hash/demo):</strong> {admin.senha}</div>
          <div className={styles.box}><strong>Token:</strong> {admin.token}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaAdministradores")}>⬅ Voltar</button>
        <button className={styles.editButton} onClick={() => navigate(`/editarAdministrador/${admin.id}`)}>✏️ Editar</button>
      </div>
    </div>
  );
}

export default DetalhesAdministrador;
