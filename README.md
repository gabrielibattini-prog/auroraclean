# Aurora Clean — plataforma

Rede de prestadores qualificados em higienização e impermeabilização de estofados, no padrão Aurora Clean.

**Fase atual:** MVP só de front-end. Todas as telas e regras funcionam, mas os dados ficam no seu navegador.
O back-end (Supabase) é a próxima fase; o plano está em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Outros comandos:
- `npm run lint`: verifica o padrão do código;
- `npm run typecheck`: checa os tipos do TypeScript;
- `npm run build`: gera a versão de produção.

## Contas de demonstração

Na tela **Entrar**, use os botões de demonstração ou entre com o e-mail e qualquer senha de 6 ou mais caracteres.

| Perfil | E-mail |
|---|---|
| Cliente | carla@exemplo.com · rafael@exemplo.com |
| Prestador aprovado | marlene@exemplo.com · bruna@exemplo.com |
| Prestador em análise | joao@exemplo.com |
| Admin (fundadora) | admin@auroraclean.com.br |

Para voltar aos dados iniciais, use **Restaurar dados de demonstração** na tela Entrar.

## Roteiro de teste manual

0. **Tutorial:** na página inicial, seção **Como usar** (abas Sou cliente / Sou prestador).
1. **Cliente:** entre como Carla → **Solicitar** → escolha estofados, serviço, fotos, endereço e data → **Solicitar serviço**.
   Ou vá em **Estofados** → **Recontratar serviço** para repetir um serviço sem cadastrar o estofado de novo.
2. **Prestador em análise:** entre como João. As oportunidades ficam bloqueadas até a aprovação.
3. **Prestador aprovado:** entre como Marlene.
   - Em **Oportunidades**, alterne entre **Cards** e **Mapa**. Confira que aparece só o primeiro nome do cliente, sem endereço, sobrenome ou telefone.
   - Aceite um pedido. Agora o endereço e o telefone aparecem.
   - Toque em **Iniciar serviço** e abra o prontuário. Preencha o checklist e envie fotos de antes e de depois.
   - Toque em **Finalizar e enviar laudo**.
4. **Cliente:** entre como Carla, abra a ordem de serviço, veja o laudo, pague com Pix ou cartão (simulado) e avalie o prestador.
5. **Admin:**
   - Painel e lista de clientes.
   - Aprove o João em **Prestadores** (lá também ficam as avaliações, com opção de ocultar).
   - Medie a disputa em **Suporte**.
   - Veja a prévia do e-mail em **Lembretes**.

## Documentos

- [`CLAUDE.md`](CLAUDE.md): contexto, regras de negócio e guia de estilos.
- [`docs/LGPD.md`](docs/LGPD.md): tratamento de dados pessoais.
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md): estrutura do código e plano do back-end.
