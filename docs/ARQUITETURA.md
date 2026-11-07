# Arquitetura

Este documento é para quem vai trabalhar no código: descreve como o MVP de front-end está organizado hoje e o plano para ligar o Supabase.

## Hoje: MVP de front-end

```
app/                      rotas (App Router)
  page.tsx                página inicial pública
  entrar/ cadastro/ cadastro/prestador/ ajuda/ privacidade/
  cliente/                área do cliente (layout protegido)
    pedidos/novo  pedidos/[id]  estofados/  estofados/[id]  laudos/[id]  perfil/
  prestador/              área do prestador (layout protegido + checagem de aprovação)
    aguardando-aprovacao/  oportunidades/?visao=cards|mapa  servicos/  servicos/[id]
    servicos/[id]/prontuario/[prontuarioId]  laudos/[id]  perfil/
  admin/                  área da admin
    clientes/ prestadores/ pedidos/ suporte/ lembretes/ laudos/[id]
components/
  ui/                     Botao, Base (Card, Selo, Alerta, Avatar…), Campos, Passos, Fotos, Dialogo, Icone
  layout/                 AppShell (cabeçalho + abas), AreaProtegida, Logo, Pronto
  pedidos/ oportunidades/ mapa/ prontuario/ suporte/ perfil/ prestador/
lib/
  dados/
    tipos.ts              modelo de dados (espelha as tabelas futuras)
    catalogo.ts           preços, prazos, nomes, status
    protocolo.ts          checklist do Protocolo Aurora
    acesso.ts             regras de acesso por perfil
    consultas.ts          leituras com projeção segura (ex.: oportunidades sem endereço)
    acoes.ts              todas as escritas, sempre checando o perfil
    store.ts              estado no navegador (localStorage)
    seed.ts               dados de demonstração
  arquivos.ts             fotos/documentos (IndexedDB) + remoção de EXIF
  geo.ts                  região metropolitana, distância, localização aproximada
```

**Regra de ouro:** as telas nunca alteram o estado diretamente. Elas chamam uma ação de `acoes.ts`, e a ação confere quem está logado.
Na fase do back-end, só o corpo dessas funções muda (de `mudar(...)` para chamadas ao Supabase). As telas continuam iguais.

## Próxima fase: Supabase

### Tabelas

| Tabela | Campos principais | Observação |
|---|---|---|
| `perfis` | id (= auth.users), papel, nome, telefone, aceite_termos_em | papel só cliente/prestador no cadastro; admin via SQL |
| `prestadores` | perfil_id, status, cpf, cidade, bairro, base (geography), raio_km, bio, motivo, avaliado_por | |
| `prestador_documentos` | prestador_id, tipo (documento/certificado), caminho_storage | bucket privado |
| `enderecos` | cliente_id, cep, logradouro, numero, complemento, bairro, cidade, uf, localizacao (geography) | **única tabela com o ponto exato** |
| `estofados` | cliente_id, tipo, apelido, tecido | base do histórico |
| `pedidos` | cliente_id, endereco_id, prestador_id, status, data, periodo, pet, subtotal, desconto, cupom, total, bairro, cidade, local_aprox | `local_aprox` gerado por gatilho, uma única vez |
| `pedido_itens` | pedido_id, estofado_id, servico, valor | |
| `pedido_fotos` | pedido_id, caminho_storage | |
| `pedido_eventos` | pedido_id, autor_id, texto, em | auditoria |
| `pagamentos` | pedido_id, metodo, parcelas, valor, pago_em, reembolsado_em, id_provedor | dados de cartão ficam só no provedor |
| `checklist_modelo` | id, secao, pergunta, tipo, opcoes, obrigatoria, so_impermeabilizacao, versao | editável pela admin |
| `prontuarios` | pedido_id, item_id, estofado_id, prestador_id, status, versao_protocolo, finalizado_em | |
| `prontuario_respostas` | prontuario_id, pergunta_id, valor (jsonb) | |
| `prontuario_fotos` | prontuario_id, momento (antes/depois), caminho_storage | |
| `laudos` | numero, prontuario_id, pedido_id, estofado_id, cliente_id, conteudo (jsonb congelado), emitido_em | |
| `lembretes` | estofado_id, cliente_id, laudo_id, data_prevista, status, enviado_em | |
| `avaliacoes` | pedido_id (único), cliente_id, prestador_id, nota 1–5, comentario, oculta_motivo, oculta_em | cliente avalia após concluir; admin modera; público vê só nome curto |
| `chamados` | pedido_id, aberto_por, tipo, assunto, status, resolucao | |
| `chamado_mensagens` | chamado_id, autor_id, texto, em | |

### Funções (RPC, `security definer`) — equivalentes às de `acoes.ts`

| Função | Garante |
|---|---|
| `oportunidades_proximas()` | Devolve só os campos públicos e só para prestador aprovado, dentro do raio |
| `aceitar_pedido(id)` | Aceite atômico: `update ... where status = 'aberto' and prestador_id is null` |
| `iniciar_servico(id)` | Cria os prontuários |
| `finalizar_prontuario(id)` | Checklist obrigatório + ao menos 1 foto de antes e 1 de depois; gera o laudo e o lembrete |
| `pagar_pedido(id, ...)` | Chamada pelo webhook do provedor de pagamento, não pelo navegador |
| `resolver_chamado(id, decisao, texto)` | Só admin |

### Regras de acesso (RLS)

Resumo da regra para cada tabela:
- **Cliente**: lê e escreve só o que é dele (`cliente_id = auth.uid()`).
- **Prestador**:
  - nunca faz `select` direto em `pedidos` abertos; usa a RPC de oportunidades;
  - em `enderecos` e `perfis.telefone`, só lê quando é o prestador do pedido e `prestador_ve_contato()` retorna verdadeiro.
- **Admin**: lê tudo; escreve só pelas RPCs, para que tudo fique registrado.

### Outros serviços

- **Lembretes:** cron diário (Supabase Scheduled Function ou Vercel Cron) envia o e-mail 30 dias antes de `data_prevista`.
  Envio por um serviço como Resend.
- **Mapa:** os tiles do OpenStreetMap têm política de uso justo. Para volume maior, usar um provedor de tiles.
  Busca de coordenadas pelo endereço (Nominatim) **no servidor**, com cache.
- **Pagamento:** Mercado Pago ou Pagar.me (Pix e cartão em até 3x), com webhook.
