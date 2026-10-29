# Site da Pousada Big Bear

Site estático de três páginas, publicado na Vercel em
`pousadabigbear.com.br` a cada push na `main`.

```
index.html        home da marca, apresenta as duas pousadas
big-bear-1.html   /big-bear-1 — Av. Antonio Nicola Padula, 141
big-bear-2.html   /big-bear-2 — Av. Emílio Ribas, 1074
quiz.html         /quiz — quiz de orçamento que filtra o visitante antes do WhatsApp
                  (/orcamento não tem arquivo: é a home, por rewrite no vercel.json)
assets/estilo.css CSS das três páginas
assets/site.js    carrosséis, galeria, lightbox, menu e rastreio de cliques
fotos/otim/       fotos antigas da Big Bear 1 (hero e seções), em AVIF e WebP
fotos/bb2/        fotos antigas da Big Bear 2
fotos/gal/        galeria das fotos novas: derivados, manifestos e legendas
fotos/orig/       originais da câmera — FORA do git, não versione
scripts/          preparo das fotos e geração das galerias
docs/             fatos operacionais das duas unidades
```

O `cleanUrls` do `vercel.json` é o que faz `/big-bear-1` servir
`big-bear-1.html` — não crie pastas para as rotas.

## Fatos sobre as pousadas

Antes de escrever ou alterar qualquer texto voltado ao hóspede — preço,
horário, política, comodidade, avaliação — leia `docs/operacao-pousada.md`.

Ele tem duas partes: os fatos **confirmados** da Big Bear 2 e os fatos
**publicados mas não confirmados** da Big Bear 1. A diferença importa.

Nunca invente um fato operacional nem um depoimento de hóspede. Se a
informação não estiver naquele arquivo, ela não foi confirmada: escreva o
texto sem a afirmação e avise que está pendente. O arquivo também lista os
conflitos ainda abertos entre as duas unidades.

Cada unidade é uma **pousada**, nunca uma "casa": "duas pousadas", "a
pousada", nunca "duas casas" (pedido do João, 2026-09-24).

## Fotos e galerias

As galerias e os carrosséis dos cards **não são escritos à mão**: saem de
scripts, a partir de `fotos/gal/`. Para entrar foto nova:

1. Jogue os originais em `fotos/orig/bb1/` ou `fotos/orig/bb2/`, no maior
   tamanho disponível (um nível de subpasta é aceito). Essa pasta está no
   `.gitignore` — são gigabytes, e só os derivados vão para o repo.
2. `npm install && npm run fotos` gera as versões de web em
   `fotos/gal/<unidade>/` e o manifesto `fotos/gal/<unidade>.json`.
   É idempotente: processa só o que falta.
3. `npm run folhas -- bb2` monta mosaicos numerados em `scripts/folhas/`,
   para olhar as fotos em lote e escrever o texto de cada faixa em
   `fotos/gal/legendas.json`. O número do quadro é a posição no manifesto.
4. `npm run galeria` reescreve a seção de galeria das três páginas e
   `npm run cards` refaz os carrosséis da home. Rodar de novo não duplica nada.

**A legenda vira o `alt` que o Google lê.** Descreva o que a foto mostra —
suíte, café da manhã, sala de estar, fachada — e nada além disso: dizer que a
suíte tem hidromassagem, ou qual é a categoria dela, é afirmar fato
operacional, e isso só sai de `docs/operacao-pousada.md`.

As fotos novas são quase todas verticais. Daí a galeria em colunas
(`.gal-fotos`, mosaico) em vez de grade com corte, e o card da unidade em 4/3.
A galeria começa encolhida e abre no botão "Ver todas as N fotos": todas as
fotos estão no HTML desde o início, com `loading="lazy"`, então o navegador só
baixa as que aparecem na tela.

## As duas unidades

São pousadas distintas, com **WhatsApp e conta de Google Ads separados**:

| | Big Bear 1 | Big Bear 2 |
| --- | --- | --- |
| WhatsApp | 5512996199997 | 5512996394583 |
| Google Ads | AW-609262373 | AW-17323004957 |

Por isso todo link de contato carrega `data-unidade="big-bear-1"` ou
`"big-bear-2"`, e `assets/site.js` repassa esse valor no evento do dataLayer.
É esse campo que decide para qual conta do Ads a conversão vai. **Um botão de
contato sem `data-unidade` numa página que também não declara `unidade` cai em
`"indefinida"` e a conversão se perde** — na home, onde as duas convivem, cada
botão precisa do atributo.

