// HomeAdm.jsx
// Página principal protegida.
// Mostra o token do usuário logado e um botão de logout.

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import styles from "./HomeAdm.module.css";
import BotaoRetorno from "../../components/BotaoRetorno/BotaoRetorno";

function HomeAdm() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <BotaoRetorno />
      <h1>HomeAdm Administrador</h1>
      <p>Token: {user?.token}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

export default HomeAdm;
