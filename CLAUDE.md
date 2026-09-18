# Site da Pousada Big Bear

Site estático de três páginas, publicado na Vercel em
`pousadabigbear.com.br` a cada push na `main`.

```
index.html        home da marca, apresenta as duas pousadas
big-bear-1.html   /big-bear-1 — Av. Antonio Nicola Padula, 141
big-bear-2.html   /big-bear-2 — Av. Emílio Ribas, 1074
assets/estilo.css CSS das três páginas
assets/site.js    carrossel, menu, reveal e rastreio de cliques
fotos/otim/       fotos da Big Bear 1 em AVIF e WebP
fotos/bb2/        fotos da Big Bear 2
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

Container **GTM-KJ4GH8NC** nas três páginas, mais o GA4 `G-8BCQKRYQZ3` via
`gtag.js`. As tags do Google Ads não ficam no código: são montadas dentro do
container, com acionador de *evento personalizado* no nome do evento
(`clique_whatsapp`, `clique_telefone`, `clique_email`, `clique_mapa`) e
condição na variável de camada de dados `unidade`.

Cada evento leva também `local` (qual botão, vem do `data-cta`) e `pagina`.
