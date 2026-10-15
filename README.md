# Controle de Gastos & Finanças Pessoais

Aplicação moderna e responsiva para gestão financeira pessoal, desenvolvida com **React 19**, **TypeScript** e **Vite**, integrada com o ecossistema **Google Firebase** para autenticação e banco de dados em tempo real.

**Acesse a aplicação em produção:** [controle-gastos-sandy.vercel.app](https://controle-gastos-sandy.vercel.app/)

---

## Tecnologias & Ferramentas Utilizadas

Este projeto foi construído focando em boas práticas de mercado, arquitetura escalável e segurança em nuvem:

- **Frontend Core:**
  - [React 19](https://react.dev/) (Hooks, Context API, arquitetura modular de componentes)
  - [TypeScript](https://www.typescriptlang.org/) (Tipagem estrita, interfaces de domínio e segurança em tempo de compilação)
  - [Vite](https://vite.dev/) (Build tool de alta performance e HMR)
  - [Lucide React](https://lucide.dev/) (Ícones semânticos e consistentes)
- **Backend as a Service & Cloud (Firebase):**
  - **Firebase Authentication:** Autenticação de usuários segura via OAuth com conta **Google** (popup flow com escopos restritos).
  - **Cloud Firestore:** Banco de dados NoSQL com sincronização em tempo real (`onSnapshot`) e modelagem multiusuário isolada (`/users/{uid}/...`).
  - **Firebase Security Rules:** Proteção em nível de banco garantindo que cada usuário só leia e escreva seus próprios registros.
---

## Funcionalidades

- **Autenticação com Google (OAuth):** Login prático e seguro usando a conta Google via Firebase Auth.
- **Sincronização em Nuvem em Tempo Real:** Todas as receitas e despesas são gravadas instantaneamente no Cloud Firestore.
- **Gestão de Ganhos / Receitas:**
  - Cadastro de entradas (salário, freelance, rendimentos).
  - Suporte a **lançamentos parcelados ou recorrentes** (ex: salário cadastrado com 12 meses de recorrência automática).
- **Categorização e Tipificação de Gastos:**
  - Classificação por tipo/natureza do gasto: **Alimentação, Contas, Educação, Transporte, Compras, Games, Assinaturas, Roupa e Saúde** (estruturado para relatórios e futuros gráficos).
  - Filtro interativo por tipo na listagem de extrato.
- **Gastos Contínuos (Recorrentes) & Parcelamentos:**
  - Suporte a **gastos contínuos** (ex: convênio, internet, academia): repetem todo mês sem necessidade de definir parcelas fixas.
  - **Cancelamento inteligente com histórico preservado**: ao encerrar um gasto contínuo (ex: em novembro), ele para de aparecer nos meses seguintes, mas continua registrado nos meses anteriores.
  - Controle e projeção de **compras parceladas** com identificação da parcela atual e total (ex: `3/10`).
- **Cockpit Financeiro:**
  - Saldo líquido do mês (Entradas vs Saídas).
  - Indicador dinâmico de tendência de fluxo de caixa.
  - Barra de comprometimento da renda com alertas visuais por porcentagem consumida.
- **Navegação Temporal:** Seletor de meses para planejamento retroativo e futuro.
- **Customização e Preferências:**
  - Criação de módulos e categorias personalizadas.
  - Preferências visuais sincronizadas por usuário na nuvem.

---
