/* Monta o carrossel de fotos dos cards da seção "Nossas pousadas" (home).
 *
 * A primeira foto de cada card fica no HTML (é o que o visitante vê ao rolar
 * até ali, e o que aparece sem JS); as outras vão para window.PAGINA.carrosseis
 * e entram por assets/site.js quando o card aparece na tela.
 *
 * Uso:  node scripts/monta-cards.js
 * Para trocar as fotos, mude ESCOLHAS: são as posições no manifesto
 * fotos/gal/<unidade>.json — as mesmas numeradas nas folhas de contato.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const legendas = JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/legendas.json'), 'utf8'));
const manifestos = {
  bb1: JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/bb1.json'), 'utf8')),
  bb2: JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/bb2.json'), 'utf8')),
};

/* escolhidas olhando as folhas de contato: suíte, fachada, café, sala de estar */
const ESCOLHAS = {
  bb1: { unidade: 'big-bear-1', nome: 'Big Bear 1', numeros: [47, 3, 41, 77, 25, 52] },
  bb2: { unidade: 'big-bear-2', nome: 'Big Bear 2', numeros: [36, 12, 128, 62, 104, 3] },
};

function foto(un, n) {
  const f = manifestos[un][n - 1];
  if (!f) throw new Error(un + ' não tem a foto ' + n);
  return { slug: f.slug, w: f.gw, h: f.gh, alt: legendas[un][f.slug] };
}

function primeiroSlide(un, f) {
  const base = '/fotos/gal/' + un + '/' + f.slug;
  const medidas = 'sizes="(max-width:860px) 100vw, 50vw"';
  return [
    '          <div class="uc-slide active">',
    '            <picture>',
    '              <source type="image/avif" ' + medidas + ' srcset="' + base + '-480.avif 480w, ' + base + '-960.avif 960w">',
    '              <img src="' + base + '-960.webp" srcset="' + base + '-480.webp 480w, ' + base + '-960.webp 960w" ' + medidas +
      ' alt="' + f.alt + '" width="' + f.w + '" height="' + f.h + '" loading="lazy" decoding="async">',
    '            </picture>',
    '          </div>',
  ].join('\n');
}

function blocoFoto(un) {
  const cfg = ESCOLHAS[un];
  const fotos = cfg.numeros.map((n) => foto(un, n));
  return {
    fotos,
    html: [
      '        <div class="foto">',
      '          <span class="selo">' + cfg.nome + '</span>',
      '          <div class="uc-car" data-unidade="' + cfg.unidade + '">',
      primeiroSlide(un, fotos[0]),
      '          </div>',
      '          <button class="uc-nav uc-prev" type="button" aria-label="Foto anterior da ' + cfg.nome + '">‹</button>',
      '          <button class="uc-nav uc-next" type="button" aria-label="Próxima foto da ' + cfg.nome + '">›</button>',
      '          <div class="uc-dots"></div>',
      '        </div>',
    ].join('\n'),
  };
}

const caminho = path.join(REPO, 'index.html');
let t = fs.readFileSync(caminho, 'utf8');
const saida = {};

for (const un of ['bb1', 'bb2']) {
  const cfg = ESCOLHAS[un];
  const bloco = blocoFoto(un);
  saida[cfg.unidade] = bloco.fotos.map((f) => ({ slug: f.slug, alt: f.alt }));

  const iSelo = t.indexOf('<span class="selo">' + cfg.nome + '</span>');
  if (iSelo === -1) throw new Error('não achei o selo de ' + cfg.nome);
  const iAbre = t.lastIndexOf('<div class="foto">', iSelo);
  const iCorpo = t.indexOf('<div class="corpo">', iSelo);
  const iFecha = t.lastIndexOf('</div>', iCorpo);
  if (iAbre === -1 || iCorpo === -1 || iFecha === -1) throw new Error('não achei o bloco da foto de ' + cfg.nome);
  t = t.slice(0, iAbre) + bloco.html.replace(/^\s+/, '') + t.slice(iFecha + '</div>'.length);
}

/* substitui a lista em window.PAGINA.carrosseis */
const linhas = Object.entries(saida).map(([un, fotos]) =>
  '    "' + un + '": [\n' + fotos.map((f) => '      {slug:"' + f.slug + '", alt:"' + f.alt + '"}').join(',\n') + '\n    ]'
).join(',\n');
const bloco = '  carrosseis: {\n' + linhas + '\n  }';
const iCar = t.indexOf('  carrosseis: {');
if (iCar === -1) throw new Error('window.PAGINA.carrosseis não existe em index.html');
const iFimCar = t.indexOf('\n  }', t.indexOf('\n    ]', iCar)) + '\n  }'.length;
t = t.slice(0, iCar) + bloco + t.slice(iFimCar);

fs.writeFileSync(caminho, t);
fs.writeFileSync(path.join(REPO, 'fotos/gal/carrosseis.json'), JSON.stringify(saida, null, 1));
console.log('cards trocados em index.html');
