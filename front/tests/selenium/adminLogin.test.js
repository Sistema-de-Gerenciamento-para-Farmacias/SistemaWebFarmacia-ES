// front/tests/selenium/adminLogin.test.js
import { setupDriver, waitForElement, fillInput, waitAndClick, waitForUrl, takeScreenshot } from './setup.js';

describe('Login de Administrador', () => {
  let driver;
  
  beforeAll(async () => {
    driver = await setupDriver();
  });
  
  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });
  
  test('Deve fazer login como administrador com sucesso', async () => {
    try {
      console.log('=== TESTE: Login de Administrador ===');
      
      // 1. Acessar página de login
      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login');
      
      // 2. Verificar se está na página correta
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
      
      // 3. Preencher email de administrador
      await fillInput(driver, 'input[name="email"]', 'admin@gmail.com');
      console.log('Preencheu email do admin');
      
      // 4. Preencher senha
      await fillInput(driver, 'input[name="senha"]', 'admin123');
      console.log('Preencheu senha');
      
      // 5. Clicar no botão de login
      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Clicou em login');
      
      // 6. Aguardar redirecionamento para dashboard/admin
      await waitForUrl(driver, '/dashboard/admin');
      console.log('Redirecionado para dashboard do admin');
      
      // 7. Verificar elementos da dashboard do admin
      await waitForElement(driver, '.dashboard-admin', 15000);
      console.log('Dashboard do admin carregada');
      
      // 8. Verificar se menu de admin está visível
      const adminMenu = await waitForElement(driver, '.nav-admin', 10000);
      expect(await adminMenu.isDisplayed()).toBeTruthy();
      console.log('Menu de administrador visível');
      
      // 9. Tirar screenshot como prova
      await takeScreenshot(driver, 'admin-login-sucesso');
      
      console.log('TESTE CONCLUÍDO: Login de administrador bem-sucedido!');
      
    } catch (error) {
      await takeScreenshot(driver, 'admin-login-erro');
      console.error('ERRO no teste de login de admin:', error.message);
      throw error;
    }
  }, 60000); // Timeout de 60 segundos
  
  test('Deve mostrar erro com credenciais inválidas', async () => {
    try {
      console.log('=== TESTE: Login com credenciais inválidas ===');
      
      // 1. Acessar página de login (já deve estar loggado, vamos fazer logout primeiro)
      try {
        const logoutBtn = await driver.findElement(By.css('.logout-button'));
        await logoutBtn.click();
        await driver.sleep(2000);
      } catch {
        // Se não encontrar logout, continuar
      }
      
      await driver.get('http://localhost:5173/login');
      console.log('Acessou página de login novamente');
      
      // 2. Preencher credenciais inválidas
      await fillInput(driver, 'input[name="email"]', 'admin@invalido.com');
      await fillInput(driver, 'input[name="senha"]', 'senhaerrada');
      console.log('Preencheu credenciais inválidas');
      
      // 3. Clicar no botão de login
      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Tentou fazer login');
      
      // 4. Aguardar mensagem de erro
      await driver.sleep(2000); // Pequena pausa
      
      // 5. Verificar se mensagem de erro aparece
      const errorMessage = await waitForElement(driver, '.message-box.error, .alert-danger, [class*="error"], [class*="mensagem"]', 10000);
      const errorText = await errorMessage.getText();
      
      expect(errorText.toLowerCase()).toContain('erro');
      expect(errorText.toLowerCase()).toContain('inválido');
      console.log('Mensagem de erro exibida:', errorText);
      
      // 6. Tirar screenshot
      await takeScreenshot(driver, 'admin-login-erro-credenciais');
      
      console.log('TESTE CONCLUÍDO: Credenciais inválidas tratadas corretamente!');
      
    } catch (error) {
      await takeScreenshot(driver, 'login-invalido-erro');
      console.error('ERRO no teste de login inválido:', error.message);
      throw error;
    }
  }, 60000);
});