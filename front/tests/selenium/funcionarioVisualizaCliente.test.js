import {
  setupDriver,
  waitForElement,
  fillInput,
  waitAndClick,
  waitForUrl,
  takeScreenshot,
} from './setup.js';

// Importação do By e até (necessário para usar by.xpath, by.css fora dos helpers e para as condições de espera)
// CORREÇÃO: Incluímos 'until' na importação do selenium-webdriver.
import { By, until } from 'selenium-webdriver';
const by = By; 

describe('Testes E2E de Login e Navegação', () => {
  let driver;

  beforeAll(async () => {
    driver = await setupDriver();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  // =========================================================================
  // TESTE 1: LOGIN DE ADMINISTRADOR 
  // =========================================================================
  test('Deve fazer login como administrador com sucesso', async () => {
    try {
      console.log('=== TESTE: Login de Administrador ===');

      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login');

      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');

      await fillInput(driver, 'input[name="email"]', 'admin@gmail.com');
      console.log('Preencheu email do admin');

      await fillInput(driver, 'input[name="senha"]', '123');
      console.log('Preencheu senha');

      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Clicou em login');

      await waitForUrl(driver, '/homeAdmin');
      console.log('Redirecionado para dashboard do admin');

      const adminTitle = await waitForElement(driver, 'h1', 15000);
      expect(await adminTitle.getText()).toContain('Dashboard Administrativo');
      console.log('Dashboard do admin carregada e título verificado');

      const adminMenu = await waitForElement(driver, 'button[class*="logout"]', 10000);
      expect(await adminMenu.isDisplayed()).toBeTruthy();
      console.log('Menu de administrador (via botão Logout) visível');

      await takeScreenshot(driver, 'admin-login-sucesso');

      console.log('TESTE CONCLUÍDO: Login de administrador bem-sucedido!');

    } catch (error) {
      await takeScreenshot(driver, 'admin-login-erro');
      console.error('ERRO no teste de login de admin:', error.message);
      throw error;
    }
  }, 60000); 

  // =========================================================================
  // TESTE 2: LOGIN COM CREDENCIAIS INVÁLIDAS 
  // =========================================================================
  test('Deve mostrar erro com credenciais inválidas', async () => {
    try {
      console.log('=== TESTE: Login com credenciais inválidas ===');

      // Tentativa de logout ou apenas garante que a página de login está acessível
      try {
        const logoutBtn = await waitForElement(driver, 'button[class*="logout"]', 5000);
        if (logoutBtn) {
          await logoutBtn.click();
          await driver.sleep(2000);
        }
      } catch (e) {
        // Já está deslogado
      }

      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login novamente');

      await fillInput(driver, 'input[name="email"]', 'admin@invalido.com');
      await fillInput(driver, 'input[name="senha"]', 'senhaerrada');
      console.log('Preencheu credenciais inválidas');

      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Tentou fazer login');

      await driver.sleep(3000);

      // Verificação da MessageBox (mantida a lógica de busca do box ou overlay)
      const errorElement = await waitForElement(driver, 'div[class*="overlay"]', 5000);
      let errorText = await errorElement.getText();
      
      expect(errorText.toUpperCase()).toContain('ERRO');
      console.log('Mensagem de erro exibida:', errorText.substring(0, 100));

      try {
        const okButton = await driver.findElement(by.xpath('//button[contains(text(), "OK")]'));
        if (await okButton.isDisplayed()) {
          console.log('Botão OK encontrado na MessageBox. Clicando...');
          await okButton.click();
          await driver.sleep(1000);
        }
      } catch (e) {
        // Não é crítico se não encontrar o botão OK
      }

      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
      console.log('Ainda na página de login (como esperado)');

      await takeScreenshot(driver, 'admin-login-erro-credenciais');

      console.log('TESTE CONCLUÍDO: Credenciais inválidas tratadas corretamente!');

    } catch (error) {
      await takeScreenshot(driver, 'login-invalido-erro');
      console.error('ERRO no teste de login inválido:', error.message);
      throw error;
    }
  }, 60000);

  // =========================================================================
  // TESTE 3: LOGIN DE FUNCIONÁRIO E NAVEGAÇÃO PARA DETALHES DO CLIENTE (CORRIGIDO)
  // =========================================================================
  test('Deve fazer login como funcionário, navegar para Clientes e ver detalhes do primeiro cliente', async () => {
    try {
      console.log('=== TESTE: Login de Funcionário e Navegação de Clientes ===');

      // 1. Garantir que estamos na página de login
      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login');

      // 2. Preencher credenciais do funcionário
      await fillInput(driver, 'input[name="email"]', 'func@gmail.com');
      await fillInput(driver, 'input[name="senha"]', '123');
      console.log('Preencheu email e senha do funcionário');

      // 3. Clicar no botão de login
      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Clicou em login');

      // 4. Aguardar redirecionamento para a home do funcionário
      await waitForUrl(driver, '/homeFunc');
      console.log('Redirecionado para dashboard do funcionário');

      // 5. Clicar no link/botão para a página de Clientes
      const clientLinkSelector = 'a[href="/clientes"]';
      await waitAndClick(driver, clientLinkSelector);
      console.log('Clicou no link/botão Clientes');

      // 6. Aguardar carregamento da página de Clientes
      // Aumentamos o tempo de espera para 20s para acomodar o carregamento da lista de dados.
      await waitForUrl(driver, '/clientes', 20000);
      console.log('Redirecionado para página de listagem de clientes');

      // Aguardar que o título da página de clientes apareça.
      await waitForElement(driver, by.xpath('//h1[contains(text(), "Clientes")]'), 10000);
      console.log('Título da página de clientes carregado.');


      // 7. Encontrar e clicar no botão de Detalhes do PRIMEIRO card de cliente
      // Assumindo que o primeiro card de cliente tem um botão de detalhes visível.
      const firstClientDetailButtonXPath = `//div[contains(@class, 'client-card')][1]//button[contains(text(), 'Detalhes')]`;
      
      // CORREÇÃO: Usar driver.wait(until.elementLocated(By.xpath(...))) para esperar pelo elemento XPath.
      const detailButton = await driver.wait(
        // Agora 'until' está importado e deve funcionar corretamente
        until.elementLocated(by.xpath(firstClientDetailButtonXPath)),
        15000 // 15 segundos para carregar o botão
      );
      
      await detailButton.click();
      console.log('Clicou no botão Detalhes do primeiro cliente');

      // 8. Aguardar redirecionamento para a página de detalhes do cliente (ex: /clientes/2)
      await waitForUrl(driver, '/clientes/', 15000, true);
      console.log('Redirecionado para página de detalhes do cliente');

      // 9. Verificar se um elemento chave da página de detalhes está visível 
      const detailTitle = await waitForElement(driver, by.xpath('//h2[contains(text(), "Detalhes do Cliente")]'), 10000);
      expect(await detailTitle.isDisplayed()).toBeTruthy();
      console.log('Detalhes do cliente (título da página) verificado com sucesso');

      // 10. Tirar screenshot como prova
      await takeScreenshot(driver, 'funcionario-clientes-detalhes');

      console.log('TESTE CONCLUÍDO: Login de funcionário, navegação e visualização de detalhes bem-sucedidos!');

    } catch (error) {
      await takeScreenshot(driver, 'funcionario-navegacao-erro');
      console.error('ERRO no teste de login de funcionário e navegação:', error.message);
      throw error;
    }
  }, 75000);
});