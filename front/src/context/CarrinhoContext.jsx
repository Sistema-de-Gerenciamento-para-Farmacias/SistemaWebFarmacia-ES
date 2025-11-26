import { createContext, useState } from "react";

export const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);

  const adicionarAoCarrinho = (produto, quantidade = 1) => {
    setCarrinho((prev) => {
      const existe = prev.find((it) => it.idProduto === produto.id);
      if (existe) {
        return prev.map((it) =>
          it.idProduto === produto.id
            ? { ...it, quantidade: it.quantidade + quantidade }
            : it
        );
      }
      return [...prev, { 
        idProduto: produto.id, 
        quantidade, 
        nomeProduto: produto.nome, 
        preco: produto.preco 
      }];
    });
  };

  const removerDoCarrinho = (idProduto) => {
    setCarrinho((prev) => prev.filter((it) => it.idProduto !== idProduto));
  };

  const atualizarQuantidade = (idProduto, quantidade) => {
    setCarrinho((prev) =>
      prev.map((it) =>
        it.idProduto === idProduto 
          ? { ...it, quantidade: Math.max(1, quantidade) } 
          : it
      )
    );
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarAoCarrinho,
        removerDoCarrinho,
        atualizarQuantidade,
        limparCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}
