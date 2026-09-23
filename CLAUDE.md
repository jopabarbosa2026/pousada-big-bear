# Site da Pousada Big Bear

Site estático de três páginas, publicado na Vercel em
`pousadabigbear.com.br` a cada push na `main`.

```
index.html        home da marca, apresenta as duas pousadas
big-bear-1.html   /big-bear-1 — Av. Antonio Nicola Padula, 141
big-bear-2.html   /big-bear-2 — Av. Emílio Ribas, 1074
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
