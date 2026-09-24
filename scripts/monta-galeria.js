/* Escreve as galerias nas três páginas a partir de fotos/gal/*.json.
 *
 *   /big-bear-1  e  /big-bear-2   -> todas as fotos da própria unidade
 *   /            (home)           -> as duas, em blocos separados e com filtro
 *
 * Uso:  node scripts/monta-galeria.js [bb1|bb2|home]   (sem argumento: as três)
 * Substitui a seção inteira entre "<!-- ===== GALERIA ===== -->" e o </section>
 * seguinte, então é seguro rodar de novo quando entrar foto nova.
 *
 * O texto de cada foto vem de fotos/gal/legendas.json. Foto sem legenda entra
 * com um texto genérico — não invente comodidade nem categoria de suíte aqui:
 * o que pode ser afirmado ao hóspede está em docs/operacao-pousada.md.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const UNIDADES = {
  bb1: { nome: 'Big Bear 1', unidade: 'big-bear-1', pagina: 'big-bear-1.html', grade: 'galBB1' },
  bb2: { nome: 'Big Bear 2', unidade: 'big-bear-2', pagina: 'big-bear-2.html', grade: 'galBB2' },
};
const TAMANHOS = 'sizes="(max-width:640px) 50vw, (max-width:980px) 33vw, 25vw"';

const legendas = JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal/legendas.json'), 'utf8'));
const manifesto = (un) => JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal', un + '.json'), 'utf8'));

function legenda(un, slug, nome) {
  const l = legendas[un] && legendas[un][slug];
  return (l || 'Pousada ' + nome + ' em Campos do Jordão').replace(/"/g, '&quot;');
}

function item(un, foto, nome) {
  const base = '/fotos/gal/' + un + '/' + foto.slug;
  const alt = legenda(un, foto.slug, nome);
  return [
    '        <button class="gi" type="button" data-base="' + base + '" data-alt="' + alt + '" aria-label="Ampliar foto: ' + alt + '">',
    '          <picture>',
    '            <source type="image/avif" ' + TAMANHOS + ' srcset="' + base + '-480.avif 480w, ' + base + '-960.avif 960w">',
    '            <img src="' + base + '-480.webp" srcset="' + base + '-480.webp 480w, ' + base + '-960.webp 960w" ' + TAMANHOS +
      ' width="' + foto.gw + '" height="' + foto.gh + '" alt="' + alt + '" loading="lazy" decoding="async">',
    '          </picture>',
    '        </button>',
  ].join('\n');
}

/* A grade abre encolhida (16 fotos no desktop, 8 no celular — assets/estilo.css),
   e na ordem do manifesto as primeiras eram só fachada, academia e suíte. Então
   as primeiras 16 revezam um ambiente de cada vez, nesta ordem de prioridade;
   o resto segue na ordem do manifesto. Ambiente fora da lista entra depois. */
const ABERTURA = 16;
const PRIORIDADE = ['Suíte', 'Café', 'Recepção', 'Sala', 'Salão', 'Fachada', 'Academia', 'Entrada', 'Banheiro'];

function ordemDeExibicao(un, fotos) {
  const rank = (chave) => { const i = PRIORIDADE.indexOf(chave); return i === -1 ? PRIORIDADE.length : i; };
  const grupos = new Map();
  for (const f of fotos) {
    const l = (legendas[un] && legendas[un][f.slug]) || '';
    const chave = PRIORIDADE.find((p) => l.startsWith(p)) || l;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(f);
  }
  const filas = [...grupos.entries()].sort(([a], [b]) => rank(a) - rank(b)).map(([, lista]) => lista);

  const abertura = [];
  for (let volta = 0; abertura.length < ABERTURA && filas.some((q) => q.length > volta); volta++) {
    for (const q of filas) if (q[volta] && abertura.length < ABERTURA) abertura.push(q[volta]);
  }
  return abertura.concat(fotos.filter((f) => !abertura.includes(f)));
}

function grade(un, id) {
  const cfg = UNIDADES[un];
  const fotos = ordemDeExibicao(un, manifesto(un));
  return {
    total: fotos.length,
    html: [
      '      <div class="gal-fotos encolhida" id="' + id + '">',
      fotos.map((f) => item(un, f, cfg.nome)).join('\n'),
      '      </div>',
      '      <button class="btn btn-ghost gal-mais" type="button" data-grade="' + id + '">Ver todas as ' + fotos.length + ' fotos</button>',
    ].join('\n'),
  };
}

function galeriaUnidade(un) {
  const cfg = UNIDADES[un];
  const g = grade(un, cfg.grade);
  return [
    '<!-- ===== GALERIA ===== -->',
    '<section class="gallery sec-pad" id="galeria">',
    '  <div class="wrap">',
    '    <div class="sec-head reveal">',
    '      <span class="eyebrow">Galeria</span>',
    '      <h2>Todas as fotos da <em>' + cfg.nome + '</em></h2>',
    '      <p>' + g.total + ' fotos da pousada. Clique em qualquer uma para ver em tela cheia.</p>',
    '    </div>',
    '    <div class="reveal">',
    g.html,
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');
}

function galeriaHome() {
  const g1 = grade('bb1', 'galHomeBB1');
  const g2 = grade('bb2', 'galHomeBB2');
  const bloco = (un, g) => [
    '      <div class="gal-bloco" data-unidade="' + UNIDADES[un].unidade + '">',
    '        <h3 class="gal-sub">Pousada ' + UNIDADES[un].nome + ' <span>' + g.total + ' fotos</span></h3>',
    g.html.split('\n').map((l) => (l ? '  ' + l : l)).join('\n'),
    '      </div>',
  ].join('\n');

  return [
    '<!-- ===== GALERIA ===== -->',
    '<section class="gallery sec-pad" id="galeria">',
    '  <div class="wrap">',
    '    <div class="sec-head reveal">',
    '      <span class="eyebrow">Galeria</span>',
    '      <h2>As duas pousadas, <em>foto por foto</em></h2>',
    '      <p>' + (g1.total + g2.total) + ' fotos ao todo, separadas por unidade. Clique em qualquer uma para ver em tela cheia.</p>',
    '    </div>',
    '    <div class="gal-filtros reveal">',
    '      <button type="button" class="ativo" data-filtro="todas">Todas</button>',
    '      <button type="button" data-filtro="big-bear-1">Big Bear 1</button>',
    '      <button type="button" data-filtro="big-bear-2">Big Bear 2</button>',
    '    </div>',
    '    <div class="reveal">',
    bloco('bb1', g1),
    bloco('bb2', g2),
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');
}

function trocarSecao(arquivo, novo) {
  const caminho = path.join(REPO, arquivo);
  let t = fs.readFileSync(caminho, 'utf8');
  const inicio = t.indexOf('<!-- ===== GALERIA ===== -->');
  const fim = inicio === -1 ? -1 : t.indexOf('</section>', inicio);
  if (fim === -1) { console.log('NAO ACHEI a seção de galeria em ' + arquivo); return; }
  fs.writeFileSync(caminho, t.slice(0, inicio) + novo + t.slice(fim + '</section>'.length));
  console.log('galeria trocada em ' + arquivo);
}

const alvo = process.argv[2] || 'tudo';
if (alvo === 'tudo' || alvo === 'bb1') trocarSecao('big-bear-1.html', galeriaUnidade('bb1'));
if (alvo === 'tudo' || alvo === 'bb2') trocarSecao('big-bear-2.html', galeriaUnidade('bb2'));
if (alvo === 'tudo' || alvo === 'home') trocarSecao('index.html', galeriaHome());
