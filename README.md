# Tech Solutions
## Sistema de Gerenciamento e Vendas para Farmácias 💊

### 1. CONTEXTO DO PROBLEMA E SOLUÇÃO
#### 📌 Problema
Farmácias e drogarias frequentemente enfrentam dificuldades na gestão de estoque, clientes e vendas. Processos manuais podem gerar erros, atrasos no atendimento e falta de informações consolidadas para apoiar a tomada de decisão dos administradores. Além disso, clientes não possuem autonomia para visualizar produtos, realizar compras online e acompanhar seu histórico de aquisições.
#### 💡 Solução
O **Sistema Web Farmácia Digital** foi desenvolvido para informatizar os processos essenciais de uma farmácia:
- Cadastro, consulta, atualização e exclusão de **produtos**.
- Registro e manutenção de **clientes**.
- Controle de **vendas e compras**, com histórico acessível.
- Autenticação de usuários (clientes, funcionários e administradores).

### 2. INSTRUÇÕES PARA USO (Usuários Finais)
Abra o link disponibilizado pela Tech Solutions em seu navegador de preferência e faça o login de acordo com o perfil utilizado (Funcionário ou Cliente).

### 3. INSTRUÇÕES PARA DEVS

#### 3.1 Clonar o projeto
```
git clone https://github.com/Sistema-de-Gerenciamento-para-Farmacias/SistemaWebFarmacia-ES
```
Ou baixe o ZIP e extraia na sua máquina.

### 3.2 Instalar dependências
No diretório do projeto, execute:
```
npm install
```
### 3.3 Executar o projeto
- Garanta já ter instalado o **Node.js (v18+)**, **PostgreSQL (v17)**, **JDK (Java 17)**, **React (v18)** e **Maven** na sua máquina. 
- Crie um banco de dados no PostegreSQL, crie um arquivo .env com as especificações necessárias.
- Vá para a pasta /back e execute:
```
mvn spring-boot:run
```

-	Vá para a pasta front/ e execute:
```
npm run dev
```
-	Acesse no navegador:
http://localhost:5173

-	O sistema deverá abrir no seu browser.

### 4. TECNOLOGIAS
- Back-End: Spring Boot (v3.5.7)
-	Linguagem Back-End: Java (v17)
-	Front-End: React (v18)
-	Banco de Dados: PostgreSQL (v18)
-	IDE (Back-End): IntelliJ IDEA (v2025.2)
-	IDE (Front-End/Geral): VS Code (v1.95)
-	Controle de Versão: Git (v2.47) / GitHub

### 5. ORGANIZAÇÃO DO PROJETO
Este projeto está organizado nas seguintes pastas:
## Estrutura de Pastas

### **Front-End (`front/`)**


* **`front/`**: Contém o código-fonte da aplicação **Front-End** (React).
  * **`front/src/`**: Código principal da interface.
    * **`front/src/assets/`**: Recursos visuais (imagens, ícones).
    * **`front/src/pages/`**: Páginas da aplicação, cada uma em sua própria pasta.
    * **`front/src/components/`**: Componentes reutilizáveis (botões, inputs, etc).
    * **`front/src/context/`**: Contextos globais (ex.: autenticação).
    * **`front/src/services/`**: Serviços de API ou mocks.
    * **`front/src/utils/`**: Funções auxiliares.
  * **`front/public/`**: Arquivos estáticos e HTML inicial.

### **Back-End (`back/`)**

O **Back-End** é desenvolvido em **Spring Boot** e contém toda a lógica de negócio e acesso ao banco de dados.

* **`back/`**: Código-fonte do Back-End.  
  * **`back/src/main/java/com/br/farmacia/apiFarmacia/`**  
    Código principal da API, organizado em pacotes:

    **Pacotes e suas responsabilidades:**
    
    * **`controller/`**  
      Controladores responsáveis por receber as requisições HTTP e encaminhar para a camada de serviço.
      
    * **`data/dto/request/`**  
      DTOs de **entrada**, usados para receber dados enviados pelo cliente.
      
    * **`data/dto/response/`**  
      DTOs de **saída**, usados para enviar dados de volta nas respostas da API.
      
    * **`entity/`**  
      Entidades JPA que representam as tabelas do banco de dados.
      
    * **`repository/`**  
      Interfaces do **Spring Data JPA** responsáveis pelo acesso e manipulação dos dados no banco.
      
    * **`service/`**  
      Contém a lógica de negócio e regras do sistema, servindo de ponte entre os controladores e os repositórios.
      
    * **`config/`**  
      Contém configurações gerais do Spring Boot, incluindo:
        - **`SecurityConfig`**: Define a autenticação e autorização do sistema, controlando o acesso de usuários e suas permissões.
      
    * **`infra/config/`**  
      Configurações de infraestrutura adicionais, incluindo:
        - **`CorsConfig`**: Define regras de **CORS (Cross-Origin Resource Sharing)**, permitindo que o Front-End acesse a API de forma segura mesmo estando em domínios diferentes.
      
    * **`Startup.java`**  
      Classe principal que inicializa a aplicação Spring Boot.

  * **`back/src/resources/`**  
    Arquivos de configuração, templates e propriedades da aplicação, como `application.properties` ou `application.yml`.

  * **`back/src/test/`**  
    Testes unitários e de integração do projeto, garantindo que a aplicação funcione corretamente.
    
### 👥 Membros da Equipe
-	Matheus Gomes Monteiro, 202410369
-	Gustavo Alessandro De Souza Sabino, 202411214
-	Gustavo Batista Bissoli, 202220170

