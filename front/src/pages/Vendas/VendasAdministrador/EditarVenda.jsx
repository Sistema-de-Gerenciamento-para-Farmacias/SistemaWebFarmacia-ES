import { useState, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./styles/detalhes.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import MessageBox from "../../../components/MessageBox/MessageBox";
import vendasDb from "../../../db/DbTempVendas";
import clientesDb from "../../../db/DbTempClientes";
import produtosDb from "../../../db/DbTempProdutos";

function EditarVenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendaOrig = vendasDb.find((v) => String(v.id) === String(id));
  const [message, setMessage] = useState("");

  if (!vendaOrig) return <div className={styles.container}>Venda não encontrada.</div>;

  const [clienteInput, setClienteInput] = useState(() => {
    const cli = clientesDb.find((c) => c.id === vendaOrig.idCliente);
    return cli ? cli.nome : "";
  });
  const [selectedCliente, setSelectedCliente] = useState(() => vendaOrig.idCliente || null);

  const [itens, setItens] = useState(() => vendaOrig.itens.map(it => ({...it})));

  const filteredClientes = useMemo(() => {
    const t = clienteInput.toLowerCase().trim();
    return clientesDb.filter(c => c.nome.toLowerCase().includes(t) || c.cpf?.replace(/\D/g, "").includes(t.replace(/\D/g, "")));
  }, [clienteInput]);

  const onSelectCliente = (c) => {
    setClienteInput(c.nome);
    setSelectedCliente(c.id);
  }

  const onAddItem = () => {
    setItens(prev => [...prev, { idProduto: null, quantidade: 1, produtoInput: "" }]);
  }

  const onRemoveItem = (index) => {
    setItens(prev => prev.filter((_,i) => i !== index));
  }

  const onChangeProdutoInput = (index, value) => {
    // find matches and set a temporary product name field on item
    setItens(prev => {
      const copy = [...prev];
      // when user types, clear any previously selected idProduto to force reselect
      copy[index] = {...copy[index], produtoInput: value, idProduto: null};
      return copy;
    });
  }

  const onSelectProduto = (index, produto) => {
    setItens(prev => {
      const copy = [...prev];
      copy[index] = {...copy[index], idProduto: produto.id, produtoInput: produto.nome, quantidade: 1};
      return copy;
    });
  }

  const onChangeQuantidade = (index, value) => {
    // allow empty string while typing
    const raw = String(value);
    const numeric = raw === "" ? "" : Number(raw);
    setItens(prev => {
      const copy = [...prev];
      const item = {...copy[index]};
      const prod = produtosDb.find(p => p.id === item.idProduto);
      if (prod && numeric !== "" && numeric > prod.qtd) {
        item.quantidade = prod.qtd;
        setMessage(`Quantidade máxima disponível para ${prod.nome}: ${prod.qtd}`);
      } else {
        item.quantidade = numeric;
        setMessage("");
      }
      copy[index] = item;
      return copy;
    });
  }

  const onSave = () => {
    if (!selectedCliente) { setMessage("Selecione um cliente válido antes de salvar."); return; }
    if (!itens || itens.length === 0) {
      setMessage("A venda deve ter ao menos um produto.");
      return;
    }
    // validate all items have product id and quantity >0
    for (let it of itens) {
      if (!it.idProduto) { setMessage("Todos os itens devem ter um produto selecionado."); return; }
      if (it.quantidade === "" || it.quantidade === null || it.quantidade === undefined || Number(it.quantidade) <= 0) { setMessage("Todas as quantidades devem ser maiores que zero."); return; }
      const prod = produtosDb.find(p => p.id === it.idProduto);
      if (prod && Number(it.quantidade) > prod.qtd) { setMessage(`Quantidade do produto ${prod.nome} excede estoque.`); return; }
    }
    // valid: simulate save
    setMessage("Venda atualizada (simulada) com sucesso.");
    setTimeout(() => navigate("/listarVendas"), 800);
  }

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Editar Venda</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}>
            <strong>Cliente:</strong>
            <div style={{position: 'relative'}}>
              <input
                value={clienteInput}
                onChange={(e) => { setClienteInput(e.target.value); setSelectedCliente(null); }}
                placeholder="Procure por nome ou CPF..."
                style={{width: '100%', padding: '8px', marginTop: '8px'}}
              />
              {clienteInput && !selectedCliente && filteredClientes.length > 0 && (
                <ul style={{position: 'absolute', left: 0, right: 0, background: '#fff', zIndex: 20, maxHeight: 150, overflow: 'auto', border: '1px solid #ddd', marginTop: 4, borderRadius: 6}}>
                  {filteredClientes.map((c) => (
                    <li key={c.id} style={{padding: 8, cursor: 'pointer'}} onClick={() => onSelectCliente(c)}>
                      {c.nome} {c.cpf ? `— ${c.cpf}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.box}>
            <strong>Itens da Venda:</strong>
            <div>
              {itens.map((it, index) => {
                const prod = produtosDb.find(p => p.id === it.idProduto);
                const produtoInput = it.produtoInput ?? (prod ? prod.nome : "");
                const filteredProdutos = produtosDb.filter(p => p.nome.toLowerCase().includes((produtoInput||"").toLowerCase()));

                return (
                  <div key={index} style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
                    <div style={{flex:1}}>
                      <input
                        value={produtoInput}
                        onChange={(e) => onChangeProdutoInput(index, e.target.value)}
                        placeholder="Filtrar produto..."
                        style={{width:'100%', padding:8}}
                      />
                      {produtoInput && !it.idProduto && filteredProdutos.length > 0 && (
                        <ul style={{position:'absolute', background:'#fff', zIndex:20, maxHeight:150, overflow:'auto', border:'1px solid #ddd', marginTop:4, borderRadius:6}}>
                          {filteredProdutos.map(p => (
                            <li key={p.id} style={{padding:8, cursor:'pointer'}} onClick={() => onSelectProduto(index, p)}>{p.nome} — Estoque: {p.qtd}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div style={{width:120}}>
                      <input type="number" value={it.quantidade} min={1} onChange={(e) => onChangeQuantidade(index, e.target.value)} style={{width:'100%', padding:8}} />
                    </div>

                    <button onClick={() => onRemoveItem(index)} style={{background:'#ff3333', color:'#fff', border:'none', padding:'8px 10px', borderRadius:6}}>✖</button>
                  </div>
                )
              })}

              <div style={{marginTop:12}}>
                <button onClick={onAddItem} style={{background:'#0055ff', color:'#fff', border:'none', padding:'8px 12px', borderRadius:6}}>➕ Adicionar item</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className={styles.actions} style={{marginTop:20}}>
        <button className={styles.backButton} onClick={() => navigate("/listarVendas")}>⬅ Voltar</button>
        <button className={styles.editButton} onClick={onSave}>💾 Salvar</button>
      </div>

      {message && <MessageBox message={message} onClose={() => setMessage("")} />}
    </div>
  )
}

export default EditarVenda;
