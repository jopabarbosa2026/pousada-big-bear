/* =============================================================================
   Big Bear — comportamento compartilhado pelas três páginas
   (home, /big-bear-1 e /big-bear-2).

   Cada página declara o que tem de próprio em window.PAGINA antes de carregar
   este arquivo:
     id       "home" | "big-bear-1" | "big-bear-2"
     unidade  "big-bear-1" | "big-bear-2" | null (home, fala pelas duas)
     slides   fotos do carrossel do hero (opcional)
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.PAGINA || {};
  var UNIDADE = CFG.unidade || null;

  /* ===== RASTREIO DE CLIQUES (dataLayer -> Google Tag Manager) ==============
     As duas pousadas têm WhatsApp e conta de Google Ads separados, e agora
     dividem o mesmo site. Por isso cada evento carrega "unidade": é o que
     permite, no container GTM-KJ4GH8NC, mandar a conversão para a conta certa.
     Um botão pode sobrescrever a unidade da página com data-unidade — é o caso
     da home, que oferece as duas pousadas lado a lado. */
  function identificarEvento(href) {
    if (/^https:\/\/(wa\.me|wa\.link|api\.whatsapp\.com)\//.test(href)) return "clique_whatsapp";
    if (href.indexOf("tel:") === 0) return "clique_telefone";
    if (href.indexOf("mailto:") === 0) return "clique_email";
    if (href.indexOf("google.com/maps") !== -1) return "clique_mapa";
    return null;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link) return;

    var nome = identificarEvento(link.href);
    if (!nome) return;

    var dados = {
      event: nome,
      local: link.dataset.cta || "geral",
      unidade: link.dataset.unidade || UNIDADE || "indefinida",
      pagina: CFG.id || "desconhecida",
      site: "big-bear"
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(dados);

    if (location.hostname === "localhost") console.info("[analytics]", nome, dados);
  }, true);

  /* ===== HEADER ============================================================ */
  var header = document.getElementById("header");
  if (header) {
    var frame = 0, rolado = null;
    var medir = function () {
      frame = 0;
      var agora = window.scrollY > 20;
      if (agora === rolado) return;
      rolado = agora;
      header.style.boxShadow = agora ? "0 6px 24px -12px rgba(0,0,0,.25)" : "none";
    };
    medir();
    window.addEventListener("scroll", function () {
      if (!frame) frame = requestAnimationFrame(medir);
    }, { passive: true });
  }

  /* ===== MENU MOBILE ======================================================= */
  var burger = document.getElementById("burger"),
      mobileNav = document.getElementById("mobileNav"),
      closeNav = document.getElementById("closeNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () { mobileNav.classList.add("open"); });
    if (closeNav) closeNav.addEventListener("click", function () { mobileNav.classList.remove("open"); });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileNav.classList.remove("open"); });
    });
  }

  /* ===== BOTÃO FLUTUANTE DE WHATSAPP =======================================
     Na home ele abre as duas opções, porque dali não dá para saber de qual
     pousada o visitante fala. Nas páginas internas já vai direto. */
  var gatilho = document.querySelector(".wa-float .gatilho");
  var opcoes = document.querySelector(".wa-float .opcoes");
  if (gatilho && opcoes) {
    gatilho.addEventListener("click", function () {
      var fechado = opcoes.hidden;
      opcoes.hidden = !fechado;
      gatilho.setAttribute("aria-expanded", String(fechado));
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".wa-float")) {
        opcoes.hidden = true;
        gatilho.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ===== REVEAL ============================================================
     Sem IntersectionObserver a animação não acontece, mas o conteúdo precisa
     aparecer mesmo assim — e uma exceção aqui mataria o carrossel e os
     depoimentos, que vêm depois. */
  var alvos = document.querySelectorAll(".reveal");
  if (alvos.length) {
    if (typeof IntersectionObserver === "function") {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: .12 });
      alvos.forEach(function (el) { io.observe(el); });
    } else {
      alvos.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ===== CARROSSEL DO HERO =================================================
     O primeiro slide já vem pronto no HTML — é a foto do LCP e não pode
     depender deste script rodar. Os demais só recebem a foto quando chega a
     vez deles: todos ocupam a tela inteira, então dar src a todos de uma vez
     faz o navegador disputar banda com a foto que o visitante está esperando.
     Cada slide traz "base" — o caminho da foto sem o sufixo de tamanho — e as
     medidas dela; quem escreve essa lista é scripts/monta-hero.js. */
  var stage = document.getElementById("heroCarousel");
  var dotsEl = document.getElementById("heroDots");
  var lista = CFG.slides || [];

  if (stage && dotsEl && lista.length > 1) {
    var MEDIDAS_HERO = [480, 960, 1600];
    var conjunto = function (base, ext) {
      return MEDIDAS_HERO.map(function (w) {
        return base + "-" + w + "." + ext + " " + w + "w";
      }).join(", ");
    };

    var criarSlide = function (s) {
      var slide = document.createElement("div");
      slide.className = "slide";
      var pic = document.createElement("picture");
      var avif = document.createElement("source"); avif.type = "image/avif";
      var im = document.createElement("img");
      im.alt = s.alt; im.width = s.w || 960; im.height = s.h || 640; im.decoding = "async";
      pic.append(avif, im);
      slide.appendChild(pic);
      slide.carregar = function () {
        if (slide.carregada) return;
        slide.carregada = true;
        avif.sizes = im.sizes = "100vw";
        avif.srcset = conjunto(s.base, "avif");
        im.srcset = conjunto(s.base, "webp");
        im.src = s.base + "-960.webp";
      };
      return slide;
    };

    var slides = [stage.querySelector(".slide")];
    lista.slice(1).forEach(function (s, i) {
      var el = criarSlide(s);
      stage.appendChild(el);
      slides.push(el);
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Ir para foto " + (i + 2));
      dot.addEventListener("click", function () { go(i + 1, true); });
      dotsEl.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsEl.querySelectorAll("button"));
    dots[0].addEventListener("click", function () { go(0, true); });

    var idx = 0, timer;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var go = function (n, manual) {
      slides[idx].classList.remove("active"); dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      if (slides[idx].carregar) slides[idx].carregar();
      var prox = slides[(idx + 1) % slides.length];
      if (prox.carregar) prox.carregar();
      slides[idx].classList.add("active"); dots[idx].classList.add("active");
      if (manual) restart();
    };
    var next = function () { go(idx + 1); };
    var restart = function () { clearInterval(timer); if (!reduce) timer = setInterval(next, 5000); };

    var prefetch = function () { if (slides[1].carregar) slides[1].carregar(); };
    if (typeof window.requestIdleCallback === "function") requestIdleCallback(prefetch, { timeout: 3000 });
    else setTimeout(prefetch, 1500);

    restart();
  }

  /* ===== DEPOIMENTOS =======================================================
     Avaliações de hóspedes da Big Bear 1, como já publicadas no site antigo.
     Falta a atribuição de plataforma e data exigida em docs/ — enquanto isso,
     ficam sem selo de origem. Não invente depoimento novo aqui. */
  var track = document.getElementById("revTrack");
  if (track && window.DEPOIMENTOS) {
    var estrelas = "★★★★★";
    track.innerHTML = window.DEPOIMENTOS.map(function (d) {
      return '<div class="rcard">' +
        '<div class="stars">' + estrelas + "</div>" +
        '<div class="quote">"' + d.q + '"</div>' +
        '<div class="txt">' + d.t + "</div>" +
        '<div class="who"><div class="av">' + d.n[0] + "</div><div><b>" + d.n +
        "</b><span>Hóspede verificado</span></div></div>" +
        "</div>";
    }).join("").repeat(2);
  }

  /* ===== CARROSSEL DOS CARDS DE UNIDADE ====================================
     A primeira foto de cada card já vem no HTML (é ela que o visitante vê ao
     rolar até aqui). As demais são criadas por JS e só baixam quando entram em
     cena — dois carrosséis de seis fotos baixando tudo de uma vez custaria
     banda no celular sem ninguém estar olhando. */
  var PASTA = { "big-bear-1": "bb1", "big-bear-2": "bb2" };
  var MEDIDAS_CARD = [480, 960];

  function fonteGaleria(pasta, slug, ext, medidas) {
    return medidas.map(function (w) {
      return "/fotos/gal/" + pasta + "/" + slug + "-" + w + "." + ext + " " + w + "w";
    }).join(", ");
  }

  Object.keys(CFG.carrosseis || {}).forEach(function (unidade) {
    var car = document.querySelector('.uc-car[data-unidade="' + unidade + '"]');
    var fotos = CFG.carrosseis[unidade] || [];
    if (!car || fotos.length < 2) return;

    var pasta = PASTA[unidade];
    var dots = car.parentNode.querySelector(".uc-dots");
    var slides = [car.querySelector(".uc-slide")];

    fotos.slice(1).forEach(function (f) {
      var slide = document.createElement("div");
      slide.className = "uc-slide";
      var pic = document.createElement("picture");
      var avif = document.createElement("source"); avif.type = "image/avif";
      var im = document.createElement("img");
      im.alt = f.alt; im.width = 960; im.height = 640; im.decoding = "async"; im.loading = "lazy";
      pic.append(avif, im);
      slide.appendChild(pic);
      slide.carregar = function () {
        if (slide.carregada) return;
        slide.carregada = true;
        avif.sizes = im.sizes = "(max-width:860px) 100vw, 50vw";
        avif.srcset = fonteGaleria(pasta, f.slug, "avif", MEDIDAS_CARD);
        im.srcset = fonteGaleria(pasta, f.slug, "webp", MEDIDAS_CARD);
        im.src = "/fotos/gal/" + pasta + "/" + f.slug + "-960.webp";
      };
      car.appendChild(slide);
      slides.push(slide);
    });

    var pontos = [];
    if (dots) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Foto " + (i + 1) + " de " + slides.length);
        b.addEventListener("click", function () { ir(i, true); });
        dots.appendChild(b);
        pontos.push(b);
      });
      pontos[0].classList.add("active");
    }

    var atual = 0, relogio;
    var parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* só troca quando a próxima foto já está decodificada: passar para um
       slide ainda vazio deixa o card em branco por um instante. */
    function ir(n, manual) {
      var destino = (n + slides.length) % slides.length;
      if (destino === atual) return;
      var alvo = slides[destino];
      if (alvo.carregar) alvo.carregar();

      var trocar = function () {
        slides[atual].classList.remove("active");
        if (pontos[atual]) pontos[atual].classList.remove("active");
        atual = destino;
        alvo.classList.add("active");
        if (pontos[atual]) pontos[atual].classList.add("active");
        var prox = slides[(atual + 1) % slides.length];
        if (prox.carregar) prox.carregar();
        if (manual) recomecar();
      };

      var foto = alvo.querySelector("img");
      if (foto && !foto.complete) {
        foto.addEventListener("load", trocar, { once: true });
        foto.addEventListener("error", trocar, { once: true });
      } else {
        trocar();
      }
    }
    function recomecar() {
      clearInterval(relogio);
      if (!parado) relogio = setInterval(function () { ir(atual + 1); }, 6000);
    }

    car.parentNode.querySelectorAll(".uc-nav").forEach(function (b) {
      b.addEventListener("click", function () { ir(atual + (b.classList.contains("uc-next") ? 1 : -1), true); });
    });

    /* só começa a girar quando o card aparece na tela */
    if (typeof IntersectionObserver === "function") {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { slides[1].carregar(); recomecar(); obs.disconnect(); }
        });
      }, { threshold: .25 });
      obs.observe(car);
    } else {
      recomecar();
    }
  });

  /* ===== GALERIA: filtros e "ver todas" ==================================== */
  document.querySelectorAll(".gal-mais").forEach(function (botao) {
    botao.addEventListener("click", function () {
      var grade = document.getElementById(botao.dataset.grade);
      if (!grade) return;
      grade.classList.remove("encolhida");
      botao.remove();
    });
  });

  var filtros = document.querySelectorAll(".gal-filtros button");
  filtros.forEach(function (botao) {
    botao.addEventListener("click", function () {
      filtros.forEach(function (b) { b.classList.toggle("ativo", b === botao); });
      document.querySelectorAll(".gal-bloco").forEach(function (bloco) {
        bloco.hidden = botao.dataset.filtro !== "todas" && bloco.dataset.unidade !== botao.dataset.filtro;
      });
    });
  });

  /* ===== LIGHTBOX ==========================================================
     Cada miniatura guarda em data-base o caminho sem o sufixo de tamanho; a
     versão de 1600px só é baixada quando a foto é aberta. */
  var grades = document.querySelectorAll(".gal-fotos");
  if (grades.length) {
    var caixa = document.createElement("div");
    caixa.className = "lbox";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-modal", "true");
    caixa.setAttribute("aria-label", "Foto ampliada");
    caixa.innerHTML =
      '<button class="lb-btn lb-fechar" aria-label="Fechar">✕</button>' +
      '<button class="lb-btn lb-prev" aria-label="Foto anterior">‹</button>' +
      '<button class="lb-btn lb-next" aria-label="Próxima foto">›</button>' +
      '<figure><picture><source class="lb-avif" type="image/avif">' +
      '<img class="lb-img" alt="" decoding="async"></picture>' +
      '<figcaption class="lb-legenda"></figcaption></figure>' +
      '<div class="lb-contador"></div>';
    document.body.appendChild(caixa);

    var lbImg = caixa.querySelector(".lb-img");
    var lbAvif = caixa.querySelector(".lb-avif");
    var lbLegenda = caixa.querySelector(".lb-legenda");
    var lbContador = caixa.querySelector(".lb-contador");
    var itens = [], pos = 0, ultimoFoco = null;

    function mostrar(i) {
      pos = (i + itens.length) % itens.length;
      var b = itens[pos];
      lbAvif.srcset = b.dataset.base + "-1600.avif";
      lbImg.src = b.dataset.base + "-1600.webp";
      lbImg.alt = b.dataset.alt || "";
      lbLegenda.textContent = b.dataset.alt || "";
      lbContador.textContent = (pos + 1) + " / " + itens.length;
      /* adianta a vizinha, para a seta não esperar o download */
      var viz = itens[(pos + 1) % itens.length];
      if (viz) new Image().src = viz.dataset.base + "-1600.webp";
    }
    function abrir(grade, botao) {
      itens = Array.prototype.slice.call(grade.querySelectorAll(".gi"));
      ultimoFoco = botao;
      mostrar(itens.indexOf(botao));
      caixa.classList.add("aberta");
      document.body.classList.add("travada");
      caixa.querySelector(".lb-fechar").focus();
    }
    function fechar() {
      caixa.classList.remove("aberta");
      document.body.classList.remove("travada");
      lbImg.removeAttribute("src");
      lbAvif.removeAttribute("srcset");
      if (ultimoFoco) ultimoFoco.focus();
    }

    grades.forEach(function (grade) {
      grade.addEventListener("click", function (e) {
        var botao = e.target.closest(".gi");
        if (botao) abrir(grade, botao);
      });
    });
    caixa.querySelector(".lb-fechar").addEventListener("click", fechar);
    caixa.querySelector(".lb-prev").addEventListener("click", function () { mostrar(pos - 1); });
    caixa.querySelector(".lb-next").addEventListener("click", function () { mostrar(pos + 1); });
    caixa.addEventListener("click", function (e) { if (e.target === caixa) fechar(); });
    document.addEventListener("keydown", function (e) {
      if (!caixa.classList.contains("aberta")) return;
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowRight") mostrar(pos + 1);
      if (e.key === "ArrowLeft") mostrar(pos - 1);
    });
  }
})();
