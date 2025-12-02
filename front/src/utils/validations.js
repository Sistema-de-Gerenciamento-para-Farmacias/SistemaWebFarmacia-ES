// front/src/utils/validations.js

/**
 * Validações e formatações reutilizáveis para o sistema
 * @module validations
 */

/**
 * Valida todos os campos do formulário de cadastro de cliente
 * @param {Object} formData - Dados do formulário
 * @param {string} formData.nome - Nome do cliente
 * @param {string} formData.email - Email do cliente
 * @param {string} formData.senha - Senha do cliente
 * @param {string} formData.cpf - CPF do cliente
 * @param {string} formData.telefone - Telefone do cliente
 * @returns {Object} Objeto com validação e mensagem de erro (se houver)
 */
export const validarCamposCliente = (formData) => {
  // Valida campos obrigatórios
  if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.telefone) {
    return { valido: false, mensagem: "ERRO: você deve preencher todos os campos" };
  }

  // Remove formatação para validação numérica
  const cpfNumerico = formData.cpf.replace(/\D/g, '');
  const telefoneNumerico = formData.telefone.replace(/\D/g, '');

  // Validações específicas usando expressões regulares
  const cpfOK = /^\d{11}$/.test(cpfNumerico);
  const telOK = /^\d{10,11}$/.test(telefoneNumerico);
  const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const senhaOK = formData.senha.length >= 3;

  // Mensagens específicas para cada erro de validação
  if (!cpfOK) {
    return { valido: false, mensagem: "ERRO: CPF deve ter 11 dígitos" };
  }
  if (!telOK) {
    return { valido: false, mensagem: "ERRO: Telefone deve ter 10 ou 11 dígitos" };
  }
  if (!emailOK) {
    return { valido: false, mensagem: "ERRO: Email inválido" };
  }
  if (!senhaOK) {
    return { valido: false, mensagem: "ERRO: Senha deve ter pelo menos 3 caracteres" };
  }

  return { valido: true, mensagem: "" };
};

/**
 * Valida todos os campos do formulário de cadastro de produto
 * @param {Object} formData - Dados do formulário
 * @param {string} formData.nome - Nome do produto
 * @param {string} formData.fabricante - Fabricante do produto
 * @param {string|number} formData.preco - Preço do produto
 * @param {string} formData.dataValidade - Data de validade do produto
 * @param {string} formData.linkImagem - Link da imagem do produto
 * @returns {Object} Objeto com validação e mensagem de erro (se houver)
 */
export const validarFormularioProduto = (formData) => {
  const { nome, fabricante, preco, dataValidade, linkImagem } = formData;

  // Valida campos obrigatórios
  if (!nome || !fabricante || !preco || !dataValidade) {
    return { valido: false, mensagem: "ERRO: Nome, fabricante, preço e data de validade são obrigatórios" };
  }

  // Valida comprimento máximo do nome
  if (nome.length > 100) {
    return { valido: false, mensagem: "ERRO: O nome não pode exceder 100 caracteres" };
  }

  // Converte preço para número
  const precoNumero = parseFloat(preco);
  
  // Valida valor do preço
  if (isNaN(precoNumero) || precoNumero <= 0) {
    return { valido: false, mensagem: "ERRO: O preço deve ser maior que zero" };
  }

  // Valida comprimento do link da imagem
  if (linkImagem && linkImagem.length > 255) {
    return { valido: false, mensagem: "ERRO: O link da imagem não pode exceder 255 caracteres" };
  }

  // Valida data de validade (não pode ser no passado)
  const dataValidadeObj = new Date(dataValidade);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataValidadeObj.setHours(0, 0, 0, 0);

  if (dataValidadeObj < hoje) {
    return { valido: false, mensagem: "ERRO: A data de validade deve ser hoje ou futura" };
  }

  return { valido: true, mensagem: "" };
};

/**
 * Formata CPF durante a digitação: 12345678901 -> 123.456.789-01
 * @param {string} value - CPF sem formatação
 * @returns {string} CPF formatado
 */
export const formatarCPF = (value) => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // Para números parciais, retorna apenas números
  return numbers;
};

/**
 * Formata telefone durante a digitação: 11999998888 -> (11) 99999-8888
 * @param {string} value - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export const formatarTelefone = (value) => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Para números parciais, retorna apenas números
  return numbers;
};

/**
 * Retorna a data mínima permitida para validade (hoje)
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const getDataMinima = () => {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
};

/**
 * Valida se um CPF é válido (algoritmo de validação)
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se o CPF é válido
 */
export const validarCPFCompleto = (cpf) => {
  if (!cpf) return false;
  
  const cpfNumerico = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfNumerico.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfNumerico)) return false;
  
  // Algoritmo de validação de CPF
  let soma = 0;
  let resto;
  
  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfNumerico.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfNumerico.substring(9, 10))) return false;
  
  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfNumerico.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfNumerico.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida se uma URL é válida
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se a URL é válida
 */
export const validarURL = (url) => {
  if (!url) return true; // Campo opcional
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};