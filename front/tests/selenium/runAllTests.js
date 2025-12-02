// front/tests/selenium/runAllTests.js
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function runTests() {
  console.log('INICIANDO TESTES SELENIUM');
  console.log('===============================\n');
  
  const tests = [
    'adminLogin.test.js',
    'funcionarioVisualizaCliente.test.js', 
    'clienteCompraProduto.test.js'
  ];
  
  for (const testFile of tests) {
    try {
      console.log(`\nEXECUTANDO: ${testFile}`);
      console.log('-----------------------------------');
      
      const { stdout, stderr } = await execAsync(
        `node --experimental-vm-modules node_modules/.bin/jest tests/selenium/${testFile} --testTimeout=120000`,
        { stdio: 'inherit' }
      );
      
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log(`${testFile} - CONCLUÍDO\n`);
      
    } catch (error) {
      console.error(`ERRO em ${testFile}:`, error.message);
      console.log('Continuando com próximos testes...\n');
    }
  }
  
  console.log('===============================');
  console.log('TODOS OS TESTES FINALIZADOS');
}

runTests().catch(console.error);