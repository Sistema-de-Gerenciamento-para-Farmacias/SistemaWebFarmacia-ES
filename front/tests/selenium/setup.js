// tests/selenium/setup.js
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

/**
 * Configuração do driver do Selenium para Chrome
 * @returns {WebDriver} Driver configurado
 */
export async function setupDriver() {
  console.log('Iniciando setupDriver...');
  
  const options = new chrome.Options();
  
  // Configurações do Chrome
  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--headless'  // Modo headless (sem interface gráfica)
  );
  
  console.log('Configurando Chrome options...');
  
  try {
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('Driver configurado com sucesso');
    
    // Timeouts
    await driver.manage().setTimeouts({
      implicit: 10000, // 10 segundos
      pageLoad: 30000, // 30 segundos
      script: 30000    // 30 segundos
    });
    
    return driver;
  } catch (error) {
    console.error('ERRO no setupDriver:', error.message);
    throw error;
  }
}

/**
 * Aguarda elemento estar visível na página
 * @param {WebDriver} driver - Driver do Selenium
 * @param {string} selector - Seletor CSS do elemento
 * @param {number} timeout - Tempo máximo de espera (ms)
 */
export async function waitForElement(driver, selector, timeout = 10000) {
  return await driver.wait(
    until.elementLocated(By.css(selector)),
    timeout
  );
}

/**
 * Aguarda e clica em um elemento
 * @param {WebDriver} driver - Driver do Selenium
 * @param {string} selector - Seletor CSS do elemento
 */
export async function waitAndClick(driver, selector) {
  const element = await waitForElement(driver, selector);
  await driver.wait(until.elementIsVisible(element), 10000);
  await element.click();
}

/**
 * Preenche campo de input
 * @param {WebDriver} driver - Driver do Selenium
 * @param {string} selector - Seletor CSS do input
 * @param {string} value - Valor para preencher
 */
export async function fillInput(driver, selector, value) {
  const element = await waitForElement(driver, selector);
  await element.clear();
  await element.sendKeys(value);
}

/**
 * Aguarda URL mudar
 * @param {WebDriver} driver - Driver do Selenium
 * @param {string} expectedUrl - URL esperada
 */
export async function waitForUrl(driver, expectedUrl) {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes(expectedUrl);
  }, 15000);
}

/**
 * Tira screenshot e salva
 * @param {WebDriver} driver - Driver do Selenium
 * @param {string} testName - Nome do teste
 */
export async function takeScreenshot(driver, testName) {
  const screenshot = await driver.takeScreenshot();
  const fs = await import('fs');
  const path = await import('path');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotDir = path.join(process.cwd(), 'tests', 'screenshots');
  
  // Cria diretório se não existir
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const screenshotPath = path.join(screenshotDir, `${testName}_${timestamp}.png`);
  fs.writeFileSync(screenshotPath, screenshot, 'base64');
  console.log(`Screenshot salvo: ${screenshotPath}`);
}