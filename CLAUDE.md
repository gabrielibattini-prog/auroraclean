# Plataforma Aurora Clean

## O que é
Plataforma web que conecta clientes a uma rede de prestadores qualificados em
**higienização de estofados e impermeabilização**, todos seguindo o padrão de
qualidade da Aurora Clean. O objetivo principal não é só intermediar serviços:
é **garantir que todo prestador da rede entregue o mesmo padrão da fundadora**.

Responda e escreva textos de interface sempre em **português do Brasil**.
Na interface, o pedido do cliente se chama **ordem de serviço** (abreviação "OS" só onde faltar espaço). No código, os nomes internos continuam `pedido`.

## Perfis de usuário
- **Cliente**: solicita serviço, acompanha o status, recebe o laudo e o histórico do estofado.
- **Prestador**: se cadastra, passa por aprovação, vê oportunidades (mapa e cards), executa o serviço seguindo o checklist.
- **Admin (fundadora)**: aprova prestadores, faz suporte e mediação, resolve disputas.

Nunca misture permissões: cada rota e cada consulta ao banco deve checar o perfil.

## Funcionalidades principais
1. **Cadastro e aprovação de prestadores** – prestador só recebe oportunidades depois de aprovado pela admin.
2. **Solicitação de serviço** – cliente informa tipo de estofado, serviço, fotos e endereço.
3. **Visualização de oportunidades** – em dois formatos, com alternância entre eles:
   - **Mapa** (Leaflet + OpenStreetMap)
   - **Boxes/cards de oportunidades**
4. **Prontuário do Estofado** (diferencial):
   - checklist obrigatório no protocolo Aurora durante o serviço (tecido, manchas, produtos, observações);
   - fotos de antes e depois obrigatórias para concluir o serviço;
   - laudo enviado ao cliente e histórico salvo por estofado;
   - lembrete automático para refazer a impermeabilização.
5. **Suporte e mediação** – painel para a admin acompanhar pedidos e disputas; o rotineiro (status, reagendamento, dúvidas frequentes) é resolvido pela própria plataforma.

## Regras de privacidade (obrigatórias)
- No mapa e nos cards, o prestador vê só a **localização aproximada** (bairro ou raio), nunca o endereço exato.
- Antes do aceite, o prestador vê só o **primeiro nome** do cliente (decisão da empreendedora); sobrenome nunca.
- O endereço exato e o telefone do cliente aparecem **somente depois que o serviço é aceito**.
- O telefone do prestador **nunca** aparece para o cliente; só a admin vê. O cliente fala com a Aurora Clean (WhatsApp/suporte).
- Seguir a LGPD: coletar apenas os dados necessários e nunca expor dados de um usuário a outro.

## Stack
- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS 4 (tokens em `app/globals.css`, bloco `@theme`)
- Leaflet + react-leaflet para o mapa (tiles OpenStreetMap)
- **Fase atual: MVP só de front-end.** Os dados ficam no navegador (localStorage + IndexedDB para fotos) em `lib/dados/`.
  As ações em `lib/dados/acoes.ts` já checam o perfil e espelham as funções futuras do back-end.
- **Próxima fase:** Supabase (auth, Postgres com RLS, Storage) e hospedagem (Vercel). Plano em `docs/ARQUITETURA.md`.

## Regras de negócio (decididas)
- Pedido **aberto**: o primeiro prestador aprovado, dentro do raio dele, que aceitar fica com o serviço.
- Um pedido pode ter **vários estofados**; cada um tem seu prontuário e seu laudo.
- **Preço por tabela fixa** (`lib/dados/catalogo.ts`, valores PROVISÓRIOS) — tecido natural +15%, limpeza pet +R$ 70, cupom AURORA10 (10% no 1º serviço).
- **Pagamento depois do serviço**: cliente vê o laudo, aprova e paga (Pix, débito ou crédito em até 3x). Garantia de 7 dias.
- Atendimento de segunda a sábado: manhã 08h–13h, tarde 14h–16h, noite 17h–19h.
- Área: São Paulo e região metropolitana. Prestador escolhe bairro-base e raio (2–50 km).
- Aprovação de prestador: documento com foto + certificado do treinamento Aurora.
- Reagendar/cancelar sozinho até 24h antes; depois, via suporte.
- Lembrete de reimpermeabilização por e-mail 12 meses após o serviço.
- Disputa: admin decide entre manter, refazer (retorno de garantia sem custo) ou devolver o valor.
- Prestador vê endereço e telefone do cliente só após aceitar, até 7 dias depois da conclusão.
- LGPD: ver `docs/LGPD.md`.

## Guia de estilos (design system v1 · nov 2026)
- **Sensação geral**: simples, confortável, intuitivo e acolhedor. Poucas ações por tela.
- **Cores** (tokens; tema escuro definido em `globals.css`):
  - primária (oliva): `#616850`, base 3D `#4A5039`, suave `#E6E9D9`
  - secundária (creme): `#F2E0C7`, profunda `#E2C9A6`
  - acento terracota (modo prestador): `#9A5638`, suave `#F9ECE4`; dourado `#E5A93B`
  - fundo: `#FBF6EE` (página), `#FFFFFF` (card), `#F5EDE1` (rebaixado); texto `#2E2B27` / `#5E5A56`
  - sucesso / alerta / erro: `#2F6B3F` / `#8A5A0B` / `#A3352B` (fundos `#E1EFDF` / `#FBEBC9` / `#F8DEDA`; botão de erro `#B8433A`)
  - foco/info: `#2F5E7A`
  - proporção de uso: página 60%, creme 15%, oliva 15%, terracota 5%, dourado 5%
- **Tipografia**: Poppins em toda a interface. Títulos 700 (h1 28/36, h2 22/30), h3 600 18/26, corpo 400 16/24.
  Display (48/52 e 36/42) usa Bilgie quando o arquivo chegar; até lá, Poppins Bold. Campos nunca abaixo de 16px.
- **Forma**: grade de 4px; cantos 8/12/16/24px e pílula. **Assinatura 3D**: botão com base sólida de 4px que some ao pressionar; card com base de 2px.
- **Alturas de toque**: 40 / 48 / 56px.
- **Ícones**: estilo Duolingo, grid 48×48, forma oliva + sombra inferior + detalhe creme + um acento (terracota ou dourado).
  Todos em `components/ui/Icone.tsx`, usando tokens `--icon-*`. Aba inativa = ícone cinza (`inativo`). Ícone nunca substitui texto em ações.
- **Textos da interface**: frases curtas, tom próximo e gentil, botões começando com verbo ("Solicitar serviço", "Aceitar oportunidade").
- Todas as cores ficam como tokens; nunca usar cor solta no código.
- Layout responsivo, pensado primeiro para celular (barra de abas inferior no celular).
- Logo: provisório em `public/logo.png` (do site oficial), aguardando o arquivo final.

## Como trabalhar neste repositório
- Antes de implementar algo grande, apresente um plano e espere aprovação.
- Desenvolva uma funcionalidade por vez, em branch própria: `feat/nome-curto`.
- Commits em português, no formato: `feat: ...`, `fix: ...`, `style: ...`, `docs: ...`.
- Componentes reutilizáveis em `components/`; não duplique componentes que já existem.
- Ao terminar uma funcionalidade, rode `npm run lint` e `npm run typecheck` e explique como testar manualmente.
- Nomes do domínio (tabelas, tipos, funções) em português.
