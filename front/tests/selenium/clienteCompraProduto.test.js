// front/tests/selenium/clienteCompraProduto.test.js
import { setupDriver, waitForElement, fillInput, waitAndClick, waitForUrl, takeScreenshot } from './setup.js';
import { By } from 'selenium-webdriver';

describe('Cliente compra produto', () => {
  let driver;
  
  beforeAll(async () => {
    driver = await setupDriver();
  });
  
  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });
  
  test('Cliente faz login, busca produto e finaliza compra', async () => {
    try {
      console.log('=== TESTE: Cliente compra produto ===');
      
      // 1. Fazer logout se estiver loggado
      try {
        await driver.get('http://localhost:5173/logout');
        await driver.sleep(2000);
      } catch {
        // Ignora erro se não houver logout
      }
      
      // 2. Login como cliente
      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login');
      
      // Preencher credenciais de cliente
      await fillInput(driver, 'input[name="email"]', 'cliente@gmail.com'); // AJUSTE ESTE EMAIL
      await fillInput(driver, 'input[name="senha"]', '123'); // AJUSTE ESTA SENHA
      console.log('Preencheu credenciais do cliente');
      
      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Clicou em login');
      
      // Aguardar redirecionamento para dashboard do cliente
      await waitForUrl(driver, '/dashboard/cliente');
      console.log('Logado como cliente');
      
      // 3. Navegar para catálogo de produtos
      await waitAndClick(driver, 'a[href*="produtos"], .nav-produtos, [class*="produtos"]');
      console.log('Navegou para produtos');
      
      await waitForUrl(driver, '/produtos');
      console.log('Catálogo de produtos carregado');
      
      // 4. Buscar produto específico (ex: Paracetamol)
      const searchInput = await waitForElement(driver, 'input[type="search"][placeholder*="produto"], input[placeholder*="buscar"]', 10000);
      await searchInput.clear();
      await searchInput.sendKeys('Paracetamol');
      console.log('Buscou por "Paracetamol"');
      
      // Aguardar resultados da busca
      await driver.sleep(2000);
      
      // 5. Verificar produtos encontrados
      const produtos = await driver.findElements(By.css('.produto-item, .card-produto, .product-card'));
      expect(produtos.length).toBeGreaterThan(0);
      console.log(`Encontrou ${produtos.length} produto(s)`);
      
      if (produtos.length > 0) {
        // 6. Clicar no primeiro produto para ver detalhes
        await produtos[0].click();
        console.log('Clicou no produto');
        
        await driver.sleep(2000);
        
        // 7. Verificar página de detalhes do produto
        const detalhesProduto = await waitForElement(driver, '.detalhes-produto, .product-detail, .produto-info', 10000);
        expect(await detalhesProduto.isDisplayed()).toBeTruthy();
        console.log('Página de detalhes do produto carregada');
        
        // 8. Adicionar produto ao carrinho
        const btnCarrinho = await waitForElement(driver, '.btn-carrinho, .add-to-cart, button:contains("Adicionar")', 10000);
        await btnCarrinho.click();
        console.log('Adicionou produto ao carrinho');
        
        // 9. Verificar mensagem de confirmação
        await driver.sleep(1000);
        
        // 10. Ir para o carrinho
        await waitAndClick(driver, '.carrinho-link, a[href*="carrinho"], .cart-icon');
        console.log('Foi para o carrinho');
        
        await waitForUrl(driver, '/carrinho');
        console.log('Página do carrinho carregada');
        
        // 11. Verificar produto no carrinho
        const itensCarrinho = await driver.findElements(By.css('.carrinho-item, .cart-item'));
        expect(itensCarrinho.length).toBeGreaterThan(0);
        console.log(`${itensCarrinho.length} item(ns) no carrinho`);
        
        // 12. Finalizar compra
        const finalizarBtn = await waitForElement(driver, '.btn-finalizar, .checkout-button, button:contains("Finalizar")', 10000);
        await finalizarBtn.click();
        console.log('Clicou em finalizar compra');
        
        // 13. Verificar página de checkout/pedido
        await driver.sleep(2000);
        
        // Pode ser página de checkout ou confirmação
        const currentUrl = await driver.getCurrentUrl();
        console.log(`URL atual: ${currentUrl}`);
        
        // 14. Verificar elementos de confirmação
        try {
          const confirmacao = await waitForElement(driver, '.confirmacao-pedido, .order-confirmation, .success-message', 10000);
          const textoConfirmacao = await confirmacao.getText();
          expect(textoConfirmacao.toLowerCase()).toContain('sucesso');
          console.log('Pedido confirmado com sucesso:', textoConfirmacao);
        } catch {
          // Alternativa: verificar formulário de checkout
          const formCheckout = await waitForElement(driver, 'form.checkout, #checkout-form', 10000);
          expect(await formCheckout.isDisplayed()).toBeTruthy();
          console.log('Formulário de checkout exibido');
          
          // Preencher dados de entrega (exemplo básico)
          await fillInput(driver, 'input[name="endereco"]', 'Rua Exemplo, 123');
          await fillInput(driver, 'input[name="cidade"]', 'São Paulo');
          await fillInput(driver, 'input[name="cep"]', '01234-567');
          console.log('Preencheu dados de entrega');
          
          // Finalizar pedido
          await waitAndClick(driver, 'button[type="submit"]');
          console.log('Submeteu pedido');
          
          await driver.sleep(3000);
        }
        
        // 15. Tirar screenshot da confirmação
        await takeScreenshot(driver, 'cliente-compra-finalizada');
        
        console.log('TESTE CONCLUÍDO: Cliente comprou produto com sucesso!');
      }
      
    } catch (error) {
      await takeScreenshot(driver, 'cliente-compra-erro');
      console.error('ERRO no teste de compra do cliente:', error.message);
      throw error;
    }
  }, 120000); // Timeout de 2 minutos
  
  test('Cliente visualiza histórico de compras', async () => {
    try {
      console.log('=== TESTE: Cliente visualiza histórico ===');
      
      // 1. Navegar para histórico/pedidos
      await waitAndClick(driver, 'a[href*="pedidos"], .nav-pedidos, .historico-link');
      console.log('Navegou para histórico de pedidos');
      
      await waitForUrl(driver, '/pedidos');
      console.log('Página de pedidos carregada');
      
      // 2. Verificar se há pedidos listados
      const pedidos = await driver.findElements(By.css('.pedido-item, .order-card, tr.pedido'));
      expect(pedidos.length).toBeGreaterThan(0);
      console.log(`${pedidos.length} pedido(s) no histórico`);
      
      if (pedidos.length > 0) {
        // 3. Clicar no primeiro pedido para ver detalhes
        await pedidos[0].click();
        console.log('Clicou no pedido');
        
        await driver.sleep(2000);
        
        // 4. Verificar detalhes do pedido
        const detalhesPedido = await waitForElement(driver, '.detalhes-pedido, .order-details', 10000);
        expect(await detalhesPedido.isDisplayed()).toBeTruthy();
        console.log('Detalhes do pedido exibidos');
        
        // 5. Verificar produtos do pedido
        const produtosPedido = await driver.findElements(By.css('.produto-pedido, .order-product'));
        expect(produtosPedido.length).toBeGreaterThan(0);
        console.log(`${produtosPedido.length} produto(s) no pedido`);
        
        // 6. Tirar screenshot
        await takeScreenshot(driver, 'cliente-historico-pedidos');
        
        // 7. Voltar para lista de pedidos
        const voltarBtn = await driver.findElement(By.css('.btn-voltar, .back-button'));
        await voltarBtn.click();
        console.log('Voltou para lista de pedidos');
      }
      
      console.log('TESTE CONCLUÍDO: Histórico de compras visualizado!');
      
    } catch (error) {
      await takeScreenshot(driver, 'cliente-historico-erro');
      console.error('ERRO no teste de histórico:', error.message);
      throw error;
    }
  }, 60000);
});