## Tags do Google

Container **GTM-KJ4GH8NC** nas três páginas — e **só ele**. O `gtag.js` do GA4
`G-8BCQKRYQZ3` foi retirado do código em 2026-09-23: nenhuma tag do Google sai
daqui direto, tudo é montado dentro do container. Isso vale também para o GA4,
que só volta a receber dado quando houver uma tag de configuração do GA4 no
container. As tags do Google Ads também são montadas lá, com acionador de *evento personalizado* no nome do evento
(`clique_whatsapp`, `clique_telefone`, `clique_email`, `clique_mapa`) e
condição na variável de camada de dados `unidade`.

Cada evento leva também `local` (qual botão, vem do `data-cta`) e `pagina`.

## Funil dos anúncios do Meta: `/orcamento` → `/quiz`

**O site principal não leva ao quiz.** Home, `/big-bear-1` e `/big-bear-2`
abrem o WhatsApp direto, como sempre — mexer nisso muda as conversões das
campanhas do Google Ads (pedido do João, 2026-10-29).

O funil é um endereço à parte, para os anúncios do Meta:

- **`/orcamento`** é a própria home (`index.html`) servida com outro endereço
  pelo `rewrites` do `vercel.json`, com `X-Robots-Tag: noindex` — não há
  arquivo próprio, então a cópia nunca fica desatualizada. O canonical da home
  aponta para `/`.
- `assets/site.js` liga o "funil" quando a página é `/orcamento` e guarda isso
  no `sessionStorage` (`bb-funil`): ali e nas páginas que o visitante abrir
  depois na mesma aba, todo botão de WhatsApp vira
  `/quiz?unidade=<unidade>` (os de suíte com `&suite=<slug>`) e o clique sai
  como `clique_quiz`. Botão novo de WhatsApp é pego automaticamente; botão de
  suíte novo precisa entrar em `SUITE_DO_BOTAO` (site.js) e em
  `UNIDADES[...].suites` (quiz.html).
- No dataLayer, a home aberta por `/orcamento` sai com `pagina: "orcamento"`.

## Quiz de orçamento (`/quiz`)

Página do funil, fora da busca orgânica (`noindex`). Pergunta
pousada, período (fim de semana, dias de semana, feriado), número de pessoas e
datas (ou qual feriado), mostra o valor e pergunta se ele faz sentido. Só quem diz que
sim recebe o WhatsApp em destaque, com a mensagem já preenchida com as
respostas — a IA e a equipe não precisam perguntar de novo. Quem escolheu fim
de semana e achou caro recebe a oferta de dias de semana antes de sair.

- **Valores:** bloco `QUIZ_VALORES` no fim de `quiz.html` — diária de
  semana, pacote de fim de semana por mês (`"aaaa-mm"`) e valor de cada
  feriado; as noites de cada feriado ficam em `QUIZ_FERIADOS`. Vêm do plano
  tarifário da pousada (só a coluna "Tarifa", nunca a "Mínima"). O que falta
  vira "valor sob consulta" — o quiz nunca estima. Fonte, decisões e
  pendências em `docs/operacao-pousada.md` ("Valores do quiz").
- **Datas:** calendário próprio, sempre dd/mm/aaaa. Não use
  `<input type="date">`: ele segue o idioma do aparelho e mostra mm/dd/aaaa
  em celular configurado em inglês.
- **Fatos por unidade:** objeto `UNIDADES` no mesmo script. Só entra fato
  confirmado em `docs/`.
- **Unidade e suíte:** `/quiz?unidade=big-bear-1` ou `?unidade=big-bear-2`
  pula a pergunta da pousada; `&suite=master` (só slugs da lista) põe a suíte
  na mensagem do WhatsApp.
- **dataLayer:** `quiz_resposta` (a cada resposta), `quiz_valor` (viu a
  faixa), `quiz_resultado` com `quiz_qualificado` `"sim"`/`"nao"`. O clique
  no WhatsApp sai como o `clique_whatsapp` de sempre, com `local`
  `quiz-qualificado` ou `quiz-fora-da-faixa`. Uma conversão montada para o
  funil deve contar só `quiz-qualificado` — é isso que ensina o lance
  automático a buscar gente que aceita o preço.
