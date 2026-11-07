# LGPD na plataforma Aurora Clean

Documento interno da equipe. Ele explica como a plataforma trata dados pessoais conforme a Lei nº 13.709/2018 (LGPD).
A versão resumida para usuários está em `/privacidade`.

> Status: o MVP de front-end já cumpre as regras abaixo dentro do navegador. Na fase do back-end, as mesmas regras viram
> políticas RLS e funções no Supabase (ver `ARQUITETURA.md`). **Antes de lançar, um profissional jurídico precisa revisar
> este documento e a política pública.**

## 1. Quais dados coletamos e por quê

| Dado | De quem | Finalidade | Base legal (art. 7º) |
|---|---|---|---|
| Nome, e-mail, celular | Cliente e prestador | Conta, contato sobre o serviço, envio do laudo | Execução de contrato |
| Endereço do serviço | Cliente | Execução do serviço | Execução de contrato |
| Fotos dos estofados | Cliente e prestador | Orçamento, prontuário e laudo | Execução de contrato |
| CPF, documento com foto, certificado | Prestador | Verificar identidade e qualificação | Execução de contrato / legítimo interesse (segurança dos clientes) |
| Bairro-base e raio de atendimento | Prestador | Calcular distância das oportunidades | Execução de contrato |
| Histórico de serviços, prontuários e laudos | Cliente (por estofado) | Histórico, garantia, mediação | Execução de contrato |
| Pagamentos (valor, forma, data) | Cliente | Cobrança e obrigações fiscais | Obrigação legal |
| E-mail para lembretes | Cliente | Lembrete de reimpermeabilização | Legítimo interesse, com opção de sair |

O que **não** coletamos:
- **dados de cartão**: na versão real, eles vão direto ao provedor de pagamento;
- **localização em tempo real** de ninguém;
- **metadados GPS das fotos**, que são removidos antes de salvar.

## 2. Minimização: quem vê o quê

| Informação | Cliente | Prestador | Admin |
|---|---|---|---|
| Bairro e área aproximada do pedido | o próprio | sim, se estiver aprovado e dentro do raio | sim |
| Endereço exato e telefone do cliente | o próprio | **só depois de aceitar**, até **7 dias** após a conclusão | sim |
| Nome do cliente | o próprio | **primeiro nome** já na oportunidade; inicial do sobrenome só depois do aceite | completo |
| Nome do prestador | primeiro nome e inicial, depois do aceite | o próprio | sim |
| Telefone do prestador | **nunca** (fala com a Aurora pelo WhatsApp/suporte) | o próprio | sim |
| CPF e documentos do prestador | não | o próprio | sim |
| Laudo e prontuário | os dos próprios estofados | os que ele fez | sim |

Regras técnicas que garantem isso:
- **Localização aproximada.** O ponto mostrado no mapa é sorteado **uma única vez** entre 300 e 800 m do endereço real e fica salvo. Se fosse sorteado de novo a cada consulta, bastaria tirar a média de várias consultas para achar o endereço real. No mapa aparece um círculo de cerca de 1 km com zoom limitado, e a distância é arredondada ("~3 km").
- **Fotos.** Toda foto é redimensionada e reconvertida no navegador antes do envio, o que descarta o EXIF, inclusive o GPS.
- **Consultas restritas.** As oportunidades vêm de uma consulta própria (`oportunidades()` → no back-end, uma função RPC) que devolve só campos não identificáveis.

## 3. Direitos do titular (art. 18) e onde exercer

| Direito | Como exercer na plataforma |
|---|---|
| Confirmação e acesso | Telas da conta + **Perfil → Baixar meus dados** (arquivo JSON) |
| Correção | **Perfil → Seus dados** |
| Portabilidade | **Baixar meus dados** |
| Eliminação | **Perfil → Excluir minha conta** (bloqueado se houver serviço em andamento) |
| Revogação do consentimento para lembretes | Link "parar" no e-mail; na fase do back-end, também uma opção no perfil |
| Informação sobre compartilhamento | Política em `/privacidade` |

## 4. Retenção e eliminação

O que acontece quando o titular **exclui a conta**:
- nome, e-mail e telefone são **anonimizados**;
- os endereços são **apagados**;
- os lembretes são **cancelados**.

Pedidos, laudos e pagamentos ficam guardados **sem identificação pessoal**, pelo prazo fiscal e de defesa em eventual processo (sugestão: 5 anos, a validar com o jurídico).

Na fase do back-end:
- documentos de prestadores **reprovados** são apagados 90 dias após a decisão (sugestão);
- fotos de pedidos **cancelados sem execução** são apagadas em 30 dias (sugestão).

## 5. Segurança (fase do back-end)

- Row Level Security em todas as tabelas. O perfil é checado em toda consulta.
- Buckets de armazenamento privados, com acesso apenas por URL assinada e de curta duração.
- Chave `service_role` só no servidor (cron de lembretes), nunca no navegador.
- HTTPS obrigatório. Dados criptografados em repouso pelo provedor.
- Registro de eventos por pedido (`pedido_eventos`) para auditoria e mediação.

## 6. Encarregado (DPO) e incidentes

- **Encarregado:** a definir. Pode ser a própria fundadora no início.
  O canal de contato precisa estar publicado em `/privacidade`; hoje o contato oficial é o WhatsApp (11) 92595-8991.
- **Incidente:** em caso de vazamento, avaliar o risco e comunicar à ANPD e aos titulares em prazo razoável, conforme a regulamentação da ANPD.
  Registrar o ocorrido.

## 7. Pendências antes do lançamento

- [ ] Revisão jurídica da política e dos termos de uso.
- [ ] Definir o encarregado e o e-mail de privacidade.
- [ ] Confirmar os prazos de retenção.
- [ ] Contrato com o provedor de pagamento e o de e-mail, como operadores de dados.
- [ ] Opção de sair dos lembretes no perfil.
