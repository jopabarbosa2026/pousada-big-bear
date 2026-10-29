// Gera as páginas de campanha do Google Ads a partir da home (index.html):
//   romantico.html       /romantico       viagem a dois
//   meio-de-semana.html  /meio-de-semana  R$ 350 de domingo a quinta
//
// Elas SÃO a home — mesmo topo, menu, cartões, galeria, depoimentos e rodapé —
// com poucos detalhes trocados: título, texto e fotos do topo, uma seção de
// oferta logo depois do topo, a chamada final e a mensagem pré-preenchida dos
// botões de WhatsApp. Botões continuam indo direto ao WhatsApp de cada pousada.
//
// Não edite romantico.html nem meio-de-semana.html à mão: mude index.html ou
// este script e rode `npm run campanhas` (`galeria` e `cards` já rodam).
// Cada troca precisa encontrar o trecho exato da home; se a home mudar e um
// trecho sumir, o script para com erro em vez de gerar página quebrada.
//
// Fatos: só os de docs/operacao-pousada.md. Hidromassagem da Suíte Master da
// Big Bear 1 confirmada pelo João em 2026-10-29. R$ 350 também está em
// QUIZ_VALORES (quiz.html) — se mudar, mude nos dois.
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const URL_BASE = 'https://www.pousadabigbear.com.br';
const WA = { 'big-bear-1': '5512996199997', 'big-bear-2': '5512996394583' };

function trocar(html, de, para, nome) {
  const achou = typeof de === 'string' ? html.includes(de) : de.test(html);
  if (!achou) throw new Error('monta-campanhas: trecho da home não encontrado: ' + nome);
  if (typeof de === 'string') return html.split(de).join(para);
  de.lastIndex = 0;
  return html.replace(de, para);
}

const foto = (u, slug, w, h, alt) => ({ base: '/fotos/gal/' + u + '/' + slug, w, h, alt });
const srcset = (base, ext) => [480, 960, 1600].map(n => base + '-' + n + '.' + ext + ' ' + n + 'w').join(', ');
const texto = s => encodeURIComponent(s);

function botaoWa(u, msg, cta, rotulo) {
  return '<a href="https://api.whatsapp.com/send?phone=' + WA[u] + '&amp;text=' + texto(msg) +
    '" target="_blank" rel="noopener" class="btn btn-wa" data-cta="' + cta + '" data-unidade="' + u + '">' + rotulo + '</a>';
}

function cartao(icone, titulo, descricao) {
  return '      <div class="amc">\n        <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
    icone + '</svg></div>\n        <h3>' + titulo + '</h3>\n        <p>' + descricao + '</p>\n      </div>';
}

const ICONE = {
  coracao: '<path d="M20.8 8.6a4.5 4.5 0 0 0-7.6-2.4L12 7.4l-1.2-1.2a4.5 4.5 0 1 0-6.4 6.4l7.6 7.6 7.6-7.6a4.5 4.5 0 0 0 1.2-4z"/>',
  banheira: '<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><path d="M7 19l-1 2M17 19l1 2"/>',
  fogo: '<path d="M12 22c4 0 7-2.7 7-6.5 0-3.5-2.5-5.5-4-8-1 2-2 3-3.5 3.5C12 8 11 5 8.5 3 8.5 7 5 9.5 5 15.5 5 19.3 8 22 12 22z"/>',
  cafe: '<path d="M4 9h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M7 3v3M11 3v3"/>',
  calma: '<path d="M3 18h18M5 18V9l7-5 7 5v9"/><path d="M10 18v-5h4v5"/>',
  etiqueta: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  academia: '<path d="M3 12h2M19 12h2M6 9v6M18 9v6M9 7v10M15 7v10"/>'
};

