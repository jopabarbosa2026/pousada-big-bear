// orcamento.html é cópia exata de index.html: /orcamento é a home usada nos
// anúncios do Meta. A diferença de comportamento (botões de WhatsApp levando ao
// /quiz) fica em assets/site.js, que olha o endereço — o HTML é o mesmo.
//
// Rode depois de qualquer edição em index.html: `npm run orcamento`.
// `npm run galeria` e `npm run cards` já rodam este script no fim.
//
// (Um rewrite /orcamento -> /index.html no vercel.json dá 404 com cleanUrls,
// por isso o arquivo próprio.)
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
fs.copyFileSync(path.join(REPO, 'index.html'), path.join(REPO, 'orcamento.html'));
console.log('orcamento.html atualizado a partir de index.html');
