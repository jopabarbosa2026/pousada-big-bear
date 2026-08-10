# Pousada Big Bear — Site

Site institucional em página única (`index.html`), sem dependências externas
além das fontes do Google Fonts. Todas as imagens (logo/favicon) estão
embutidas no próprio HTML em base64 — não há pasta de assets para gerenciar.

## Estrutura

```
.
├── index.html      # site completo (HTML + CSS + JS)
├── vercel.json      # configuração de deploy estático na Vercel
└── .gitignore
```

## Como subir no GitHub

```bash
cd pousada-big-bear
git init
git add .
git commit -m "Site Pousada Big Bear"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/pousada-big-bear.git
git push -u origin main
```

(Troque `SEU-USUARIO` pelo seu usuário/organização no GitHub. Crie o
repositório vazio no GitHub antes do `git push`, sem README/license/gitignore
inicial, para evitar conflito.)

## Como conectar na Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New → Project**.
2. Selecione o repositório `pousada-big-bear` recém-criado no GitHub.
3. Em **Framework Preset**, deixe como **Other** (site estático).
4. Não é necessário configurar Build Command nem Output Directory — a Vercel
   vai servir o `index.html` diretamente.
5. Clique em **Deploy**.

A cada `git push` na branch `main`, a Vercel publica uma nova versão
automaticamente.

## Domínio próprio

Depois do primeiro deploy, em **Project → Settings → Domains**, adicione
`pousadabigbear.com.br` (ou o domínio escolhido) e siga as instruções de DNS
mostradas pela Vercel.

## Observação sobre as fotos

As fotos de quartos, café da manhã, galeria e o carrossel do hero são
carregadas diretamente do site atual (`pousadabigbear.com.br/wp-content/uploads/...`).
Elas continuam funcionando normalmente após o deploy na Vercel, pois são
carregadas pelo navegador do visitante, não pelo servidor do site novo.
Se o domínio antigo sair do ar no futuro, essas fotos precisarão ser
baixadas e movidas para dentro deste projeto.
