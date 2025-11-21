// HomeAdm.jsx
// Página principal do administrador com relatórios

import { useState } from "react";
import styles from "./HomeAdm.module.css";
import NavBarAdm from "../../components/NavBarAdm/NavBarAdm";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function HomeAdm() {
  const [tipo, setTipo] = useState("clientes");

  // Dados fictícios para clientes
  const clientesData = {
    labels: ["Ativos", "Inativos"],
    datasets: [
      {
        label: "Clientes",
        data: [2, 0], // DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO
        backgroundColor: ["#0055ff", "#ccc"],
      },
    ],
  };

  // Dados fictícios para vendas
  const vendasData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai"],
    datasets: [
      {
        label: "Vendas",
        data: [5, 8, 3, 10, 7], // DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO
        borderColor: "#0055ff",
        backgroundColor: "rgba(0,85,255,0.3)",
      },
    ],
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />
      <h2 className={styles.title}>Relatórios</h2>
      <div className={styles.controls}>
        <button
          className={tipo === "clientes" ? styles.active : ""}
          onClick={() => setTipo("clientes")}
        >
          Clientes
        </button>
        <button
          className={tipo === "vendas" ? styles.active : ""}
          onClick={() => setTipo("vendas")}
        >
          Vendas
        </button>
      </div>
      <div className={styles.chartBox}>
        {tipo === "clientes" ? (
          <Bar data={clientesData} />
        ) : (
          <Line data={vendasData} />
        )}
      </div>
    </div>
  );
}

export default HomeAdm;
