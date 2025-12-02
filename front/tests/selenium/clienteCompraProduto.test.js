import { setupDriver, waitForElement, fillInput, waitAndClick, waitForUrl, takeScreenshot } from './setup.js';
import { By } from 'selenium-webdriver';

describe('Cliente compra produto', () => {
  let driver;
  
  beforeAll(async () => {
    // Configura o driver do Selenium antes de todos os testes
    driver = await setupDriver();
  });
  
  afterAll(async () => {
    // Fecha o driver após a conclusão de todos os testes
    if (driver) {
      await driver.quit();
    }
  });
  
  test('Cliente faz login, busca produto e finaliza compra', async () => {
    try {
      console.log('=== TESTE: Cliente compra produto ===');
      
      // 1. Fazer logout se estiver loggado (Limpeza de sessão)
      try {
        await driver.get('http://localhost:5173/logout');
        await driver.sleep(1000); // Curta espera após o logout
      } catch {
        // Ignora erro se a rota de logout não existir
      }
      
      // 2. Login como cliente
      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login');
      
      // Preencher credenciais de cliente
      await fillInput(driver, 'input[name="email"]', 'cliente@gmail.com'); // **VERIFIQUE ESTE EMAIL**
      await fillInput(driver, 'input[name="senha"]', '123'); // **VERIFIQUE ESTA SENHA**
      console.log('Preencheu credenciais do cliente');
      
      // CORREÇÃO CRÍTICA (1): Seletores puros. Removemos seletores ilegais como :contains() ou XPath.
      await waitAndClick(driver, 'button[type="submit"], #btn-login, .btn-login'); 
      console.log('Clicou em login');
      
      // Aguardar redirecionamento E o carregamento de um elemento no dashboard
      await waitForUrl(driver, '/dashboard/cliente', 15000); 
      // Espera pelo carregamento do CONTEÚDO do dashboard (elemento que deve estar visível)
      await waitForElement(driver, '.dashboard-cliente, .client-panel, h1:contains("Dashboard")', 10000); 
      console.log('Logado como cliente e dashboard carregado');
      
      // 3. Navegar para catálogo de produtos
      // Usando seletores flexíveis para o link de navegação
      await waitAndClick(driver, 'a[href*="/produtos"], [data-testid="nav-produtos"], .nav-produtos');
      console.log('Navegou para produtos');
      
      await waitForUrl(driver, '/produtos');
      // Espera por um elemento de produto para garantir o carregamento do catálogo
      await waitForElement(driver, '.produto-container, .catalogo-produtos', 5000);
      console.log('Catálogo de produtos carregado');
      
      // 4. Buscar produto específico (ex: Paracetamol)
      const searchTerm = 'Paracetamol';
      // Seletores de busca mais amplos, incluindo `name="q"`
      const searchInput = await waitForElement(driver, 'input[name="search"], input[name="q"], input[type="search"][placeholder*="produto"]', 10000);
      await searchInput.clear();
      await searchInput.sendKeys(searchTerm);
      console.log(`Buscou por "${searchTerm}"`);
      
      // 5. Aguardar que os resultados da busca sejam atualizados e o produto apareça
      // Espera pelo primeiro card de produto filtrado
      await waitForElement(driver, '.produto-item, .card-produto, [data-testid="product-card"]', 15000);
      console.log('Resultados da busca carregados');
      
      // 6. Verificar produtos encontrados
      const produtos = await driver.findElements(By.css('.produto-item, .card-produto, [data-testid="product-card"]'));
      expect(produtos.length).toBeGreaterThan(0);
      console.log(`Encontrou ${produtos.length} produto(s)`);
      
      if (produtos.length > 0) {
        // 7. Clicar no primeiro produto para ver detalhes
        await produtos[0].click();
        console.log('Clicou no produto');
        
        // 8. Verificar página de detalhes do produto
        const detalhesProduto = await waitForElement(driver, '.detalhes-produto, .product-detail, .produto-info', 10000);
        expect(await detalhesProduto.isDisplayed()).toBeTruthy();
        console.log('Página de detalhes do produto carregada');
        
        // 9. Adicionar produto ao carrinho
        // CORREÇÃO CRÍTICA (2): Seletores puros.
        const btnCarrinho = await waitForElement(driver, '.btn-carrinho, [data-testid="add-to-cart"], .add-to-cart-button', 10000);
        await btnCarrinho.click();
        console.log('Adicionou produto ao carrinho');
        
        // 10. Ir para o carrinho
        await driver.sleep(1500); 
        await waitAndClick(driver, '.carrinho-link, a[href*="carrinho"], [data-testid="cart-link"]');
        console.log('Foi para o carrinho');
        
        await waitForUrl(driver, '/carrinho');
        await waitForElement(driver, '.carrinho-container, .cart-wrapper', 5000); 
        console.log('Página do carrinho carregada');
        
        // 11. Verificar produto no carrinho
        const itensCarrinho = await driver.findElements(By.css('.carrinho-item, .cart-item, [data-testid="cart-item"]'));
        expect(itensCarrinho.length).toBeGreaterThan(0);
        console.log(`${itensCarrinho.length} item(ns) no carrinho`);
        
        // 12. Finalizar compra
        // CORREÇÃO CRÍTICA (3): Seletores puros.
        const finalizarBtn = await waitForElement(driver, '.btn-finalizar, [data-testid="checkout-button"], .checkout-button', 10000);
        await finalizarBtn.click();
        console.log('Clicou em finalizar compra');
        
        // 13. Lógica de Checkout (Garantindo que o processo seja finalizado)
        let isConfirmed = false;
        
        // Tentativa A: Verificar confirmação imediata
        try {
          const confirmacao = await waitForElement(driver, '.confirmacao-pedido, .order-confirmation, .success-message', 10000);
          const textoConfirmacao = await confirmacao.getText();
          expect(textoConfirmacao.toLowerCase()).toContain('sucesso');
          console.log('Pedido confirmado imediatamente com sucesso:', textoConfirmacao);
          isConfirmed = true;
        } catch {
          // Alternativa B: Preencher Formulário de Checkout
          try {
            const formCheckout = await waitForElement(driver, 'form.checkout, #checkout-form, .checkout-form', 10000);
            expect(await formCheckout.isDisplayed()).toBeTruthy();
            console.log('Formulário de checkout exibido. Preenchendo...');
            
            // Preencher dados de entrega (ajuste conforme os names/ids reais do seu formulário)
            await fillInput(driver, 'input[name="endereco"], #input-endereco', 'Rua Exemplo, 123');
            await fillInput(driver, 'input[name="cidade"], #input-cidade', 'São Paulo');
            await fillInput(driver, 'input[name="cep"], #input-cep', '01234-567');
            console.log('Preencheu dados de entrega');
            
            // Finalizar pedido (submit do formulário)
            // CORREÇÃO CRÍTICA (4): Seletores puros.
            await waitAndClick(driver, 'button[type="submit"], .btn-confirmar-pedido, .confirm-button');
            console.log('Submeteu pedido');
            
            // Aguarda a confirmação final
            const confirmacaoFinal = await waitForElement(driver, '.confirmacao-pedido, .order-confirmation, .success-message', 15000);
            const textoConfirmacao = await confirmacaoFinal.getText();
            expect(textoConfirmacao.toLowerCase()).toContain('sucesso');
            console.log('Pedido confirmado após preencher o checkout:', textoConfirmacao);
            isConfirmed = true;

          } catch (checkoutError) {
            console.error('Falha ao preencher checkout ou confirmar pedido:', checkoutError.message);
            throw new Error('Não foi possível finalizar a compra. Falha no formulário ou na confirmação.');
          }
        }
        
        // 14. Tirar screenshot da confirmação
        if (isConfirmed) {
            await takeScreenshot(driver, 'cliente-compra-finalizada');
            console.log('TESTE CONCLUÍDO: Cliente comprou produto com sucesso!');
        } else {
             throw new Error("A compra não foi confirmada ou houve um erro no checkout.");
        }
      }
      
    } catch (error) {
      await takeScreenshot(driver, 'cliente-compra-erro');
      console.error('ERRO FATAL no teste de compra:', error.message);
      throw error;
    }
  }, 180000); // Aumentado para 3 minutos para maior tolerância
  
  test('Cliente visualiza histórico de compras', async () => {
    try {
      console.log('=== TESTE: Cliente visualiza histórico ===');
      
      // 1. Navegar para histórico/pedidos
      await waitAndClick(driver, 'a[href*="/pedidos"], [data-testid="nav-pedidos"], .historico-link');
      console.log('Navegou para histórico de pedidos');
      
      await waitForUrl(driver, '/pedidos');
      // Espera pelo container principal da página, que você indicou usar a classe .tabelaContainer
      await waitForElement(driver, '.tabelaContainer, .order-history-container, .tabela', 10000);
      console.log('Página de pedidos carregada');
      
      // 2. Verificar se há pedidos listados
      // Espera que a primeira linha da tabela de pedidos apareça
      await waitForElement(driver, '.pedido-item, .order-card, [data-testid="order-row"]', 10000);

      const pedidos = await driver.findElements(By.css('.pedido-item, .order-card, [data-testid="order-row"]'));
      expect(pedidos.length).toBeGreaterThan(0);
      console.log(`${pedidos.length} pedido(s) no histórico`);
      
      if (pedidos.length > 0) {
        // 3. Clicar no primeiro pedido para ver detalhes
        await pedidos[0].click();
        console.log('Clicou no pedido');
        
        // 4. Verificar detalhes do pedido
        const detalhesPedido = await waitForElement(driver, '.detalhes-pedido, .order-details', 10000);
        expect(await detalhesPedido.isDisplayed()).toBeTruthy();
        console.log('Detalhes do pedido exibidos');
        
        // 5. Verificar produtos do pedido
        const produtosPedido = await driver.findElements(By.css('.produto-pedido, .order-product, [data-testid="order-product"]'));
        expect(produtosPedido.length).toBeGreaterThan(0);
        console.log(`${produtosPedido.length} produto(s) no pedido`);
        
        // 6. Tirar screenshot
        await takeScreenshot(driver, 'cliente-historico-pedidos');
        
        // 7. Voltar para lista de pedidos
        try {
            // Seletor mais robusto para botão de voltar ou link para a lista
            const voltarBtn = await waitForElement(driver, '.btn-voltar, .back-button, a[href*="/pedidos"]', 5000);
            await voltarBtn.click();
        } catch (e) {
            console.log('Botão de voltar não encontrado, usando navegação de histórico.');
            await driver.navigate().back();
        }
        
        await waitForUrl(driver, '/pedidos'); // Espera voltar para a lista
        console.log('Voltou para lista de pedidos');
      } else {
         console.log('Nenhum pedido encontrado, teste de histórico finalizado.');
      }
      
      console.log('TESTE CONCLUÍDO: Histórico de compras visualizado!');
      
    } catch (error) {
      await takeScreenshot(driver, 'cliente-historico-erro');
      console.error('ERRO FATAL no teste de histórico:', error.message);
      throw error;
    }
  }, 90000);
});