function blocoPreco(rotulo, texto, botoes) {
  return '<section class="sec-pad lp-oferta-preco">\n  <div class="wrap">\n    <div class="lp-preco reveal">\n      <div>\n' +
    '        <p class="lp-rot">' + rotulo + '</p>\n' +
    '        <p class="lp-num">R$ 350 <small>por noite</small></p>\n' +
    '        <p>' + texto + '</p>\n' +
    '        <p class="lp-nota">Para 1 ou 2 pessoas; com 3 ou mais, a equipe passa o valor. Noites de sexta e sábado e feriados têm valor próprio.</p>\n' +
    '      </div>\n      <div>\n        <div class="lp-noites">\n' +
    '          <div><span>2 noites</span><b>R$ 700</b></div>\n' +
    '          <div><span>3 noites</span><b>R$ 1.050</b></div>\n' +
    '          <div><span>4 noites</span><b>R$ 1.400</b></div>\n' +
    '          <div><span>5 noites, domingo a sexta</span><b>R$ 1.750</b></div>\n' +
    '        </div>\n        <div class="lp-acoes">\n          ' + botoes.join('\n          ') + '\n        </div>\n      </div>\n    </div>\n  </div>\n</section>\n';
}

function fotos(lista) {
  return '    <div class="lp-fotos reveal">\n' + lista.map(f =>
    '      <figure><picture><source type="image/avif" sizes="(max-width:760px) 100vw, 33vw" srcset="' + srcset(f.base, 'avif').replace(/, [^,]*1600w/, '') +
    '"><img src="' + f.base + '-960.webp" srcset="' + srcset(f.base, 'webp').replace(/, [^,]*1600w/, '') +
    '" sizes="(max-width:760px) 100vw, 33vw" alt="' + f.alt + '" width="' + f.w + '" height="' + f.h + '" loading="lazy" decoding="async"></picture>' +
    '<figcaption>' + f.legenda + '</figcaption></figure>').join('\n') + '\n    </div>\n';
}

const MSG_SEMANA = u => 'Olá! Vi no site a diária de R$ 350 de domingo a quinta e quero reservar na ' + (u === 'big-bear-1' ? 'Big Bear 1' : 'Big Bear 2') + '.';
const MSG_ROMANTICO = u => 'Olá! Vi no site a página de viagem a dois e quero reservar na ' + (u === 'big-bear-1' ? 'Big Bear 1' : 'Big Bear 2') + '.';

