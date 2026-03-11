# 🌍 Where Am I?

Extensão para Google Chrome (Manifest V3) que identifica visualmente o ambiente (staging, produção, desenvolvimento, etc.) da URL que você está acessando. Ideal para desenvolvedores e equipes que trabalham com múltiplos ambientes e precisam saber rapidamente **onde estão**.

## ✨ Funcionalidades

- **Identificação visual de ambientes** — Adiciona indicadores visuais coloridos às páginas, diferenciando ambientes como produção, staging e desenvolvimento.
- **Três tipos de indicadores:**
  - **Borda completa** — Moldura colorida ao redor de toda a viewport, com tooltip ao passar o mouse.
  - **Somente topo** — Barra colorida fixa no topo da página, com tooltip ao passar o mouse.
  - **Balão flutuante** — Balão arrastável com o nome do ambiente. Duplo clique para minimizar.
- **Correspondência por URL** — Suporte a substring simples (`url.includes(pattern)`) ou expressão regular (envolvida em `/barras/`).
- **Correspondência por Cookie** — Opcionalmente, restrinja o match a um cookie específico (nome e/ou valor).
- **Badge na barra de ferramentas** — O ícone da extensão exibe um badge colorido indicando o ambiente da aba ativa.
- **Popup interativo** — Ao clicar no ícone, visualize o ambiente atual ou registre/edite ambientes diretamente.
- **Página de configurações** — CRUD completo para gerenciar todos os ambientes cadastrados, com tabela paginada (10 por página).
- **Sincronização** — Configurações são salvas em `chrome.storage.sync`, sendo sincronizadas entre dispositivos com a mesma conta Google.
- **Atualização em tempo real** — Alterações nas configurações são aplicadas imediatamente, sem necessidade de recarregar a página.

## 📦 Estrutura do Projeto

```
where-am-i/
├── manifest.json              # Configuração da extensão (Manifest V3)
├── Makefile                   # Comandos para empacotar a extensão
├── icons/                     # Ícones da extensão (16, 48, 128 px)
└── src/
    ├── background/
    │   └── background.js      # Service Worker — gerencia badge e lógica de matching
    ├── content/
    │   └── content.js         # Content Script — injeta indicadores visuais nas páginas
    ├── popup/
    │   ├── popup.html         # HTML do popup
    │   ├── popup.css          # Estilos do popup
    │   └── popup.js           # Lógica do popup (visualizar/editar/registrar ambientes)
    └── options/
        ├── options.html       # HTML da página de configurações
        ├── options.css        # Estilos da página de configurações
        └── options.js         # Lógica de CRUD e paginação dos ambientes
```

## 🧩 Componentes

### Service Worker (`background.js`)

Roda em segundo plano e é responsável por:

- Escutar eventos de navegação (`tabs.onUpdated`, `tabs.onActivated`) para atualizar o badge do ícone com a cor do ambiente detectado.
- Fornecer a lógica centralizada de matching (URL + cookie) para o content script e o popup via `chrome.runtime.onMessage`.

### Content Script (`content.js`)

Injetado automaticamente em todas as páginas. Ele:

- Consulta o background para verificar se a URL atual corresponde a algum ambiente cadastrado.
- Aplica o indicador visual correspondente (borda, barra de topo ou balão).
- Escuta `chrome.storage.onChanged` para reagir em tempo real a mudanças nas configurações.

### Popup (`popup/`)

Interface exibida ao clicar no ícone da extensão. Possui dois modos:

- **Visualização** — Exibe o nome do ambiente, cor, tipo de indicação e espessura da borda. Se o ambiente for desconhecido, oferece a opção de registrá-lo.
- **Edição** — Formulário para criar ou editar um ambiente diretamente pelo popup.

### Página de Configurações (`options/`)

Acessível pelas configurações da extensão. Oferece:

- Formulário para adicionar novos ambientes (URL, nome, tipo de indicação, cor, espessura da borda, cookie).
- Tabela com todos os ambientes cadastrados, com edição inline e exclusão.
- Paginação automática (10 itens por página).

## 🗃️ Modelo de Dados

Todos os ambientes são armazenados em `chrome.storage.sync` sob a chave `environments`, como um array de objetos:

```json
{
  "urlPattern": "staging.exemplo.com",
  "name": "Staging",
  "indicationType": "borda-completa",
  "color": "#f59e0b",
  "borderWidth": "5px",
  "cookieName": "",
  "cookieValue": ""
}
```

| Campo            | Tipo     | Descrição                                                  |
| ---------------- | -------- | ---------------------------------------------------------- |
| `urlPattern`     | `string` | Substring ou regex (entre `/barras/`) para match com a URL |
| `name`           | `string` | Nome de exibição do ambiente                               |
| `indicationType` | `string` | `"borda-completa"`, `"somente-topo"` ou `"balao"`          |
| `color`          | `string` | Cor em hexadecimal (ex.: `"#b91c1c"`)                      |
| `borderWidth`    | `string` | Espessura da borda em CSS (ex.: `"5px"`)                   |
| `cookieName`     | `string` | Nome do cookie para match adicional (opcional)             |
| `cookieValue`    | `string` | Valor esperado do cookie (opcional, requer `cookieName`)   |

## 🔍 Lógica de Correspondência (Matching)

1. Se o `urlPattern` começa e termina com `/`, é tratado como **expressão regular**.
2. Caso contrário, é feita uma verificação de **substring** (`url.includes(pattern)`).
3. Se `cookieName` estiver definido, o match só é válido se o cookie existir na URL atual (e, opcionalmente, tiver o valor especificado).
4. **O primeiro match encontrado vence** — a ordem dos ambientes importa.

## 🚀 Instalação para Desenvolvimento

Não há etapa de build, bundler ou gerenciador de pacotes. A extensão usa HTML, CSS e JavaScript puros.

1. Abra `chrome://extensions/` no Google Chrome.
2. Ative o **Modo do Desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** e selecione a pasta raiz do projeto.
4. Após qualquer alteração no código, clique no botão de recarga no card da extensão.

## 📦 Empacotamento

Para gerar o arquivo `.zip` para distribuição:

```bash
make zip
```

Para limpar o arquivo gerado:

```bash
make clean
```

## 🛠️ Tecnologias

- **Manifest V3** — Formato mais recente de extensões do Chrome.
- **HTML / CSS / JavaScript** — Sem frameworks ou dependências externas.
- **Chrome APIs** — `chrome.storage.sync`, `chrome.tabs`, `chrome.action`, `chrome.cookies`, `chrome.runtime`.
- **Google Fonts** — Inter e Playfair Display para a interface.

## 📝 Permissões

| Permissão    | Motivo                                                                          |
| ------------ | ------------------------------------------------------------------------------- |
| `storage`    | Salvar e sincronizar as configurações de ambientes                              |
| `activeTab`  | Acessar a URL da aba ativa para detecção de ambiente                            |
| `cookies`    | Ler cookies para matching avançado baseado em cookies                           |
| `<all_urls>` | Injetar o content script em qualquer página para aplicar os indicadores visuais |

## 👤 Autor

Desenvolvido por [Regivaldo Silva](https://regivaldo.com.br)

- **LinkedIn:** [linkedin.com/in/regivaldo-silva](https://www.linkedin.com/in/regivaldo-silva/)
- **GitHub:** [github.com/regivaldo](https://github.com/regivaldo)
- **Contato:** [contato@regivaldo.com.br](mailto:contato@regivaldo.com.br)
