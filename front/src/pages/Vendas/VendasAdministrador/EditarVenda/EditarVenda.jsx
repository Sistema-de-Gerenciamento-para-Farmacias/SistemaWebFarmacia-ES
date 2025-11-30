// front/src/pages/Vendas/VendasAdministrador/EditarVenda/EditarVenda.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarVenda.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function EditarVenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [venda, setVenda] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Estados para busca/filtro dos produtos
  const [produtosBusca, setProdutosBusca] = useState({});
  const [mostrarProdutos, setMostrarProdutos] = useState({});

  useEffect(() => {
    if (token && id) {
      carregarDados();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carrega venda e produtos em paralelo
      const [vendaResponse, produtosResponse] = await Promise.all([
        fetch(`http://localhost:8080/venda/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8080/produto/all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Processa resposta da venda
      if (vendaResponse.ok) {
        const vendaData = await vendaResponse.json();
        
        // Inicializa estados de busca dos produtos
        const produtosBuscaInicial = {};
        const mostrarProdutosInicial = {};
        
        if (vendaData.itens) {
          vendaData.itens.forEach((item, index) => {
            produtosBuscaInicial[index] = item.nomeProduto || '';
            mostrarProdutosInicial[index] = false;
          });
        }
        
        setVenda({
          ...vendaData,
          id: vendaData.idVenda
        });
        
        // Inicializa estados de busca dos produtos
        setProdutosBusca(produtosBuscaInicial);
        setMostrarProdutos(mostrarProdutosInicial);
        
      } else if (vendaResponse.status === 404) {
        setMessage("ERRO: Venda não encontrada.");
        setLoading(false);
        return;
      } else {
        const errorData = await vendaResponse.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar venda'}`);
        setLoading(false);
        return;
      }

      // Processa resposta dos produtos
      if (produtosResponse.ok) {
        const produtosData = await produtosResponse.json();
        // Filtra apenas produtos ativos
        const produtosAtivos = produtosData.filter(produto => !produto.dataExclusao);
        setProdutos(produtosAtivos);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Filtra produtos baseado na busca (apenas nome e fabricante)
  const getProdutosFiltrados = (index) => {
    const busca = produtosBusca[index] || '';
    return produtos.filter(produto =>
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (produto.fabricante && produto.fabricante.toLowerCase().includes(busca.toLowerCase()))
    );
  };

  const handleProdutoBuscaChange = (index, value) => {
    setProdutosBusca(prev => ({
      ...prev,
      [index]: value
    }));
    setMostrarProdutos(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Se o campo estiver vazio, limpa a seleção do produto
    if (!value.trim() && venda) {
      setVenda(prev => {
        const novosItens = [...prev.itens];
        novosItens[index] = {
          ...novosItens[index],
          idProduto: null,
          nomeProduto: '',
          precoUnitario: 0
        };
        return { ...prev, itens: novosItens };
      });
    }
  };

  const selecionarProduto = (index, produto) => {
    setProdutosBusca(prev => ({
      ...prev,
      [index]: `${produto.nome} - ${produto.fabricante || 'Sem laboratório'}`
    }));
    setMostrarProdutos(prev => ({
      ...prev,
      [index]: false
    }));
    
    setVenda(prev => {
      const novosItens = [...prev.itens];
      novosItens[index] = {
        ...novosItens[index],
        idProduto: produto.idProduto,
        nomeProduto: produto.nome,
        precoUnitario: produto.preco
      };
      return { ...prev, itens: novosItens };
    });
  };

  const handleItemChange = (index, field, value) => {
    if (!venda) return;

    setVenda(prev => {
      const novosItens = [...prev.itens];
      
      if (field === 'quantidade') {
        const quantidade = Number(value);
        novosItens[index] = {
          ...novosItens[index],
          quantidade: quantidade > 0 ? quantidade : 1
        };
      }
      
      return { ...prev, itens: novosItens };
    });
  };

  const adicionarItem = () => {
    if (!venda) return;

    const novoIndex = venda.itens.length;
    
    setVenda(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          idProduto: null,
          nomeProduto: '',
          precoUnitario: 0,
          quantidade: 1
        }
      ]
    }));

    // Inicializa estados de busca para o novo item
    setProdutosBusca(prev => ({
      ...prev,
      [novoIndex]: ''
    }));
    setMostrarProdutos(prev => ({
      ...prev,
      [novoIndex]: false
    }));
  };

  const removerItem = (index) => {
    if (!venda) return;

    setVenda(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));

    // Remove estados de busca do item removido
    setProdutosBusca(prev => {
      const novo = { ...prev };
      delete novo[index];
      return novo;
    });
    setMostrarProdutos(prev => {
      const novo = { ...prev };
      delete novo[index];
      return novo;
    });
  };

  const validarFormulario = () => {
    if (!venda.itens || venda.itens.length === 0) {
      setMessage("ERRO: A venda deve ter pelo menos um item.");
      return false;
    }

    for (let i = 0; i < venda.itens.length; i++) {
      const item = venda.itens[i];
      
      if (!item.idProduto) {
        setMessage(`ERRO: Item ${i + 1} deve ter um produto selecionado.`);
        return false;
      }

      if (!item.quantidade || item.quantidade <= 0) {
        setMessage(`ERRO: Item ${i + 1} deve ter quantidade maior que zero.`);
        return false;
      }

      // Verifica estoque (se necessário)
      const produto = produtos.find(p => p.idProduto === item.idProduto);
      if (produto && produto.quantidade !== undefined && item.quantidade > produto.quantidade) {
        setMessage(`ERRO: Quantidade do produto "${produto.nome}" excede o estoque disponível (${produto.quantidade}).`);
        return false;
      }
    }

    return true;
  };

  const salvarVenda = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    setMessage("");

    try {
      // CORREÇÃO: Usar o ID do usuário original da venda
      const idUsuario = venda.usuario?.idPessoa || venda.usuario?.id;

      // CORREÇÃO: Estrutura correta para o backend
      const dadosParaEnviar = {
        idUsuario: idUsuario,
        itens: venda.itens.map(item => ({
          idProduto: item.idProduto,
          quantidade: item.quantidade
        }))
      };

      console.log('📤 Enviando dados para atualização:', dadosParaEnviar);
      console.log('🔍 ID da venda:', id);
      console.log('👤 ID do usuário:', idUsuario);

      const response = await fetch(`http://localhost:8080/venda/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      console.log('📥 Resposta do servidor:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Resposta completa:', responseData);
        
        setMessage("SUCESSO: Venda atualizada com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate("/listaVendas");
        }, 2000);
        
      } else {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.log('📋 Detalhes do erro:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (Array.isArray(errorData)) {
            // Se for array de erros de validação
            errorMessage = errorData.map(err => err.message).join(', ');
          }
        } catch {
          // Ignora erro de parse
        }
        
        setMessage(`ERRO: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando venda...</p>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Venda não encontrada.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listaVendas")}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  const calcularSubtotal = (item) => {
    return (item.precoUnitario || 0) * (item.quantidade || 0);
  };

  const calcularTotal = () => {
    return venda.itens.reduce((total, item) => total + calcularSubtotal(item), 0);
  };

  const formatCpf = (cpf) => {
    if (!cpf) return 'Não informado';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />
      <div className={styles.header}>
        <h2 className={styles.title}>Editar Venda #{venda.idVenda}</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* Cliente Fixo (apenas leitura) */}
          <div className={styles.formSection}>
            <label className={styles.label}>Cliente</label>
            <div className={styles.clienteFixo}>
              <div className={styles.clienteInfoBox}>
                <div className={styles.clienteNome}>{venda.usuario?.nome || 'N/A'}</div>
                <div className={styles.clienteDetalhes}>
                  <strong>CPF:</strong> {formatCpf(venda.usuario?.cpf) || 'Não informado'}
                </div>
                <div className={styles.clienteDetalhes}>
                  <strong>Email:</strong> {venda.usuario?.email || 'N/A'}
                </div>
              </div>
              <div className={styles.clienteAviso}>
                ⓘ O cliente não pode ser alterado
              </div>
            </div>
          </div>

          {/* Itens da Venda com Busca */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>Itens da Venda *</label>
              <button 
                type="button" 
                className={styles.addButton}
                onClick={adicionarItem}
              >
                + Adicionar Item
              </button>
            </div>

            {venda.itens.map((item, index) => {
              const produtosFiltrados = getProdutosFiltrados(index);
              
              return (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.itemGroup}>
                    <label className={styles.sublabel}>Produto</label>
                    <div className={styles.searchContainer}>
                      <input
                        type="text"
                        className={styles.searchInput}
                        value={produtosBusca[index] || ''}
                        onChange={(e) => handleProdutoBuscaChange(index, e.target.value)}
                        onFocus={() => setMostrarProdutos(prev => ({ ...prev, [index]: true }))}
                        placeholder="Digite para buscar produto por nome ou laboratório..."
                        required
                      />
                      
                      {mostrarProdutos[index] && produtosFiltrados.length > 0 && (
                        <div className={styles.dropdown}>
                          {produtosFiltrados.map(produto => (
                            <div
                              key={produto.idProduto}
                              className={styles.dropdownItem}
                              onClick={() => selecionarProduto(index, produto)}
                            >
                              <div className={styles.produtoNome}>{produto.nome}</div>
                              <div className={styles.produtoInfo}>
                                {produto.fabricante || 'Sem laboratório'} - R$ {produto.preco?.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {item.idProduto && (
                      <div className={styles.selectedInfo}>
                        ✅ Selecionado: <strong>{item.nomeProduto}</strong> - R$ {item.precoUnitario?.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className={styles.quantityGroup}>
                    <label className={styles.sublabel}>Quantidade</label>
                    <input 
                      type="number"
                      className={styles.quantityInput}
                      min="1"
                      value={item.quantidade || 1}
                      onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.subtotalGroup}>
                    <label className={styles.sublabel}>Subtotal</label>
                    <div className={styles.subtotalValue}>
                      R$ {calcularSubtotal(item).toFixed(2)}
                    </div>
                  </div>

                  <button 
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removerItem(index)}
                    disabled={venda.itens.length === 1}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total da Venda */}
          <div className={styles.totalSection}>
            <div className={styles.totalLabel}>Total da Venda:</div>
            <div className={styles.totalValue}>R$ {calcularTotal().toFixed(2)}</div>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listaVendas")}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              onClick={salvarVenda}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      {saving && <Loading />}

      {message && (
        <MessageBox 
          message={message} 
          onClose={() => setMessage("")}
          type={message.includes('SUCESSO') ? 'success' : 'error'}
        />
      )}
    </div>
  );
}

export default EditarVenda;