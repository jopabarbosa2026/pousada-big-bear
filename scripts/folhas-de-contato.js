/* Monta folhas de contato: mosaicos numerados das miniaturas de 480px.
 *
 * Servem para olhar as fotos em lote e escrever legenda de verdade em
 * fotos/gal/legendas.json — o número em cada quadro é a posição da foto no
 * manifesto fotos/gal/<unidade>.json, que é a ordem da galeria no site.
 *
 * Uso:  node scripts/folhas-de-contato.js bb2 [fotosPorFolha]
 * Saída: scripts/folhas/<unidade>-<primeira>.jpg  (não versionado)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const SAIDA = path.join(__dirname, 'folhas');

const unidade = process.argv[2] || 'bb1';
const POR_FOLHA = Number(process.argv[3] || 20);
const COLS = 5;
const TILE_W = 300;
const TILE_H = 225;

(async () => {
  const manifesto = JSON.parse(fs.readFileSync(path.join(REPO, 'fotos/gal', unidade + '.json'), 'utf8'));
  fs.mkdirSync(SAIDA, { recursive: true });

  for (let inicio = 0; inicio < manifesto.length; inicio += POR_FOLHA) {
    const lote = manifesto.slice(inicio, inicio + POR_FOLHA);
    const linhas = Math.ceil(lote.length / COLS);
    const folha = sharp({
      create: { width: COLS * TILE_W, height: linhas * TILE_H, channels: 3, background: '#111' },
    });

    const pecas = [];
    for (let i = 0; i < lote.length; i++) {
      const col = i % COLS, lin = Math.floor(i / COLS);
      const arquivo = path.join(REPO, 'fotos/gal', unidade, lote[i].slug + '-480.webp');
      if (!fs.existsSync(arquivo)) continue;
      pecas.push({
        input: await sharp(arquivo).resize(TILE_W, TILE_H, { fit: 'cover' }).toBuffer(),
        left: col * TILE_W, top: lin * TILE_H,
      });
      const n = inicio + i + 1;
      pecas.push({
        input: Buffer.from(
          `<svg width="${TILE_W}" height="34"><rect width="52" height="26" x="4" y="4" rx="4" fill="#000" opacity="0.75"/>` +
          `<text x="30" y="22" font-family="sans-serif" font-size="17" font-weight="bold" fill="#fff" text-anchor="middle">${n}</text></svg>`
        ),
        left: col * TILE_W, top: lin * TILE_H,
      });
    }

    const nome = path.join(SAIDA, `${unidade}-${String(inicio + 1).padStart(3, '0')}.jpg`);
    await folha.composite(pecas).jpeg({ quality: 72 }).toFile(nome);
    console.log(`${nome}  (fotos ${inicio + 1}-${inicio + lote.length})`);
  }
})();