const PAGINAS = [
  {
    arquivo: 'romantico.html', id: 'romantico',
    titulo: 'Pousada romântica em Campos do Jordão — Big Bear, na Vila Capivari',
    descricao: 'Viagem a dois em Campos do Jordão: suíte com hidromassagem, suíte com lareira e Pacote Romance nas pousadas Big Bear, na Vila Capivari. De domingo a quinta, R$ 350 a diária para o casal.',
    mensagem: MSG_ROMANTICO,
    eyebrow: 'Viagem a dois · Campos do Jordão',
    h1: 'Um refúgio a dois na Vila <em>Capivari</em>.',
    lead: 'Suíte com hidromassagem, suíte com lareira e o Pacote Romance, a poucos passos das principais atrações de Campos do Jordão.',
    acao: 'Para a noite especial',
    seloN: '2<small> pousadas</small>',
    seloLbl: 'para viajar a dois na Vila Capivari. Hidromassagem na Big Bear 1; lareira e Pacote Romance na Big Bear 2.',
    seloMini: ['<div><b>R$ 350</b><span>diária de domingo a quinta</span></div>', '<div><b>8h–11h</b><span>café da manhã brunch</span></div>'],
    slides: [
      foto('bb2', 'img-4684', 960, 1280, 'Cama de suíte da Pousada Big Bear 2 decorada com pétalas de rosa'),
      foto('bb2', 'jv3a9358', 960, 1440, 'Suíte da Pousada Big Bear 2 decorada com pétalas de rosa'),
      foto('bb1', 'jv3a0191', 960, 1440, 'Banheira de hidromassagem da Pousada Big Bear 1'),
      foto('bb1', 'grdr-2026-09-03-204135c5c5910925fd', 960, 1440, 'Vila Capivari iluminada, a poucos metros da pousada'),
      foto('bb2', 'img-4711', 960, 1280, 'Cama de suíte da Pousada Big Bear 2 decorada com pétalas de rosa')
    ],
    finalH2: 'A noite especial <em>te espera</em>.',
    oferta: () =>
      '<!-- ===== VIAGEM A DOIS (só nesta página) ===== -->\n<section class="amen sec-pad" id="oferta">\n  <div class="wrap">\n' +
      '    <div class="sec-head reveal">\n      <span class="eyebrow">Viagem a dois</span>\n      <h2>Para a <em>noite especial</em></h2>\n' +
      '      <p>O que cada pousada prepara para o casal.</p>\n    </div>\n    <div class="amen-grid reveal">\n' +
      [cartao(ICONE.coracao, 'Pacote Romance', 'Na Big Bear 2: pétalas de rosa, espumante, chocolates e música ambiente. É um adicional à diária — peça o valor no WhatsApp.'),
       cartao(ICONE.banheira, 'Suíte Master com hidromassagem', 'Na Big Bear 1: banheira de hidromassagem na suíte, para relaxar a dois depois do passeio.'),
       cartao(ICONE.fogo, 'Suíte Deluxe com lareira', 'Na Big Bear 2: lareira na suíte para as noites frias da serra.'),
       cartao(ICONE.cafe, 'Café da manhã até as 11h', 'Estilo brunch, servido das 8h às 11h, para acordar sem pressa. Incluso na diária.')].join('\n') +
      '\n    </div>\n' +
      fotos([
        Object.assign(foto('bb2', 'img-4684', 960, 1280, 'Cama de suíte da Pousada Big Bear 2 decorada com pétalas de rosa'), { legenda: 'Suíte da Big Bear 2 decorada com pétalas de rosa' }),
        Object.assign(foto('bb1', 'jv3a0191', 960, 1440, 'Banheira de hidromassagem da Pousada Big Bear 1'), { legenda: 'Banheira de hidromassagem da Big Bear 1' }),
        Object.assign(foto('bb2', 'jv3a9358', 960, 1440, 'Suíte da Pousada Big Bear 2 decorada com pétalas de rosa'), { legenda: 'Suíte da Big Bear 2 decorada com pétalas de rosa' })
      ]) +
      '    <div class="lp-acoes centro reveal">\n      ' +
      botaoWa('big-bear-2', 'Olá! Vi no site o Pacote Romance e quero saber o valor na Big Bear 2.', 'romantico-pacote', 'Quero o Pacote Romance · Big Bear 2') + '\n      ' +
      botaoWa('big-bear-1', 'Olá! Vi no site e quero reservar a Suíte Master com hidromassagem na Big Bear 1.', 'romantico-hidromassagem', 'Quero a Suíte Master · Big Bear 1') +
      '\n    </div>\n  </div>\n</section>\n\n' +
      blocoPreco('Romance de domingo a quinta',
        'Diária para o casal, nas duas pousadas, nas noites de domingo a quinta. Fora do fim de semana, Campos do Jordão fica mais tranquila: passeio no seu ritmo e menos espera nos restaurantes.',
        [botaoWa('big-bear-1', MSG_SEMANA('big-bear-1'), 'romantico-semana', 'Big Bear 1'), botaoWa('big-bear-2', MSG_SEMANA('big-bear-2'), 'romantico-semana', 'Big Bear 2')]) + '\n'
  },
  {
    arquivo: 'meio-de-semana.html', id: 'meio-de-semana',
    titulo: 'R$ 350 a diária de domingo a quinta em Campos do Jordão — Pousada Big Bear',
    descricao: 'Diária de R$ 350 para o casal, de domingo a quinta, nas pousadas Big Bear, na Vila Capivari, a poucos passos das principais atrações de Campos do Jordão.',
    mensagem: MSG_SEMANA,
    eyebrow: 'Domingo a quinta · Campos do Jordão',
    h1: 'Campos do Jordão de domingo a quinta por <em>R$ 350</em>.',
    lead: 'Diária fixa para o casal nas duas pousadas, na Vila Capivari, a poucos passos das principais atrações.',
    acao: 'Ver os valores',
    seloN: 'R$ 350<small> /noite</small>',
    seloLbl: 'para o casal, de domingo a quinta, nas duas pousadas. Feriados têm valor próprio.',
    seloMini: ['<div><b>R$ 700</b><span>2 noites</span></div>', '<div><b>R$ 1.750</b><span>5 noites, domingo a sexta</span></div>'],
    slides: null, // mantém as fotos do topo da home
    finalH2: 'Domingo a quinta <em>te espera</em>.',
    oferta: () =>
      '<!-- ===== DOMINGO A QUINTA (só nesta página) ===== -->\n<div id="oferta"></div>\n' +
      blocoPreco('Noites de domingo a quinta',
        'O mesmo valor nas duas pousadas, para o casal. Chegando no domingo e saindo na sexta, são 5 noites.',
        [botaoWa('big-bear-1', MSG_SEMANA('big-bear-1'), 'semana-preco', 'Reservar na Big Bear 1'), botaoWa('big-bear-2', MSG_SEMANA('big-bear-2'), 'semana-preco', 'Reservar na Big Bear 2')]) +
      '\n<section class="amen sec-pad">\n  <div class="wrap">\n    <div class="sec-head reveal">\n      <span class="eyebrow">Por que vir durante a semana</span>\n' +
      '      <h2>A mesma serra, com mais <em>espaço para você</em></h2>\n    </div>\n    <div class="amen-grid reveal">\n' +
      [cartao(ICONE.calma, 'Cidade mais tranquila', 'Fora do fim de semana, a Vila Capivari tem menos movimento: passeio no seu ritmo e menos espera nos restaurantes.'),
       cartao(ICONE.etiqueta, 'Valor fixo', 'R$ 350 por noite para o casal, nas duas pousadas, todas as noites de domingo a quinta.'),
       cartao(ICONE.relogio, 'Saída sem pressa', 'Na Big Bear 2, late checkout até as 14h, sem custo, reservando direto.'),
       cartao(ICONE.academia, 'Academia e sauna', 'Ficam na Big Bear 1 e são de uso comum: hóspedes da Big Bear 2 usam sem agendamento e sem custo.')].join('\n') +
      '\n    </div>\n  </div>\n</section>\n\n'
  }
];

