// front/tests/selenium/funcionarioVisualizaCliente.test.js
import { setupDriver, waitForElement, fillInput, waitAndClick, waitForUrl, takeScreenshot } from './setup.js';
import { By, Key } from 'selenium-webdriver';

describe('Funcionário visualiza cliente específico', () => {
  let driver;
  
  beforeAll(async () => {
    driver = await setupDriver();
  });
  
  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });
  
  test('Funcionário faz login e visualiza detalhes de um cliente', async () => {
    try {
      console.log('=== TESTE: Funcionário visualiza cliente específico ===');
      
      // 1. Login como funcionário
      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login');
      
      // Preencher credenciais de funcionário (ajuste conforme seu sistema)
      await fillInput(driver, 'input[name="email"]', 'func@gmail.com');
      await fillInput(driver, 'input[name="senha"]', '123');
      console.log('Preencheu credenciais do funcionário');
      
      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Clicou em login');
      
      // Aguardar redirecionamento
      await waitForUrl(driver, '/dashboard/funcionario');
      console.log('Logado como funcionário');
      
      // 2. Navegar para página de clientes
      await waitAndClick(driver, 'a[href*="clientes"], .nav-clientes, [class*="clientes"]');
      console.log('Navegou para página de clientes');
      
      await waitForUrl(driver, '/clientes');
      console.log('Página de clientes carregada');
      
      // 3. Buscar cliente específico (ex: João Silva)
      const searchInput = await waitForElement(driver, 'input[type="search"], input[placeholder*="buscar"], input[placeholder*="pesquisar"]', 10000);
      await searchInput.clear();
      await searchInput.sendKeys('João Silva');
      await searchInput.sendKeys(Key.RETURN);
      console.log('Buscou por "João Silva"');
      
      await driver.sleep(2000); // Aguardar resultados
      
      // 4. Verificar se cliente aparece nos resultados
      const resultados = await driver.findElements(By.css('.cliente-item, .card-cliente, tr.cliente'));
      expect(resultados.length).toBeGreaterThan(0);
      console.log(`Encontrou ${resultados.length} cliente(s) na busca`);
      
      // 5. Clicar no primeiro cliente para ver detalhes
      if (resultados.length > 0) {
        await resultados[0].click();
        console.log('Clicou no cliente');
        
        // Aguardar página de detalhes
        await driver.sleep(2000);
        
        // 6. Verificar detalhes do cliente
        const detalhesCliente = await waitForElement(driver, '.detalhes-cliente, .cliente-detail, .profile-card', 10000);
        expect(await detalhesCliente.isDisplayed()).toBeTruthy();
        console.log('Detalhes do cliente carregados');
        
        // 7. Verificar informações específicas
        const nomeCliente = await driver.findElement(By.css('.cliente-nome, h2, h3')).getText();
        expect(nomeCliente).toContain('João');
        console.log(`Nome do cliente: ${nomeCliente}`);
        
        // Verificar se informações de contato estão presentes
        const elementosInfo = await driver.findElements(By.css('.cliente-info, .info-item, .contact-info'));
        expect(elementosInfo.length).toBeGreaterThan(0);
        console.log(`${elementosInfo.length} informações exibidas`);
        
        // 8. Tirar screenshot
        await takeScreenshot(driver, 'funcionario-visualiza-cliente');
        
        // 9. Voltar para lista de clientes
        const voltarBtn = await driver.findElement(By.css('.btn-voltar, .back-button, a[href*="clientes"]'));
        await voltarBtn.click();
        console.log('Voltou para lista de clientes');
        
        await waitForUrl(driver, '/clientes');
        console.log('Lista de clientes recarregada');
      }
      
      console.log('TESTE CONCLUÍDO: Funcionário visualizou cliente com sucesso!');
      
    } catch (error) {
      await takeScreenshot(driver, 'funcionario-cliente-erro');
      console.error('ERRO no teste de visualização de cliente:', error.message);
      throw error;
    }
  }, 90000); // Timeout de 90 segundos
  
  test('Funcionário não encontra cliente inexistente', async () => {
    try {
      console.log('=== TESTE: Busca por cliente inexistente ===');
      
      // Já deve estar na página de clientes do teste anterior
      
      // 1. Buscar cliente que não existe
      const searchInput = await waitForElement(driver, 'input[type="search"], input[placeholder*="buscar"]', 10000);
      await searchInput.clear();
      await searchInput.sendKeys('ClienteInexistente12345XYZ');
      await searchInput.sendKeys(Key.RETURN);
      console.log('Buscou por cliente inexistente');
      
      await driver.sleep(2000);
      
      // 2. Verificar mensagem "Nenhum cliente encontrado"
      try {
        const mensagemVazio = await waitForElement(driver, '.sem-resultados, .no-results, .empty-state, [class*="nenhum"]', 5000);
        const texto = await mensagemVazio.getText();
        expect(texto.toLowerCase()).toContain('nenhum');
        console.log('Mensagem "Nenhum resultado" exibida:', texto);
      } catch {
        // Alternativa: verificar se lista está vazia
        const resultados = await driver.findElements(By.css('.cliente-item, .card-cliente'));
        expect(resultados.length).toBe(0);
        console.log('Lista de resultados está vazia');
      }
      
      // 3. Tirar screenshot
      await takeScreenshot(driver, 'cliente-nao-encontrado');
      
      console.log('TESTE CONCLUÍDO: Cliente inexistente tratado corretamente!');
      
    } catch (error) {
      await takeScreenshot(driver, 'busca-cliente-erro');
      console.error('ERRO no teste de cliente inexistente:', error.message);
      throw error;
    }
  }, 60000);
});