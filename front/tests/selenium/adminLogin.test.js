import {
  setupDriver,
  waitForElement,
  fillInput,
  waitAndClick,
  waitForUrl,
  takeScreenshot
} from './setup.js';

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

      // 4. Preencher senha (CORRIGIDO: usando '123' conforme as credenciais fornecidas)
      await fillInput(driver, 'input[name="senha"]', '123');
      console.log('Preencheu senha');

      // 5. Clicar no botão de login
      await waitAndClick(driver, 'button[type="submit"]');
      console.log('Clicou em login');

      // 6. Aguardar redirecionamento para homeAdmin (CORRIGIDO: caminho real da aplicação)
      await waitForUrl(driver, '/homeAdmin');
      console.log('Redirecionado para dashboard do admin');

      // 7. Verificar elementos da dashboard do admin (Procurando pelo título da HomeAdm.jsx)
      const adminTitle = await waitForElement(driver, 'h1', 15000);
      expect(await adminTitle.getText()).toContain('Dashboard Administrativo');
      console.log('Dashboard do admin carregada e título verificado');

      // 8. Verificar se menu de admin está visível (Procurando pelo botão de Logout da NavBarAdm.jsx)
      const adminMenu = await waitForElement(driver, 'button[class*="logout"]', 10000);
      expect(await adminMenu.isDisplayed()).toBeTruthy();
      console.log('Menu de administrador (via botão Logout) visível');

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

      // 1. Tentar fazer logout se estiver logado (melhorando o seletor)
      try {
        const logoutBtn = await waitForElement(driver, 'button[class*="logout"]', 5000);
        if (logoutBtn) {
          await logoutBtn.click();
          await driver.sleep(2000);
        }
      } catch (e) {
        // Se o botão de logout não for encontrado, presumimos que já está deslogado
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

      // 4. Aguardar mensagem de erro (MessageBox pode levar um tempo para aparecer)
      await driver.sleep(3000);

      // 5. Verificar se mensagem de erro aparece (MessageBox)
      // IMPORTANTE: Precisamos usar seletores mais específicos baseados no componente MessageBox
      // O componente tem uma div com classe 'overlay' e outra com classe 'box'
      // Vamos tentar vários seletores possíveis
      const errorSelectors = [
        // Primeiro tenta o overlay (a div principal que cobre a tela)
        'div[class*="overlay"]',
        // Depois tenta a caixa da mensagem
        'div[class*="box"]',
        // Pode ter classes geradas automaticamente pelo CSS modules
        'div[class*="MessageBox"]',
        'div[class*="message"]',
        // Texto contendo "ERRO"
        'p:contains("ERRO")',
        // Botão OK dentro do modal
        'button[class*="okButton"]'
      ];

      let errorElement = null;
      let errorText = '';
      
      // Tenta cada seletor
      for (const selector of errorSelectors) {
        try {
          const element = await driver.findElement(by.css(selector));
          if (await element.isDisplayed()) {
            errorElement = element;
            console.log(`Elemento de erro encontrado com seletor: ${selector}`);
            break;
          }
        } catch (e) {
          // Continua para o próximo seletor
        }
      }

      // Se encontrou o elemento, pega o texto
      if (errorElement) {
        errorText = await errorElement.getText();
      } else {
        // Última tentativa: pega todo o texto da página e procura por "ERRO"
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('ERRO:')) {
          // Extrai o texto do erro
          const errorMatch = pageSource.match(/ERRO:[^<]+/);
          errorText = errorMatch ? errorMatch[0] : 'ERRO encontrado no HTML';
        } else {
          throw new Error('Mensagem de erro não encontrada na página');
        }
      }

      // 6. Verificar se o texto contém "ERRO" (já sabemos que contém pelo código)
      expect(errorText.toUpperCase()).toContain('ERRO');
      console.log('Mensagem de erro exibida:', errorText.substring(0, 100));

      // 7. Se encontrou a MessageBox, também podemos verificar o botão OK
      try {
        const okButton = await driver.findElement(by.css('button[class*="okButton"]'));
        if (await okButton.isDisplayed()) {
          console.log('Botão OK encontrado na MessageBox');
          
          // Opcional: clicar no botão OK para fechar a mensagem
          await okButton.click();
          await driver.sleep(1000);
        }
      } catch (e) {
        // Não é crítico se não encontrar o botão OK
      }

      // 8. Verificar que ainda está na página de login (não foi redirecionado)
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/login');
      console.log('Ainda na página de login (como esperado)');

      // 9. Tirar screenshot
      await takeScreenshot(driver, 'admin-login-erro-credenciais');

      console.log('TESTE CONCLUÍDO: Credenciais inválidas tratadas corretamente!');

    } catch (error) {
      await takeScreenshot(driver, 'login-invalido-erro');
      console.error('ERRO no teste de login inválido:', error.message);
      throw error;
    }
  }, 60000);
});