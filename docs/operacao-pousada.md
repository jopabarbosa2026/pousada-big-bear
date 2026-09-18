# Operação da Pousada Big Bear 2

> Copiado do repo `Site BBB2` em 2026-09-18, quando as duas pousadas passaram a
> dividir este site. Continua valendo **só para a unidade Big Bear 2**
> (`/big-bear-2`). Os fatos da Big Bear 1 estão na seção no fim deste arquivo.

Fonte de verdade sobre os fatos operacionais da pousada: horários, políticas,
comodidades e valores.

**Leia este arquivo antes de escrever ou alterar qualquer texto voltado ao
hóspede.** Se um fato não estiver aqui, ele está pendente com o gerente — o
texto deve evitar a afirmação em vez de supor. Nada neste arquivo pode ser
preenchido por dedução: só entra o que veio da pousada.

Última atualização: 2026-09-08

---

## Confirmado

Já publicado no site. A coluna de origem aponta onde o dado vive hoje.

| Fato | Valor | Onde está no código |
| --- | --- | --- |
| Endereço | Av. Emílio Ribas, 1074 — Vila Capivari, Campos do Jordão/SP | `content/site.ts` |
| Telefone / WhatsApp | (12) 99639-4583 | `content/site.ts` |
| E-mail | recepcao@pousadabigbear2.com.br | `content/site.ts` |
| Distância da Praça do Capivari | 100 metros | `content/hero.ts` |
| Distância do centro turístico | 3 minutos a pé | `content/beneficios.ts` |
| Altitude | 1.628 metros | `content/beneficios.ts` |
| Em operação desde | 2004 (+20 anos) | `content/site.ts` |
| Café da manhã | Estilo brunch: tapiocas, omeletes, pães artesanais, geleias caseiras, sucos naturais | `content/beneficios.ts` |
| Café da manhã — horário | Das 08:00 às 11:00 | `content/faq.ts` |
| Café da manhã — restrição alimentar | Há opções sem glúten; o hóspede deve informar no ato da reserva | `content/faq.ts` |
| Café da manhã — inclusão | Incluso nas três categorias de suíte | `content/acomodacoes.ts` |
| Estacionamento | Gratuito, **coberto**, uma vaga por unidade habitacional | `content/beneficios.ts` |
| Academia e sauna | Ficam na **unidade Big Bear 1**. Hóspedes da Big Bear 2 podem usar, sem agendamento e sem custo | `content/beneficios.ts` |
| Sauna — quantidade | Uma só, na Big Bear 1, de uso comum. **Não** é comodidade privativa da Conjugada | `content/acomodacoes.ts` |
| Elevador | Existe | `content/galeria.ts` |
| Acessibilidade | Fácil acesso para cadeirante, além do elevador | `content/faq.ts` |
| Bicicletas | Disponíveis para hóspedes | `content/beneficios.ts` |
| Late checkout | Até as 14:00, sem custo, em reserva direta | `content/beneficios.ts` |
| Mínimo de noites | Meio de semana: 1 noite. Fim de semana: mínimo de 2 diárias, de sexta a domingo | `content/faq.ts` |
| Restaurante / room service | Só o salão de café da manhã. **Não** há serviço de quarto | `content/faq.ts` |
| Transfer | A pousada **não opera** transfer. Há táxis direto na rodoviária | `content/faq.ts` |
| Desconto de reserva direta | Até 15% | `content/beneficios.ts` |
| Promoção sazonal vigente | Primavera, anunciada com "condições especiais para os feriados" (sem percentual definido). Trocada de "feriado" para "primavera" a pedido do proprietário em 2026-09-08. Hero anuncia parcelamento "em até 6x sem juros" — dado passado direto pelo proprietário em 2026-09-04, ainda não passou pela validação geral de formas de pagamento abaixo | `content/hero.ts` |
| Nota Booking.com | 9,4 "Fantástico", 355 avaliações | `content/hero.ts` |
| Nota Tripadvisor | 4,8/5 | `content/depoimentos.ts` |
| Suítes | Deluxe (casal) · Deluxe Executivo (casal + solteiro) · Deluxe Executiva Conjugada (família) | `content/acomodacoes.ts` |
| Configuração comum às três suítes | Cama queen, Wi-Fi, frigobar, ar-condicionado, TV | `content/acomodacoes.ts` |
| Capacidade — Deluxe | 2 pessoas | `content/acomodacoes.ts` |
| Capacidade — Executiva | 3 pessoas | `content/acomodacoes.ts` |
| Capacidade — Conjugada | 4 pessoas | `content/acomodacoes.ts` |
| Lareira | Somente na Suíte Deluxe | `content/acomodacoes.ts` |
| Pacote Romance | **Adicional pago.** Espumante, pétalas de rosa, chocolates e música ambiente | `content/acomodacoes.ts` |

