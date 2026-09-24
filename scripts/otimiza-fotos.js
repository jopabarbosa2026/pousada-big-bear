/* Gera as versões de web das fotos originais.
 *
 *   fotos/orig/<unidade>/**                               entram (ficam FORA do git: são GB)
 *   fotos/gal/<unidade>/<slug>-{480,960,1600}.{avif,webp}  saem (vão para o git)
 *   fotos/gal/<unidade>.json                               manifesto, na ordem do nome do arquivo
 *
 * Uso:  npm install  &&  node scripts/otimiza-fotos.js [bb1|bb2]
 * Idempotente: pula o que já existe, então rodar de novo só processa foto nova.
 * Depois: atualize fotos/gal/legendas.json e rode scripts/monta-galeria.js.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const ORIG = path.join(REPO, 'fotos/orig');
const LARGURAS = [480, 960, 1600];
const CONCORRENCIA = 4;

/* Recortes aplicados na original antes de redimensionar, em pixels da foto já
   girada. Para refazer uma foto recortada, apague as versões dela em fotos/gal. */
const RECORTES = {
  /* o fotógrafo aparece refletido no espelho, à esquerda */
  jv3a0059: { left: 1100, top: 500, width: 4900, height: 3267 },
};

const jpeg = (nome) => /\.jpe?g$/i.test(nome);

/* aceita fotos/orig/bb1/*.jpg e também um nível de subpasta — é como o Drive exporta */
function fontes(unidade) {
  const raiz = path.join(ORIG, unidade);
  if (!fs.existsSync(raiz)) return [];
  const achados = [];
  for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
    const cheio = path.join(raiz, entrada.name);
    if (entrada.isDirectory()) {
      fs.readdirSync(cheio).filter(jpeg).forEach((f) => achados.push(path.join(cheio, f)));
    } else if (jpeg(entrada.name)) {
      achados.push(cheio);
    }
  }
  return achados.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

const slugificar = (arquivo) =>
  path.basename(arquivo, path.extname(arquivo)).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function processar(origem, destino) {
  const slug = slugificar(origem);
  const recorte = RECORTES[slug];
  const meta = recorte || await sharp(origem).rotate().metadata();

  for (const largura of LARGURAS) {
    for (const [fmt, opcoes] of [['avif', { quality: 50, effort: 4 }], ['webp', { quality: 76 }]]) {
      const saida = path.join(destino, `${slug}-${largura}.${fmt}`);
      if (fs.existsSync(saida)) continue;
      const girada = sharp(origem).rotate();
      await (recorte ? girada.extract(recorte) : girada)
        .resize({ width: largura, withoutEnlargement: true })
        .toFormat(fmt, opcoes).toFile(saida);
    }
  }

  /* gw/gh são as medidas da versão de 960px: é o que vai em width/height no HTML,
     para o navegador reservar o espaço certo e a página não pular enquanto carrega. */
  const escala = Math.min(1, 960 / meta.width);
  return {
    slug,
    arquivo: path.basename(origem),
    w: meta.width,
    h: meta.height,
    gw: Math.round(meta.width * escala),
    gh: Math.round(meta.height * escala),
    md5: crypto.createHash('md5').update(fs.readFileSync(origem)).digest('hex').slice(0, 16),
  };
}

(async () => {
  const pedidas = process.argv[2] ? [process.argv[2]] : ['bb1', 'bb2'];

  for (const unidade of pedidas) {
    const arquivos = fontes(unidade);
    if (!arquivos.length) { console.log(`[${unidade}] nada em fotos/orig/${unidade}`); continue; }

    const destino = path.join(REPO, 'fotos/gal', unidade);
    fs.mkdirSync(destino, { recursive: true });
    console.log(`[${unidade}] ${arquivos.length} fotos`);

    const manifesto = [];
    let proximo = 0, prontos = 0;
    await Promise.all(Array.from({ length: CONCORRENCIA }, async () => {
      while (proximo < arquivos.length) {
        const i = proximo++;
        try {
          manifesto[i] = await processar(arquivos[i], destino);
        } catch (e) {
          console.log(`  FALHOU ${path.basename(arquivos[i])}: ${e.message}`);
          manifesto[i] = null;
        }
        if (++prontos % 20 === 0) console.log(`  [${unidade}] ${prontos}/${arquivos.length}`);
      }
    }));

    fs.writeFileSync(path.join(REPO, 'fotos/gal', `${unidade}.json`),
      JSON.stringify(manifesto.filter(Boolean), null, 1));
    console.log(`[${unidade}] pronto: ${manifesto.filter(Boolean).length} fotos`);
  }
})();