const original = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const crlf = original.includes('\r\n');
const home = original.replace(/\r\n/g, '\n');

for (const p of PAGINAS) {
  let h = home;
  h = trocar(h, '<head>\n', '<head>\n<!-- GERADO por scripts/monta-campanhas.js a partir de index.html — não edite à mão.\n     Mude index.html ou o script e rode `npm run campanhas`. -->\n', 'head');
  h = trocar(h, /\s*\/\* orcamento\.html é CÓPIA EXATA[\s\S]*?\*\/\n\s*dataLayer\.push\(\{site: 'big-bear', pagina: [^\n]*\}\);/, "\n  dataLayer.push({site: 'big-bear', pagina: '" + p.id + "'});", 'dataLayer da home');
  h = trocar(h, /<title>[^<]*<\/title>/, '<title>' + p.titulo + '</title>', 'title');
  h = trocar(h, /<meta name="description" content="[^"]*">/, '<meta name="description" content="' + p.descricao + '">\n<!-- Página de campanha: fora da busca orgânica para não disputar com a home. -->\n<meta name="robots" content="noindex, follow">', 'description');
  h = trocar(h, /<link rel="canonical" href="[^"]*">\n/, '', 'canonical');
  h = trocar(h, /<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + p.titulo + '">', 'og:title');
  h = trocar(h, /<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + p.descricao + '">', 'og:description');
  h = trocar(h, /<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + URL_BASE + '/' + p.id + '">', 'og:url');
  h = trocar(h, '<link rel="stylesheet" href="/assets/estilo.css">', '<link rel="stylesheet" href="/assets/estilo.css">\n<link rel="stylesheet" href="/assets/lp.css">', 'css');

  if (p.slides) {
    const s = p.slides[0];
    h = trocar(h, /<link rel="preload" as="image"[^>]*>/, '<link rel="preload" as="image" type="image/avif" imagesrcset="' + srcset(s.base, 'avif') + '" imagesizes="100vw">', 'preload');
    h = trocar(h, /(<div class="slide active">\s*<picture>)[\s\S]*?(<\/picture>)/,
      '$1\n        <source type="image/avif" sizes="100vw" srcset="' + srcset(s.base, 'avif') + '">\n        <img src="' + s.base + '-960.webp" srcset="' + srcset(s.base, 'webp') +
      '" sizes="100vw" alt="' + s.alt + '" width="' + s.w + '" height="' + s.h + '" fetchpriority="high" decoding="async">\n      $2', 'primeiro slide');
    h = trocar(h, /slides: \[[\s\S]*?\n  \],/, 'slides: [\n' + p.slides.map(f => '    {base:"' + f.base + '", w:' + f.w + ', h:' + f.h + ', alt:"' + f.alt + '"}').join(',\n') + '\n  ],', 'slides');
  }

  h = trocar(h, '<span class="eyebrow">Campos do Jordão · SP</span>', '<span class="eyebrow">' + p.eyebrow + '</span>', 'eyebrow do topo');
  h = trocar(h, /<h1>[\s\S]*?<\/h1>/, '<h1>' + p.h1 + '</h1>', 'h1');
  h = trocar(h, /<p class="lead">[\s\S]*?<\/p>/, '<p class="lead">' + p.lead + '</p>', 'lead');
  h = trocar(h, '<a href="#unidades" class="btn btn-primary" data-cta="hero-ver-unidades">Ver as duas pousadas</a>', '<a href="#oferta" class="btn btn-primary" data-cta="hero-oferta">' + p.acao + '</a>', 'botão do topo');
  h = trocar(h, '<div class="n">2<small> pousadas</small></div>', '<div class="n">' + p.seloN + '</div>', 'selo n');
  h = trocar(h, /<div class="lbl">[\s\S]*?<\/div>/, '<div class="lbl">' + p.seloLbl + '</div>', 'selo lbl');
  h = trocar(h, '<div><b>8h–11h</b><span>café da manhã brunch</span></div>\n          <div><b>24h</b><span>recepção sempre aberta</span></div>', p.seloMini.join('\n          '), 'selo mini');

  /* mensagem pré-preenchida de todos os botões de WhatsApp da home — antes de
     inserir a oferta, que já vem com as mensagens dela */
  for (const u of Object.keys(WA)) {
    h = trocar(h, new RegExp('(api\\.whatsapp\\.com/send\\?phone=' + WA[u] + '&amp;text=)[^"]*', 'g'), '$1' + texto(p.mensagem(u)), 'WhatsApp da ' + u);
  }
  h = trocar(h, '<!-- ===== SOBRE ===== -->', p.oferta() + '<!-- ===== SOBRE ===== -->', 'seção de oferta');
  h = trocar(h, '<h2>A serra <em>te espera</em>.</h2>', '<h2>' + p.finalH2 + '</h2>', 'chamada final');
  h = trocar(h, 'id: "home",', 'id: "' + p.id + '",', 'PAGINA.id');

  fs.writeFileSync(path.join(REPO, p.arquivo), crlf ? h.replace(/\n/g, '\r\n') : h);
  console.log(p.arquivo + ' gerado a partir de index.html');
}