### Confirmado que NÃO existe

Registrado para nenhum agente reintroduzir por engano — tudo isto já esteve no
ar e foi retirado em 2026-09-02.

| Afirmação | Situação |
| --- | --- |
| Piso aquecido no banheiro | **Não existe em nenhuma suíte.** Estava na hero e em duas fichas |
| Hidromassagem para dois | **Não existe em nenhuma suíte.** Estava na descrição da Deluxe |
| Café da manhã na suíte | Serviço **não oferecido** no momento |
| Chef particular | Serviço **não oferecido** no momento |
| SPA privado | Serviço **não oferecido** no momento |
| Sauna privativa da Conjugada | Não existe. A sauna é uma só, na Big Bear 1 |

---

## Pendente — Políticas de Reserva

Nada disso existe no projeto hoje. Vira a página "Políticas de Reserva" do rodapé.

Até as respostas chegarem, o link "Políticas de Reserva" está **fora do rodapé**
(`components/ui/Footer.tsx`) — apontava para `#` e não levava a lugar nenhum. Ao
receber o conteúdo, crie a página e devolva o link à lista `LINKS_RAPIDOS`.

1. Valor do sinal para confirmar a reserva, e forma de pagamento (Pix, cartão, transferência):
2. Prazo de cancelamento com reembolso integral:
3. Cancelamento fora do prazo — perde o sinal, reembolso parcial ou crédito para outra data?
4. Feriados e alta temporada (julho, Réveillon, Carnaval) têm política diferente? Exigem mínimo de noites?
5. Horário de check-in (o late checkout até 14:00 já está confirmado):
6. Crianças — até que idade não paga, custo de cama extra, disponibilidade de berço:
7. Aceita pets? Com que restrição ou taxa?
8. Formas de pagamento aceitas e número de parcelas:
9. Política de no-show (não apareceu e não avisou):
10. Alteração de data — permitida? Com que antecedência e taxa?
11. O café da manhã está incluso em todas as tarifas? (confirmado por categoria de suíte; falta confirmar se alguma tarifa promocional exclui)
12. Existe taxa extra (turismo, limpeza, ISS)?

---

## Pendente — respostas que geraram nova dúvida

Vieram do gerente em 2026-09-02 e ficaram pela metade.

1. **Opção vegetariana no café da manhã.** A pergunta era "vegetariana ou sem
   glúten" e a resposta cobriu só o sem glúten. O site não afirma nada sobre
   vegetariano até isto ser respondido.
2. **A Conjugada tem ofurô?** O ofurô estava registrado junto com a "sauna
   privativa", e a sauna caiu. O ofurô segue publicado, mas não foi
   reconfirmado — confirme ou ele sai.
3. **Preço do Pacote Romance.** Confirmado que é adicional pago, mas sem valor.
   Uma faixa ("a partir de R$ X") já ajuda a decisão.
4. **Distância da Big Bear 2 até a Big Bear 1**, e horário de funcionamento da
   academia e da sauna. O site hoje diz que existem; o hóspede precisa saber que
   ficam em outra unidade e a que distância.
5. **"Kit família" e "Atividades kids"** (destaques da Suíte Executiva) não têm
   origem confirmada. São entregas reais ou texto de vitrine?
6. **"Até 20% de desconto" na promoção de primavera.** A faixa de avisos
   (`components/secoes/Destaques.tsx`) anuncia "promoções de primavera com até
   20% de desconto". Esse percentual não veio da pousada e conflita com o único
   desconto confirmado aqui — os 15% da reserva direta. Confirme o número ou
   ele sai da faixa. A hero foi escrita sem percentual justamente por isso.

---

## Pendente — prova social

