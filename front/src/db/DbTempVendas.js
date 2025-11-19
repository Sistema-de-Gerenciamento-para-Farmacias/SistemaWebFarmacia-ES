// DbTempVendas.js
// Simulação de tabela VENDA + ITENSVENDA com vendas fictícias

const vendas = [
  {
    id: 1,
    idCliente: 1,
    dataCompra: "2025-11-01",
    itens: [
      { idProduto: 1, quantidade: 2 }, // Paracetamol
      { idProduto: 4, quantidade: 1 }, // Vitamina C
    ],
  },
  {
    id: 2,
    idCliente: 2,
    dataCompra: "2025-11-05",
    itens: [
      { idProduto: 2, quantidade: 1 }, // Ibuprofeno
      { idProduto: 5, quantidade: 2 }, // Amoxicilina
      { idProduto: 9, quantidade: 1 }, // Losartana
    ],
  },
  {
    id: 3,
    idCliente: 1,
    dataCompra: "2025-11-10",
    itens: [
      { idProduto: 3, quantidade: 3 }, // Dipirona
      { idProduto: 6, quantidade: 1 }, // Omeprazol
    ],
  },
];

export default vendas;
