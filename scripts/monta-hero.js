/* Escreve o carrossel do hero das três páginas a partir das fotos novas.
 *
 * Mexe em três pontos de cada página, que precisam apontar para a MESMA foto:
 *   1. o <link rel="preload"> do <head>  — é o LCP, sai antes de tudo
 *   2. o primeiro .slide dentro de #heroCarousel (o único que vem no HTML)
 *   3. a lista window.PAGINA.slides, de onde assets/site.js cria os demais
 *
 * Uso:  node scripts/monta-hero.js
 * Para trocar as fotos, mude ESCOLHAS: cada item é [unidade, posição no
 * manifesto fotos/gal/<unidade>.json] — a mesma numeração das folhas de contato.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const legendas = JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/legendas.json'), 'utf8'));
const manifestos = {
  bb1: JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/bb1.json'), 'utf8')),
  bb2: JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/bb2.json'), 'utf8')),
};

/* Ordem pedida pelo João: crepe doce, café da manhã, e daí revezando entre
   quarto, academia e área comum. A academia fica na Big Bear 1, então só
   entra no hero dela e no da home. */
const ESCOLHAS = {
  'index.html': [['bb2', 205], ['bb2', 186], ['bb1', 47], ['bb1', 25], ['bb2', 62], ['bb2', 104]],
  'big-bear-1.html': [['bb1', 41], ['bb1', 47], ['bb1', 25], ['bb1', 77], ['bb1', 52]],
  'big-bear-2.html': [['bb2', 205], ['bb2', 186], ['bb2', 104], ['bb2', 62], ['bb2', 81]],
};

function foto(un, n) {
  const f = manifestos[un][n - 1];
  if (!f) throw new Error(un + ' não tem a foto ' + n);
  return {
    base: '/fotos/gal/' + un + '/' + f.slug,
    alt: (legendas[un][f.slug] || '').replace(/"/g, '&quot;'),
    w: f.gw,
    h: f.gh,
  };
}

function medidas(base, ext) {
  return [480, 960, 1600].map((w) => base + '-' + w + '.' + ext + ' ' + w + 'w').join(', ');
}

/* Fim da <div> que começa em "inicio", contando abertura e fechamento. Procurar
   direto por </div> ou </picture> não serve: o primeiro slide de uma página pode
   ser um <img> solto, e aí a busca passa reto e engole o resto do arquivo. */
function fimDaDiv(texto, inicio) {
  const marca = /<div\b|<\/div>/g;
  marca.lastIndex = inicio;
  let nivel = 0, achado;
  while ((achado = marca.exec(texto))) {
    nivel += achado[0] === '</div>' ? -1 : 1;
    if (nivel === 0) return achado.index + achado[0].length;
  }
  throw new Error('não achei o fechamento da div em ' + inicio);
}

for (const [arquivo, picks] of Object.entries(ESCOLHAS)) {
  const caminho = path.join(REPO, arquivo);
  let t = fs.readFileSync(caminho, 'utf8');
  const fotos = picks.map(([un, n]) => foto(un, n));
  const primeira = fotos[0];

  /* 1. preload do LCP */
  const preload = '<link rel="preload" as="image" type="image/avif" imagesrcset="' +
    medidas(primeira.base, 'avif') + '" imagesizes="100vw">';
  const iPre = t.indexOf('<link rel="preload"');
  if (iPre === -1) throw new Error('não achei o preload em ' + arquivo);
  t = t.slice(0, iPre) + preload + t.slice(t.indexOf('>', iPre) + 1);

  /* 2. primeiro slide, dentro do #heroCarousel */
  const slide = [
    '    <div class="slide active">',
    '      <picture>',
    '        <source type="image/avif" sizes="100vw" srcset="' + medidas(primeira.base, 'avif') + '">',
    '        <img src="' + primeira.base + '-960.webp" srcset="' + medidas(primeira.base, 'webp') + '" sizes="100vw"' +
      ' alt="' + primeira.alt + '" width="' + primeira.w + '" height="' + primeira.h + '" fetchpriority="high" decoding="async">',
    '      </picture>',
    '    </div>',
  ].join('\n');
  const iCar = t.indexOf('<div class="hero-bg" id="heroCarousel">');
  if (iCar === -1) throw new Error('não achei o hero de ' + arquivo);
  const iSlide = t.indexOf('<div class="slide', iCar);
  if (iSlide === -1) throw new Error('não achei o primeiro slide de ' + arquivo);
  t = t.slice(0, iSlide) + slide.replace(/^\s+/, '') + t.slice(fimDaDiv(t, iSlide));

  /* 3. lista de slides do window.PAGINA */
  const lista = '  slides: [\n' + fotos.map((f) =>
    '    {base:"' + f.base + '", w:' + f.w + ', h:' + f.h + ', alt:"' + f.alt + '"}'
  ).join(',\n') + '\n  ]';
  const iLista = t.indexOf('  slides: [');
  if (iLista === -1) throw new Error('não achei window.PAGINA.slides em ' + arquivo);
  const iFimLista = t.indexOf('\n  ]', iLista) + '\n  ]'.length;
  t = t.slice(0, iLista) + lista + t.slice(iFimLista);

  fs.writeFileSync(caminho, t);
  console.log('hero trocado em ' + arquivo + ' (' + fotos.length + ' fotos, começando em ' + primeira.base + ')');
}