Os depoimentos em `content/depoimentos.ts` não têm fonte e precisam ser
substituídos por avaliações reais. De cada uma: nome como aparece na
plataforma, plataforma, mês e ano, e o texto. Mais o link do perfil da pousada
em cada plataforma, para o card apontar para a origem.

**Não escreva depoimentos.** Sem avaliação real em mãos, a seção fica como está
ou sai do ar.

Também sem fonte: o número **"95% recomendam a pousada"**, exibido na faixa de
confiança da hero (`content/hero.ts`). Não veio de nenhuma plataforma
registrada aqui. Confirme a origem ou o número sai.

---

# Operação da Pousada Big Bear 1

Unidade da página `/big-bear-1`. **Atenção: nada aqui foi confirmado pelo
gerente.** Tudo nesta seção veio do site que já estava no ar em
`pousadabigbear.com.br` até 2026-09-18 — é copy publicada, não fato checado.
Trate como "publicado, a confirmar", não como fonte de verdade.

## Publicado (a confirmar)

| Fato | Valor no site |
| --- | --- |
| Endereço | Av. Antonio Nicola Padula, 141 — Vila Capivari, Campos do Jordão/SP |
| CNPJ | 06.538.017/0001-83 |
| Telefone / WhatsApp | (12) 9 9619-9997 |
| Distância da Praça do Capivari | 70 metros |
| Em operação desde | 2001 |
| Café da manhã | Estilo brunch, das 8h às 11h, preparado na hora por um chef, com crepes e tapiocas |
| Recepção | 24 horas |
| Estacionamento | Gratuito, com manobrista, acessível a cadeira de rodas |
| Academia e sauna | Ficam nesta unidade; atendem também os hóspedes da Big Bear 2, sem agendamento e sem custo (**este ponto é o único confirmado**, consta na seção da Big Bear 2) |
| Suítes | Luxo (varanda, cama de casal, Smart TV 50") · Master (casal + solteiro, hidromassagem cortesia) · Superior (38m², banheira de hidromassagem, mesa e sofá, ducha efeito chuva) |
| Notas | Booking 9.4 "Fantástico" 655 avaliações · TripAdvisor 4,5 "Excelente" 250 avaliações · Trivago 9.0 "Fantástico" 26 avaliações |
| Cancelamento | Até 7 dias reembolso integral · até 14 dias parcial · após 14 dias vira carta de crédito |
| Crianças | Até 6 anos não pagam (berço por taxa única) · 7 a 12 anos pagam 25% · a partir de 13 anos, 40% |
| Cartões | Aceita as bandeiras comuns (MasterCard, Elo). Não aceita American Express nem Hipercard |
| PIX | Ainda não aceito |
| Parcelamento | Até 6x sem juros |

## Conflitos a resolver com o gerente

Apareceram ao juntar os dois sites num só. Enquanto não forem resolvidos, cada
página mantém o número da sua própria unidade.

1. **Ano de fundação.** A Big Bear 1 diz "desde 2001"; a Big Bear 2, "desde
   2004". São unidades diferentes, então podem ser as duas verdadeiras — mas
   confirme antes de usar um número para a marca inteira.
2. **Estacionamento com manobrista.** A Big Bear 1 anuncia manobrista; a Big
   Bear 2 registra vaga coberta, uma por unidade, sem menção a manobrista. A
   home hoje fala só em "gratuito" para não errar por nenhum dos lados.
3. **Hidromassagem nas suítes Master e Superior.** Segue publicada na Big Bear 1.
   Na Big Bear 2 essa mesma afirmação foi retirada em 2026-09-02 por não
   existir — vale confirmar se na Big Bear 1 existe mesmo.
4. **Avaliações do Booking.** Big Bear 1 diz 655 avaliações; Big Bear 2, 355.
   Confirme se os dois números estão atualizados.
5. **Promoção sazonal.** A "Promoção de Inverno" (10% / 15% / 20% OFF) saiu do
   ar: estamos em setembro e o percentual de 20% nunca veio da pousada,
   conflitando com os 15% da reserva direta confirmados para a Big Bear 2.
   Defina a promoção vigente e os percentuais antes de republicar.
6. **Depoimentos.** Os nove depoimentos exibidos vieram do site anterior, sem
   plataforma nem data. A regra do projeto pede nome como aparece na
   plataforma, plataforma, mês/ano e link do perfil. Sem isso, eles saem.
