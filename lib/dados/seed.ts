import { precoItem, MESES_REIMPERMEABILIZACAO } from "./catalogo";
import { gerarLocalAproximado, simularPontoExato } from "../geo";
import { VERSAO_PROTOCOLO } from "./protocolo";
import type { Estado, Pedido } from "./tipos";
import { dataISO, somarDias, somarMeses } from "./util";

/**
 * Dados de demonstração. Pessoas e endereços são fictícios.
 * Contas de teste (senha qualquer com 6+ caracteres):
 *  - admin@auroraclean.com.br  (admin / fundadora)
 *  - carla@exemplo.com         (cliente)
 *  - rafael@exemplo.com        (cliente)
 *  - marlene@exemplo.com       (prestador aprovado)
 *  - joao@exemplo.com          (prestador aguardando aprovação)
 *  - bruna@exemplo.com         (prestador aprovado, Barueri)
 */
export function criarSeed(): Estado {
  const hoje = new Date();
  const iso = (d: Date) => d.toISOString();
  // datas futuras nunca caem no domingo (não há atendimento)
  const dia = (n: number) => {
    const d = somarDias(hoje, n);
    if (n > 0 && d.getDay() === 0) d.setDate(d.getDate() + 1);
    return dataISO(d);
  };

  const coordCarla = simularPontoExato("São Paulo", "Pinheiros", "end_carla")!;
  const coordRafael = simularPontoExato("São Paulo", "Moema", "end_rafael")!;
  const coordRafael2 = simularPontoExato("Barueri", "Alphaville", "end_rafael2")!;

  const pedidos: Pedido[] = [
    // 1. Aberto (oportunidade) — Carla, Pinheiros
    {
      id: "ped_aberto1",
      numero: 1042,
      clienteId: "usr_carla",
      enderecoId: "end_carla",
      itens: [
        { id: "it_1", estofadoId: "est_sofa_carla", servico: "combo", valor: precoItem("sofa_3", "combo", "sintetico") },
        { id: "it_2", estofadoId: "est_poltrona_carla", servico: "higienizacao", valor: precoItem("poltrona", "higienizacao", "natural") },
      ],
      pet: true,
      fotosCliente: [],
      data: dia(3),
      periodo: "manha",
      observacoes: "Temos um cachorro. Mancha de café no braço do sofá.",
      status: "aberto",
      subtotal: 0,
      desconto: 0,
      total: 0,
      bairro: "Pinheiros",
      cidade: "São Paulo",
      localAprox: gerarLocalAproximado(coordCarla, "ped_aberto1"),
      criadoEm: iso(somarDias(hoje, -1)),
    },
    // 2. Aberto — Rafael, Moema
    {
      id: "ped_aberto2",
      numero: 1043,
      clienteId: "usr_rafael",
      enderecoId: "end_rafael",
      itens: [
        { id: "it_3", estofadoId: "est_colchao_rafael", servico: "higienizacao", valor: precoItem("colchao_casal", "higienizacao", "sintetico") },
      ],
      pet: false,
      fotosCliente: [],
      data: dia(5),
      periodo: "tarde",
      observacoes: "",
      status: "aberto",
      subtotal: 0,
      desconto: 0,
      total: 0,
      bairro: "Moema",
      cidade: "São Paulo",
      localAprox: gerarLocalAproximado(coordRafael, "ped_aberto2"),
      criadoEm: iso(hoje),
    },
    // 3. Aberto — Rafael, Alphaville (fora do raio da Marlene)
    {
      id: "ped_aberto3",
      numero: 1044,
      clienteId: "usr_rafael",
      enderecoId: "end_rafael2",
      itens: [
        { id: "it_4", estofadoId: "est_cadeiras_rafael", servico: "impermeabilizacao", valor: precoItem("cadeira", "impermeabilizacao", "sintetico") * 6 },
      ],
      pet: false,
      fotosCliente: [],
      data: dia(6),
      periodo: "noite",
      observacoes: "6 cadeiras de jantar.",
      status: "aberto",
      subtotal: 0,
      desconto: 0,
      total: 0,
      bairro: "Alphaville",
      cidade: "Barueri",
      localAprox: gerarLocalAproximado(coordRafael2, "ped_aberto3"),
      criadoEm: iso(hoje),
    },
    // 4. Aceito pela Marlene — Carla
    {
      id: "ped_aceito",
      numero: 1038,
      clienteId: "usr_carla",
      enderecoId: "end_carla",
      prestadorId: "usr_marlene",
      itens: [
        { id: "it_5", estofadoId: "est_colchao_carla", servico: "higienizacao", valor: precoItem("colchao_queen_king", "higienizacao", "sintetico") },
      ],
      pet: false,
      fotosCliente: [],
      data: dia(1),
      periodo: "tarde",
      observacoes: "Portaria pede documento.",
      status: "aceito",
      subtotal: 0,
      desconto: 0,
      total: 0,
      bairro: "Pinheiros",
      cidade: "São Paulo",
      localAprox: gerarLocalAproximado(coordCarla, "ped_aceito"),
      criadoEm: iso(somarDias(hoje, -4)),
      aceitoEm: iso(somarDias(hoje, -3)),
    },
    // 5. Concluído há 11 meses — gera laudo e lembrete próximo
    {
      id: "ped_concluido",
      numero: 981,
      clienteId: "usr_carla",
      enderecoId: "end_carla",
      prestadorId: "usr_marlene",
      itens: [{ id: "it_6", estofadoId: "est_sofa_carla", servico: "combo", valor: precoItem("sofa_3", "combo", "sintetico") }],
      pet: false,
      fotosCliente: [],
      data: dataISO(somarMeses(hoje, -11)),
      periodo: "manha",
      observacoes: "",
      status: "concluido",
      subtotal: 0,
      desconto: 0,
      total: 0,
      bairro: "Pinheiros",
      cidade: "São Paulo",
      localAprox: gerarLocalAproximado(coordCarla, "ped_concluido"),
      criadoEm: iso(somarMeses(hoje, -11)),
      aceitoEm: iso(somarMeses(hoje, -11)),
      iniciadoEm: iso(somarMeses(hoje, -11)),
      finalizadoEm: iso(somarMeses(hoje, -11)),
      concluidoEm: iso(somarMeses(hoje, -11)),
      pagamento: { metodo: "pix", parcelas: 1, valor: 0, pagoEm: iso(somarMeses(hoje, -11)) },
    },
    // 6. Em disputa — Rafael
    {
      id: "ped_disputa",
      numero: 1021,
      clienteId: "usr_rafael",
      enderecoId: "end_rafael",
      prestadorId: "usr_bruna",
      itens: [{ id: "it_7", estofadoId: "est_sofa_rafael", servico: "higienizacao", valor: precoItem("sofa_retratil", "higienizacao", "natural") }],
      pet: false,
      fotosCliente: [],
      data: dia(-4),
      periodo: "manha",
      observacoes: "",
      status: "em_disputa",
      subtotal: 0,
      desconto: 0,
      total: 0,
      bairro: "Moema",
      cidade: "São Paulo",
      localAprox: gerarLocalAproximado(coordRafael, "ped_disputa"),
      criadoEm: iso(somarDias(hoje, -8)),
      aceitoEm: iso(somarDias(hoje, -7)),
      iniciadoEm: iso(somarDias(hoje, -4)),
      finalizadoEm: iso(somarDias(hoje, -4)),
      concluidoEm: iso(somarDias(hoje, -4)),
      pagamento: { metodo: "credito", parcelas: 3, valor: 0, pagoEm: iso(somarDias(hoje, -4)) },
    },
  ];

  for (const p of pedidos) {
    p.subtotal = p.itens.reduce((s, i) => s + i.valor, 0) + (p.pet ? 70 : 0);
    p.total = p.subtotal - p.desconto;
    if (p.pagamento) p.pagamento.valor = p.total;
  }

  const dataLaudo = somarMeses(hoje, -11);

  return {
    versao: 1,
    sessaoId: null,
    usuarios: [
      { id: "usr_admin", papel: "admin", nome: "Fundadora Aurora", email: "admin@auroraclean.com.br", telefone: "(11) 92595-8991", criadoEm: iso(somarMeses(hoje, -24)), aceiteTermosEm: iso(somarMeses(hoje, -24)) },
      { id: "usr_carla", papel: "cliente", nome: "Carla Mendes", email: "carla@exemplo.com", telefone: "(11) 98888-1234", criadoEm: iso(somarMeses(hoje, -12)), aceiteTermosEm: iso(somarMeses(hoje, -12)) },
      { id: "usr_rafael", papel: "cliente", nome: "Rafael Lima", email: "rafael@exemplo.com", telefone: "(11) 97777-4321", criadoEm: iso(somarMeses(hoje, -2)), aceiteTermosEm: iso(somarMeses(hoje, -2)) },
      { id: "usr_hist", papel: "cliente", nome: "Juliana Prado", email: "juliana@exemplo.com", telefone: "(11) 93333-1212", criadoEm: iso(somarMeses(hoje, -8)), aceiteTermosEm: iso(somarMeses(hoje, -8)) },
      { id: "usr_hist2", papel: "cliente", nome: "Paulo Henrique Costa", email: "paulo@exemplo.com", telefone: "(11) 92222-3434", criadoEm: iso(somarMeses(hoje, -3)), aceiteTermosEm: iso(somarMeses(hoje, -3)) },
      { id: "usr_marlene", papel: "prestador", nome: "Marlene Souza", email: "marlene@exemplo.com", telefone: "(11) 96666-1111", criadoEm: iso(somarMeses(hoje, -14)), aceiteTermosEm: iso(somarMeses(hoje, -14)) },
      { id: "usr_joao", papel: "prestador", nome: "João Pereira", email: "joao@exemplo.com", telefone: "(11) 95555-2222", criadoEm: iso(somarDias(hoje, -2)), aceiteTermosEm: iso(somarDias(hoje, -2)) },
      { id: "usr_bruna", papel: "prestador", nome: "Bruna Alves", email: "bruna@exemplo.com", telefone: "(11) 94444-3333", criadoEm: iso(somarMeses(hoje, -6)), aceiteTermosEm: iso(somarMeses(hoje, -6)) },
    ],
    prestadores: [
      { usuarioId: "usr_marlene", status: "aprovado", cpf: "123.456.789-00", cidade: "São Paulo", bairro: "Vila Madalena", base: { lat: -23.5536, lng: -46.6911 }, raioKm: 12, bio: "Higienizo estofados há 8 anos. Formada no protocolo Aurora.", ocultos: [], avaliadoEm: iso(somarMeses(hoje, -14)), avaliadoPor: "usr_admin", documento: { id: "demo", nome: "rg-marlene.jpg", tipo: "image/jpeg" }, certificado: { id: "demo", nome: "certificado-aurora.pdf", tipo: "application/pdf" } },
      { usuarioId: "usr_joao", status: "pendente", cpf: "987.654.321-00", cidade: "São Paulo", bairro: "Tatuapé", base: { lat: -23.5407, lng: -46.576 }, raioKm: 10, bio: "Trabalho com limpeza há 3 anos e fiz o curso Aurora em outubro.", ocultos: [], documento: { id: "demo", nome: "cnh-joao.jpg", tipo: "image/jpeg" }, certificado: { id: "demo", nome: "certificado-joao.pdf", tipo: "application/pdf" } },
      { usuarioId: "usr_bruna", status: "aprovado", cpf: "111.222.333-44", cidade: "Barueri", bairro: "Alphaville", base: { lat: -23.495, lng: -46.85 }, raioKm: 25, bio: "Especialista em tecidos naturais.", ocultos: [], avaliadoEm: iso(somarMeses(hoje, -6)), avaliadoPor: "usr_admin", documento: { id: "demo", nome: "rg-bruna.jpg", tipo: "image/jpeg" }, certificado: { id: "demo", nome: "certificado-bruna.pdf", tipo: "application/pdf" } },
    ],
    enderecos: [
      { id: "end_carla", clienteId: "usr_carla", cep: "05422-010", logradouro: "Rua dos Pinheiros", numero: "120", complemento: "Apto 54", bairro: "Pinheiros", cidade: "São Paulo", uf: "SP", coord: coordCarla },
      { id: "end_rafael", clienteId: "usr_rafael", cep: "04077-000", logradouro: "Alameda dos Maracatins", numero: "300", complemento: "", bairro: "Moema", cidade: "São Paulo", uf: "SP", coord: coordRafael },
      { id: "end_rafael2", clienteId: "usr_rafael", cep: "06454-000", logradouro: "Alameda Rio Negro", numero: "500", complemento: "Casa 2", bairro: "Alphaville", cidade: "Barueri", uf: "SP", coord: coordRafael2 },
    ],
    estofados: [
      { id: "est_sofa_carla", clienteId: "usr_carla", tipo: "sofa_3", apelido: "Sofá da sala", tecido: "sintetico", criadoEm: iso(somarMeses(hoje, -11)) },
      { id: "est_poltrona_carla", clienteId: "usr_carla", tipo: "poltrona", apelido: "Poltrona de leitura", tecido: "natural", criadoEm: iso(somarDias(hoje, -1)) },
      { id: "est_colchao_carla", clienteId: "usr_carla", tipo: "colchao_queen_king", apelido: "Colchão do quarto", tecido: "sintetico", criadoEm: iso(somarDias(hoje, -4)) },
      { id: "est_colchao_rafael", clienteId: "usr_rafael", tipo: "colchao_casal", apelido: "Colchão casal", tecido: "sintetico", criadoEm: iso(hoje) },
      { id: "est_cadeiras_rafael", clienteId: "usr_rafael", tipo: "cadeira", apelido: "Cadeiras de jantar (6)", tecido: "sintetico", criadoEm: iso(hoje) },
      { id: "est_sofa_rafael", clienteId: "usr_rafael", tipo: "sofa_retratil", apelido: "Sofá retrátil de linho", tecido: "natural", criadoEm: iso(somarDias(hoje, -8)) },
    ],
    pedidos,
    eventos: [
      { id: "ev_1", pedidoId: "ped_aceito", em: iso(somarDias(hoje, -4)), autorId: "usr_carla", texto: "Ordem de serviço criada." },
      { id: "ev_2", pedidoId: "ped_aceito", em: iso(somarDias(hoje, -3)), autorId: "usr_marlene", texto: "Marlene S. aceitou o serviço." },
      { id: "ev_3", pedidoId: "ped_disputa", em: iso(somarDias(hoje, -4)), autorId: "usr_bruna", texto: "Serviço finalizado com prontuário completo." },
      { id: "ev_4", pedidoId: "ped_disputa", em: iso(somarDias(hoje, -2)), autorId: "usr_rafael", texto: "Cliente abriu uma disputa." },
      { id: "ev_5", pedidoId: "ped_aberto1", em: iso(somarDias(hoje, -1)), autorId: "usr_carla", texto: "Ordem de serviço criada." },
    ],
    prontuarios: [
      {
        id: "pr_conc",
        pedidoId: "ped_concluido",
        itemId: "it_6",
        estofadoId: "est_sofa_carla",
        prestadorId: "usr_marlene",
        respostas: { tecido: "Suede", estado: "Bom", manchas: ["Bebida", "Alimento"], teste_cor: true, aspiracao: true, pre_tratamento: true, produtos: "Detergente neutro 1:20; impermeabilizante base água", extracao: true, impermeabilizante: true, secagem: "4 a 6 horas", observacoes: "Mancha de vinho no assento saiu 90%." },
        fotosAntes: [],
        fotosDepois: [],
        status: "finalizado",
        versaoProtocolo: VERSAO_PROTOCOLO,
        finalizadoEm: iso(dataLaudo),
      },
    ],
    laudos: [
      {
        id: "ld_1",
        numero: 312,
        prontuarioId: "pr_conc",
        pedidoId: "ped_concluido",
        estofadoId: "est_sofa_carla",
        clienteId: "usr_carla",
        emitidoEm: iso(dataLaudo),
        conteudo: {
          estofado: "Sofá da sala",
          tipo: "sofa_3",
          tecido: "sintetico",
          servico: "combo",
          prestadorNome: "Marlene S.",
          respostas: [
            { pergunta: "Qual é o tecido?", resposta: "Suede" },
            { pergunta: "Estado geral do estofado", resposta: "Bom" },
            { pergunta: "Manchas encontradas", resposta: "Bebida, Alimento" },
            { pergunta: "Produtos usados e diluição", resposta: "Detergente neutro 1:20; impermeabilizante base água" },
            { pergunta: "Tempo de secagem orientado ao cliente", resposta: "4 a 6 horas" },
            { pergunta: "Observações para o cliente", resposta: "Mancha de vinho no assento saiu 90%." },
          ],
          fotosAntes: [],
          fotosDepois: [],
          proximaImpermeabilizacao: dataISO(somarMeses(dataLaudo, MESES_REIMPERMEABILIZACAO)),
        },
      },
    ],
    lembretes: [
      { id: "lb_1", estofadoId: "est_sofa_carla", clienteId: "usr_carla", laudoId: "ld_1", dataPrevista: dataISO(somarMeses(dataLaudo, MESES_REIMPERMEABILIZACAO)), status: "agendado" },
    ],
    chamados: [
      { id: "ch_1", pedidoId: "ped_disputa", abertoPor: "usr_rafael", tipo: "disputa", assunto: "Manchas voltaram depois de secar", status: "em_mediacao", criadoEm: iso(somarDias(hoje, -2)) },
    ],
    mensagens: [
      { id: "msg_1", chamadoId: "ch_1", autorId: "usr_rafael", texto: "Oi! Depois que secou, duas manchas no assento voltaram a aparecer.", em: iso(somarDias(hoje, -2)) },
      { id: "msg_2", chamadoId: "ch_1", autorId: "usr_admin", texto: "Oi, Rafael! Sentimos muito. Pode mandar uma foto? Vamos olhar o prontuário do serviço.", em: iso(somarDias(hoje, -2)) },
      { id: "msg_3", chamadoId: "ch_1", autorId: "usr_bruna", texto: "No prontuário anotei que eram manchas antigas de tinta, avisei que poderiam não sair 100%.", em: iso(somarDias(hoje, -1)) },
    ],
    avaliacoes: [
      { id: "av_1", pedidoId: "ped_concluido", clienteId: "usr_carla", prestadorId: "usr_marlene", nota: 5, comentario: "Chegou no horário, explicou cada etapa e o sofá ficou como novo. A mancha de vinho quase sumiu!", criadoEm: iso(somarMeses(hoje, -11)) },
      { id: "av_2", pedidoId: "ped_hist_1", clienteId: "usr_hist", prestadorId: "usr_marlene", nota: 5, comentario: "Muito cuidadosa com o meu colchão. Recomendo!", criadoEm: iso(somarMeses(hoje, -5)) },
      { id: "av_3", pedidoId: "ped_hist_2", clienteId: "usr_hist2", prestadorId: "usr_marlene", nota: 4, comentario: "Ótimo resultado, só atrasou uns 15 minutos.", criadoEm: iso(somarMeses(hoje, -2)) },
      { id: "av_4", pedidoId: "ped_hist_3", clienteId: "usr_hist", prestadorId: "usr_bruna", nota: 5, comentario: "Especialista mesmo em linho. Poltrona salva!", criadoEm: iso(somarMeses(hoje, -3)) },
    ],
    contadores: { pedido: 1044, laudo: 312 },
  };
}
