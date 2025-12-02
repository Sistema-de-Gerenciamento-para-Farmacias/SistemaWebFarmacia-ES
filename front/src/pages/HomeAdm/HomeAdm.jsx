// front/src/pages/HomeAdm/HomeAdm.jsx

import { useState, useEffect, useContext } from "react";
import styles from "./HomeAdm.module.css";
import NavBarAdm from "../../components/NavBarAdm/NavBarAdm";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { AuthContext } from "../../context/AuthContext";
import Loading from "../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

// Registrar componentes do Chart.js necessários para os gráficos
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Componente da página inicial do administrador com dashboard de métricas
 * @component
 * @returns {JSX.Element} Dashboard administrativo com gráficos e estatísticas
 */
function HomeAdm() {
  // Estado para controlar qual tipo de gráfico está ativo
  const [tipo, setTipo] = useState("vendas");
  
  // Estado para armazenar todos os dados do dashboard
  const [dados, setDados] = useState(null);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Obtém token de autenticação do contexto
  const { token } = useContext(AuthContext);

  /**
   * Efeito para carregar dados quando o componente é montado
   * Executa sempre que o token muda (após login/logout)
   */
  useEffect(() => {
    if (token) {
      carregarDados();
    }
  }, [token]);

  /**
   * Carrega dados do backend para popular o dashboard
   * @async
   * @description Faz requisições paralelas para vendas, clientes e produtos
   */
  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carrega dados em paralelo para melhor performance
      const [vendasResponse, clientesResponse, produtosResponse] = await Promise.all([
        fetch(`${API_URL}/venda/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/pessoa/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/produto/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Verifica se todas as respostas foram bem sucedidas
      if (vendasResponse.ok && clientesResponse.ok && produtosResponse.ok) {
        const vendas = await vendasResponse.json();
        const clientes = await clientesResponse.json();
        const produtos = await produtosResponse.json();

        // Processa os dados brutos para o formato necessário
        processarDados(vendas, clientes, produtos);
      } else {
        console.error('Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processa dados brutos do backend para o formato do dashboard
   * @param {Array} vendas - Lista de todas as vendas
   * @param {Array} clientes - Lista de todos os clientes/pessoas
   * @param {Array} produtos - Lista de todos os produtos
   */
  const processarDados = (vendas, clientes, produtos) => {
    // Processar dados de clientes por tipo de usuário
    const clientesAtivos = clientes.filter(c => !c.dataExclusao && c.tipoUsuario === 'USER').length;
    const clientesInativos = clientes.filter(c => c.dataExclusao && c.tipoUsuario === 'USER').length;
    const funcionarios = clientes.filter(c => !c.dataExclusao && c.tipoUsuario === 'EMPLOY').length;
    const administradores = clientes.filter(c => !c.dataExclusao && c.tipoUsuario === 'ADMIN').length;

    // Processar dados de vendas (últimos 6 meses)
    const vendasPorMes = processarVendasPorMes(vendas);
    const vendasAtivas = vendas.filter(v => !v.dataExclusao).length;
    const vendasCanceladas = vendas.filter(v => v.dataExclusao).length;

    // Processar dados de produtos
    const produtosAtivos = produtos.filter(p => !p.dataExclusao).length;
    const produtosInativos = produtos.filter(p => p.dataExclusao).length;
    const produtosMaisVendidos = processarProdutosMaisVendidos(vendas, produtos);

    // Atualiza estado com todos os dados processados
    setDados({
      clientes: {
        ativos: clientesAtivos,
        inativos: clientesInativos,
        funcionarios,
        administradores,
        total: clientesAtivos + clientesInativos
      },
      vendas: {
        porMes: vendasPorMes,
        ativas: vendasAtivas,
        canceladas: vendasCanceladas,
        total: vendasAtivas + vendasCanceladas,
        valorTotal: calcularValorTotalVendas(vendas)
      },
      produtos: {
        ativos: produtosAtivos,
        inativos: produtosInativos,
        total: produtosAtivos + produtosInativos,
        maisVendidos: produtosMaisVendidos.slice(0, 5) // Top 5 produtos mais vendidos
      }
    });
  };

  /**
   * Processa vendas por mês (últimos 6 meses)
   * @param {Array} vendas - Lista de todas as vendas
   * @returns {Object} Dados organizados por mês
   */
  const processarVendasPorMes = (vendas) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const vendasPorMes = new Array(6).fill(0);
    const valoresPorMes = new Array(6).fill(0);
    
    const hoje = new Date();
    const vendasFiltradas = vendas.filter(v => !v.dataExclusao);
    
    // Contabiliza vendas por mês
    vendasFiltradas.forEach(venda => {
      const dataVenda = new Date(venda.dataCompra);
      const diffMeses = (hoje.getFullYear() - dataVenda.getFullYear()) * 12 + (hoje.getMonth() - dataVenda.getMonth());
      
      if (diffMeses < 6) {
        const index = 5 - diffMeses;
        if (index >= 0 && index < 6) {
          vendasPorMes[index]++;
          valoresPorMes[index] += calcularValorTotalVenda(venda);
        }
      }
    });

    return {
      meses: meses.slice(hoje.getMonth() - 5, hoje.getMonth() + 1),
      quantidades: vendasPorMes,
      valores: valoresPorMes
    };
  };

  /**
   * Processa os produtos mais vendidos
   * @param {Array} vendas - Lista de todas as vendas
   * @param {Array} produtos - Lista de todos os produtos
   * @returns {Array} Lista ordenada de produtos mais vendidos
   */
  const processarProdutosMaisVendidos = (vendas, produtos) => {
    const contagemProdutos = {};
    
    // Contabiliza quantidade vendida por produto
    vendas.filter(v => !v.dataExclusao).forEach(venda => {
      if (venda.itens) {
        venda.itens.forEach(item => {
          const produtoId = item.idProduto;
          contagemProdutos[produtoId] = (contagemProdutos[produtoId] || 0) + item.quantidade;
        });
      }
    });

    // Mapeia IDs para objetos completos de produto
    return Object.entries(contagemProdutos)
      .map(([id, quantidade]) => {
        const produto = produtos.find(p => p.idProduto == id);
        return {
          nome: produto?.nome || `Produto ${id}`,
          quantidade,
          valor: produto?.preco || 0
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade); // Ordena por quantidade (decrescente)
  };

  /**
   * Calcula valor total de uma venda específica
   * @param {Object} venda - Objeto de venda
   * @returns {number} Valor total da venda
   */
  const calcularValorTotalVenda = (venda) => {
    if (!venda.itens) return 0;
    return venda.itens.reduce((total, item) => {
      return total + (item.precoUnitario * item.quantidade);
    }, 0);
  };

  /**
   * Calcula valor total de todas as vendas
   * @param {Array} vendas - Lista de todas as vendas
   * @returns {number} Valor total das vendas
   */
  const calcularValorTotalVendas = (vendas) => {
    return vendas.filter(v => !v.dataExclusao).reduce((total, venda) => {
      return total + calcularValorTotalVenda(venda);
    }, 0);
  };

  // Configurações comuns para todos os gráficos
  const opcoesComuns = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Dados para gráfico de distribuição de clientes
  const dadosClientes = {
    labels: ['Ativos', 'Inativos', 'Funcionários', 'Administradores'],
    datasets: [
      {
        label: 'Quantidade',
        data: dados ? [
          dados.clientes.ativos,
          dados.clientes.inativos,
          dados.clientes.funcionarios,
          dados.clientes.administradores
        ] : [0, 0, 0, 0],
        backgroundColor: [
          '#0055ff',  // Azul para clientes ativos
          '#ff4444',  // Vermelho para clientes inativos
          '#00C49F',  // Verde para funcionários
          '#FFBB28'   // Amarelo para administradores
        ],
      },
    ],
  };

  // Dados para gráfico de vendas por mês
  const dadosVendas = {
    labels: dados?.vendas.porMes.meses || [],
    datasets: [
      {
        label: 'Quantidade de Vendas',
        data: dados?.vendas.porMes.quantidades || [],
        borderColor: '#0055ff',
        backgroundColor: 'rgba(0, 85, 255, 0.1)',
        yAxisID: 'y',
      }
    ],
  };

  // Configurações específicas para gráfico de vendas (duplo eixo Y)
  const opcoesVendas = {
    ...opcoesComuns,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Quantidade'
        }
      },
    },
  };

  // Dados para gráfico de produtos mais vendidos
  const dadosProdutos = {
    labels: dados?.produtos.maisVendidos.map(p => p.nome) || [],
    datasets: [
      {
        label: 'Quantidade Vendida',
        data: dados?.produtos.maisVendidos.map(p => p.quantidade) || [],
        backgroundColor: [
          '#0055ff',
          '#00C49F',
          '#FFBB28',
          '#FF8042',
          '#8884d8'
        ],
      },
    ],
  };

  /**
   * Renderiza estado de carregamento
   * Mostra componente Loading enquanto dados são carregados
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza o dashboard administrativo completo
   * Inclui cards de resumo, controles e gráficos
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />
      
      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Administrativo</h1>
        <button className={styles.reloadButton} onClick={carregarDados}>
          Atualizar Dados
        </button>
      </div>

      {/* Cards de resumo com métricas principais */}
      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <h3>Total de Clientes</h3>
          <div className={styles.cardValue}>{dados?.clientes.total || 0}</div>
          <div className={styles.cardDetail}>
            <span className={styles.positive}>{dados?.clientes.ativos || 0} ativos</span>
            <span className={styles.negative}>{dados?.clientes.inativos || 0} inativos</span>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Total de Vendas</h3>
          <div className={styles.cardValue}>{dados?.vendas.total || 0}</div>
          <div className={styles.cardDetail}>
            <span className={styles.positive}>{dados?.vendas.ativas || 0} ativas</span>
            <span className={styles.negative}>{dados?.vendas.canceladas || 0} canceladas</span>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Faturamento Total</h3>
          <div className={styles.cardValue}>R$ {(dados?.vendas.valorTotal || 0).toFixed(2)}</div>
          <div className={styles.cardDetail}>
            <span>Últimos 6 meses</span>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Produtos Cadastrados</h3>
          <div className={styles.cardValue}>{dados?.produtos.total || 0}</div>
          <div className={styles.cardDetail}>
            <span className={styles.positive}>{dados?.produtos.ativos || 0} ativos</span>
            <span className={styles.negative}>{dados?.produtos.inativos || 0} inativos</span>
          </div>
        </div>
      </div>

      {/* Controles para alternar entre tipos de gráfico */}
      <div className={styles.controls}>
        <button
          className={tipo === "vendas" ? styles.active : ""}
          onClick={() => setTipo("vendas")}
        >
          📈 Vendas
        </button>
        <button
          className={tipo === "clientes" ? styles.active : ""}
          onClick={() => setTipo("clientes")}
        >
          👥 Clientes
        </button>
        <button
          className={tipo === "produtos" ? styles.active : ""}
          onClick={() => setTipo("produtos")}
        >
          📦 Produtos
        </button>
      </div>

      {/* Container principal para os gráficos */}
      <div className={styles.chartsContainer}>
        {/* Gráfico de distribuição de clientes */}
        {tipo === "clientes" && (
          <div className={styles.chartBox}>
            <h3>Distribuição de Usuários</h3>
            <Bar data={dadosClientes} options={opcoesComuns} />
          </div>
        )}

        {/* Gráfico de vendas por mês */}
        {tipo === "vendas" && (
          <div className={styles.chartBox}>
            <h3>Vendas dos Últimos 6 Meses</h3>
            <Line data={dadosVendas} options={opcoesVendas} />
          </div>
        )}

        {/* Gráfico de produtos mais vendidos */}
        {tipo === "produtos" && (
          <div className={styles.chartBox}>
            <h3>Produtos Mais Vendidos</h3>
            <Doughnut data={dadosProdutos} options={opcoesComuns} />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeAdm;