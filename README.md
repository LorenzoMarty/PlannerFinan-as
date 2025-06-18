# PlannerFin - Sistema de Controle Financeiro

![PlannerFin Logo](https://img.shields.io/badge/PlannerFin-v1.0-blue?style=for-the-badge&logo=react)

## 📋 Sobre o Projeto

O **PlannerFin** é um sistema online completo de controle de orçamento financeiro, desenvolvido com foco em **acessibilidade**, **personalização total da interface** e **colaboração entre usuários**. Cada usuário possui seus próprios dados isolados e pode gerenciar múltiplas planilhas de orçamento de forma independente.

## ✨ Funcionalidades Principais

### 🔐 **Sistema de Autenticação**

- Login seguro com validação
- Usuários demo pré-configurados
- Dados isolados por usuário
- Logout com limpeza completa de dados

### 📊 **Gestão de Orçamentos**

- **Múltiplas planilhas** por usuário
- **CRUD completo** de lançamentos (receitas e despesas)
- **Categorização** personalizável
- **Códigos únicos** para cada planilha
- **Cálculos automáticos** (receitas, despesas, saldo)

### 🏷️ **Sistema de Categorias**

- **Criação ilimitada** de categorias
- **Personalização visual** (cores e emojis)
- **Separação** por tipo (receita/despesa)
- **Estatísticas** de uso por categoria
- **Validação** antes de excluir categorias em uso

### 📈 **Análises e Relatórios**

- **Gráficos interativos** com Recharts
- **Visualização por categorias** (pizza)
- **Tendências temporais** (barras, linhas, área)
- **Comparações** entre períodos
- **Exportação** de dados em CSV

### 👥 **Colaboração**

- **Códigos de compartilhamento** únicos
- **Interface preparada** para colaboração
- **Gestão de colaboradores**
- **Status de propriedade** das planilhas

### ⚙️ **Configurações Avançadas**

- **Personalização completa** da interface
- **Temas** (claro/escuro/sistema)
- **Cores primárias** customizáveis
- **Tipografia** ajustável (fonte e tamanho)
- **Layout** (compacto/padrão/espaçoso)
- **Recursos de acessibilidade**
- **Import/Export** de configurações

### ♿ **Acessibilidade**

- **Navegação por teclado**
- **Alto contraste**
- **Tamanhos ajustáveis** de fonte e botões
- **Redução de animações**
- **Compatibilidade** com leitores de tela
- **Estrutura semântica** completa

## 🚀 Tecnologias Utilizadas

### **Frontend**

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router 6** - Roteamento SPA

### **UI/UX**

- **TailwindCSS 3** - Framework CSS
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Framer Motion** - Animações (removido para estabilidade)

### **Gráficos e Visualização**

- **Recharts** - Gráficos interativos
- **Charts responsivos** - Pie, Bar, Line, Area

### **Estado e Dados**

- **Context API** - Gerenciamento de estado
- **LocalStorage** - Persistência de dados
- **Contextos personalizados** - Settings e UserData

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/                 # Autenticação
│   ├── budget/              # Gestão financeira
│   ├── collaboration/       # Colaboração
│   ├── demo/               # Demonstrações
│   ├── layout/             # Layout da aplicação
│   └── ui/                 # Componentes base (shadcn/ui)
├── contexts/
│   ├── SettingsContext.tsx # Configurações do usuário
│   └── UserDataContext.tsx # Dados financeiros
├── hooks/                  # Custom hooks
├── lib/
│   ├── formatters.ts       # Utilitários de formatação
│   └── utils.ts           # Funções auxiliares
└── pages/
    ├── Analytics.tsx       # Relatórios e gráficos
    ├── Categories.tsx      # Gestão de categorias
    ├── Collaboration.tsx   # Colaboração
    ├── Dashboard.tsx       # Painel principal
    ├── Login.tsx          # Autenticação
    └── Settings.tsx       # Configurações
```

## 🎯 Como Usar

### **1. Login**

```bash
# Usuários demo disponíveis:
demo@plannerfin.com / 123456
admin@plannerfin.com / admin123
user@exemplo.com / senha123

# Ou clique em "Acesso Demo" para login automático
```

### **2. Gestão de Lançamentos**

- Acesse o **Dashboard**
- Clique em **"Novo Lançamento"**
- Preencha: data, descrição, categoria, valor e tipo
- Os totais são **calculados automaticamente**

### **3. Categorias Personalizadas**

- Vá em **"Categorias"**
- Crie categorias com **cores e emojis**
- Visualize **estatísticas de uso**
- **Não é possível excluir** categorias em uso

### **4. Análises Avançadas**

- Acesse **"Relatórios"**
- Visualize **gráficos interativos**
- Compare **períodos diferentes**
- Analise **tendências** e **distribuições**

### **5. Personalização**

- Vá em **"Configurações"**
- Ajuste **tema, cores, fontes**
- Configure **acessibilidade**
- **Exporte/Importe** suas configurações

### **6. Colaboração**

- Cada planilha tem um **código único**
- **Compartilhe** o código com outros usuários
- Interface preparada para **colaboração em tempo real**

## 🔧 Configuração do Ambiente

### **Pré-requisitos**

- Node.js 16+
- npm ou yarn

### **Instalação**

```bash
# Clone o repositório
git clone [repository-url]

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### **Scripts Disponíveis**

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run preview    # Preview do build
npm test          # Executar testes
npm run typecheck # Verificação de tipos
```

## 🎨 Recursos de Design

### **Sistema de Cores**

- **Primária**: Azul profissional (#3b82f6)
- **Sucesso**: Verde para receitas (#22c55e)
- **Destrutiva**: Vermelho para despesas (#ef4444)
- **Aviso**: Laranja para alertas (#f97316)

### **Tipografia**

- **Fontes**: Inter, Roboto, Open Sans, Lato, Poppins
- **Tamanhos**: 12px - 24px ajustáveis
- **Pesos**: Regular, Medium, Semibold, Bold

### **Layout**

- **Responsivo**: Mobile-first design
- **Densidade**: Compacto, Padrão, Espaçoso
- **Navegação**: Sidebar colapsível
- **Acessibilidade**: WCAG 2.1 AA compliant

## 📊 Funcionalidades de Dados

### **Armazenamento**

- **LocalStorage** para persistência
- **Dados isolados** por usuário
- **Backup automático** das configurações
- **Limpeza** no logout

### **Validação**

- **Formulários** com validação em tempo real
- **Feedback visual** para erros
- **Confirmações** para ações destrutivas
- **Sanitização** de dados de entrada

### **Formatação**

- **Moeda**: Real (BRL), Dólar (USD), Euro (EUR)
- **Data**: DD/MM/AAAA, MM/DD/AAAA, AAAA-MM-DD
- **Números**: Formatação brasileira e internacional

## 🔒 Segurança e Privacidade

### **Dados do Usuário**

- **Armazenamento local** apenas
- **Nenhum dado** enviado para servidores
- **Isolamento completo** entre usuários
- **Limpeza automática** no logout

### **Validação**

- **Sanitização** de entradas
- **Validação** de tipos TypeScript
- **Prevenção** de XSS
- **Handling** seguro de erros

## 🚀 Status do Projeto

### ✅ **Funcionalidades Completas**

- [x] Sistema de autenticação
- [x] Gestão de lançamentos (CRUD)
- [x] Sistema de categorias
- [x] Gráficos e análises
- [x] Configurações personalizáveis
- [x] Acessibilidade completa
- [x] Design responsivo
- [x] Export/Import de dados
- [x] Interface de colaboração

### 🔄 **Em Desenvolvimento**

- [ ] Colaboração em tempo real
- [ ] Sincronização na nuvem
- [ ] Notificações push
- [ ] Metas e objetivos financeiros
- [ ] Integração com bancos
- [ ] App mobile nativo

## 📈 Roadmap Futuro

### **Versão 1.1**

- Colaboração em tempo real
- Notificações inteligentes
- Metas financeiras

### **Versão 1.2**

- Sincronização na nuvem
- Backup automático
- Integração bancária

### **Versão 2.0**

- App mobile nativo
- Inteligência artificial
- Previsões financeiras

## 🤝 Contribuição

O projeto está aberto para contribuições! Sinta-se à vontade para:

1. **Fork** o projeto
2. Criar uma **branch** para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. Abrir um **Pull Request**

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: [suporte@plannerfin.com]
- 💬 Discord: [PlannerFin Community]
- 📖 Documentação: [docs.plannerfin.com]

---

**PlannerFin** - Transformando sua gestão financeira! 💰✨
