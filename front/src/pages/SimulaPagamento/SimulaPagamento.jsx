// front/src/pages/SimulaPagamento/SimulaPagamento.jsx
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CarrinhoContext } from "../../context/CarrinhoContext";
import MessageBox from "../../components/MessageBox/MessageBox";
import Loading from "../../components/Loading/Loading";
import styles from "./SimulaPagamento.module.css";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para simulação de pagamento e finalização de compra
 * @component
 * @returns {JSX.Element} Página de pagamento com formulário e resumo do pedido
 */
export function SimulaPagamento() {
  // Hook para acessar o estado da navegação
  const location = useLocation();
  
  // Hook para navegação programática
  const navigate = useNavigate();
  
  // Contextos para autenticação e carrinho
  const { token, user } = useContext(AuthContext);
  const { limparCarrinho } = useContext(CarrinhoContext);
  
  // Estados para controle do componente
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
  });

  // Obtém dados da venda passados pela navegação ou inicializa com valores padrão
  const { itensVenda, total, carrinhoItens } = location.state || { 
    itensVenda: [], 
    total: 0, 
    carrinhoItens: [] 
  };

  /**
   * Manipula mudanças nos campos do formulário
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formata número do cartão: "1234567890123456" -> "1234 5678 9012 3456"
    if (name === "numeroCartao") {
      formattedValue = value
        .replace(/\D/g, "") // Remove não dígitos
        .replace(/(\d{4})(?=\d)/g, "$1 ") // Adiciona espaço a cada 4 dígitos
        .slice(0, 19); // Limita a 19 caracteres (16 dígitos + 3 espaços)
    }
    
    // Formata data de validade: "1225" -> "12/25"
    if (name === "validade") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(?=\d)/, "$1/")
        .slice(0, 5);
    }
    
    // Limita CVV a 4 dígitos numéricos
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    
    // Atualiza estado do formulário
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  /**
   * Valida os dados do formulário de pagamento
   * @returns {boolean} true se válido, false se inválido
   */
  const validarFormulario = () => {
    // Valida número do cartão (mínimo 13 dígitos após remover espaços)
    if (!form.numeroCartao || form.numeroCartao.replace(/\s/g, "").length < 13) {
      setMensagem("Número de cartão inválido");
      return false;
    }
    
    // Valida nome do titular (não pode estar vazio)
    if (!form.nomeCartao.trim()) {
      setMensagem("Nome do titular inválido");
      return false;
    }
    
    // Valida data de validade (formato MM/AA completo)
    if (!form.validade || form.validade.length !== 5) {
      setMensagem("Validade inválida (MM/AA)");
      return false;
    }
    
    // Valida CVV (mínimo 3 dígitos)
    if (!form.cvv || form.cvv.length < 3) {
      setMensagem("CVV inválido");
      return false;
    }
    
    return true;
  };

  /**
   * Busca o ID do usuário logado no backend
   * @async
   * @returns {Promise<number|null>} ID do usuário ou null se não encontrado
   */
  const buscarUsuarioLogado = async () => {
    try {
      // Requisição para obter todas as pessoas cadastradas
      const response = await fetch(`${API_URL}/pessoa/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pessoas = await response.json();
        // Encontra usuário pelo email do token
        const usuarioLogado = pessoas.find(p => p.email === user?.email);
        return usuarioLogado?.id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  };

  /**
   * Cria uma nova venda no backend
   * @async
   * @returns {Promise<Object>} Dados da venda criada
   * @throws {Error} Se ocorrer erro na criação
   */
  const criarVenda = async () => {
    try {
      // Obtém ID do usuário logado
      const idUsuario = await buscarUsuarioLogado();
      
      if (!idUsuario) {
        throw new Error('Não foi possível identificar o usuário');
      }

      // Requisição para criar venda
      const response = await fetch(`${API_URL}/venda/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idUsuario: idUsuario, // ID numérico do usuário
          itens: itensVenda
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar venda');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Remove itens do carrinho após a compra
   * @async
   * @returns {Promise<boolean>} true se removido com sucesso
   */
  const removerItensDoCarrinho = async () => {
    try {
      // Cria array de promessas para remover cada item do carrinho
      const promises = carrinhoItens.map(item => 
        fetch(`${API_URL}/carrinho/remover/${item.idItemCarrinho}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      // Executa todas as requisições em paralelo
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao remover itens do carrinho:', error);
      return false;
    }
  };

  /**
   * Processa a confirmação do pagamento
   * @async
   */
  const handleConfirmar = async () => {
    // Valida formulário
    if (!validarFormulario()) {
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    // Verifica autenticação
    if (!user || !token) {
      setMensagem("Usuário não autenticado");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    // Verifica se há itens para comprar
    if (itensVenda.length === 0) {
      setMensagem("Nenhum item selecionado para compra");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    setProcessando(true);

    try {
      // 1. Criar a venda no backend
      const vendaCriada = await criarVenda();
      
      // 2. Remover itens do carrinho
      await removerItensDoCarrinho();
      
      // 3. Atualizar contexto local
      await limparCarrinho();
      
      // 4. Feedback de sucesso
      setMensagem("Compra realizada com sucesso!");
      
      // 5. Redireciona para página de compras após 2 segundos
      setTimeout(() => {
        navigate("/minhasCompras", { 
          replace: true,
          state: { vendaRecente: vendaCriada }
        });
      }, 2000);

    } catch (error) {
      console.error('Erro ao processar compra:', error);
      setMensagem(`Erro ao processar compra: ${error.message}`);
    } finally {
      setProcessando(false);
      setTimeout(() => setMensagem(""), 5000);
    }
  };

  /**
   * Cancela o processo de pagamento e volta ao carrinho
   */
  const handleCancelar = () => {
    navigate("/carrinho");
  };

  // Renderização para carrinho vazio
  if (itensVenda.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.vazio}>
          <h2>🛒 Nenhum item selecionado</h2>
          <p>Volte ao carrinho para selecionar os itens desejados.</p>
          <button 
            className={styles.btnVoltar}
            onClick={() => navigate("/carrinho")}
          >
            Voltar ao Carrinho
          </button>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>💳 Finalizar Compra</h1>

      <div className={styles.content}>
        {/* Resumo do pedido */}
        <div className={styles.resumo}>
          <h3>📦 Resumo do Pedido</h3>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {carrinhoItens.map((item) => (
                <tr key={item.idItemCarrinho}>
                  <td className={styles.nomeProduto}>{item.nomeProduto}</td>
                  <td className={styles.quantidade}>{item.quantidade}</td>
                  <td className={styles.precoUnitario}>R$ {item.precoUnitario?.toFixed(2)}</td>
                  <td className={styles.subtotal}>
                    R$ {((item.precoUnitario || 0) * item.quantidade).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.totalResumo}>
            <div className={styles.totalItem}>
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className={styles.totalItem}>
              <span>Frete:</span>
              <span>Grátis</span>
            </div>
            <div className={styles.totalFinal}>
              <strong>Total: R$ {total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Formulário de pagamento */}
        <form className={styles.formulario} onSubmit={(e) => e.preventDefault()}>
          <h3>💳 Dados de Pagamento</h3>

          <div className={styles.formGroup}>
            <label>Número do Cartão:</label>
            <input
              type="text"
              name="numeroCartao"
              value={form.numeroCartao}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              disabled={processando}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nome do Titular:</label>
            <input
              type="text"
              name="nomeCartao"
              value={form.nomeCartao}
              onChange={handleChange}
              placeholder="NOME COMPLETO"
              disabled={processando}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Validade (MM/AA):</label>
              <input
                type="text"
                name="validade"
                value={form.validade}
                onChange={handleChange}
                placeholder="12/25"
                maxLength="5"
                disabled={processando}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>CVV:</label>
              <input
                type="text"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength="4"
                disabled={processando}
                className={styles.input}
              />
            </div>
          </div>

          {/* Indicador de segurança */}
          <div className={styles.infoSeguranca}>
            <div className={styles.iconeSeguranca}>🔒</div>
            <span>Pagamento 100% seguro</span>
          </div>

          {/* Botões de ação */}
          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={handleCancelar}
              disabled={processando}
            >
              ↩️ Cancelar
            </button>
            <button
              type="button"
              className={styles.btnConfirmar}
              onClick={handleConfirmar}
              disabled={processando}
            >
              {processando ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Processando...
                </>
              ) : (
                "✅ Confirmar Pagamento"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Componente de mensagem para feedback */}
      {mensagem && (
        <MessageBox 
          message={mensagem} 
          onClose={() => setMensagem("")}
          type={mensagem.includes('❌') ? 'error' : 'success'}
        />
      )}
    </div>
  );
}

export default SimulaPagamento;