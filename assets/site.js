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

    if (typeof gtag === "function") gtag("event", nome, dados);
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
     Slides com "slug" usam as versões AVIF/WebP de /fotos/otim/; os outros
     carregam o arquivo de "src" direto. */
  var stage = document.getElementById("heroCarousel");
  var dotsEl = document.getElementById("heroDots");
  var lista = CFG.slides || [];

  if (stage && dotsEl && lista.length > 1) {
    var LARGURAS = [480, 768, 1024];
    var conjunto = function (slug, ext) {
      return LARGURAS.map(function (w) {
        return "/fotos/otim/" + slug + "-" + w + "." + ext + " " + w + "w";
      }).join(", ");
    };

    var criarSlide = function (s) {
      var slide = document.createElement("div");
      slide.className = "slide";
      var pic = document.createElement("picture");
      var avif = document.createElement("source"); avif.type = "image/avif";
      var webp = document.createElement("source"); webp.type = "image/webp";
      var im = document.createElement("img");
      im.alt = s.alt; im.width = 1024; im.height = 682; im.decoding = "async";
      if (s.slug) { pic.append(avif, webp, im); } else { pic.append(im); }
      slide.appendChild(pic);
      slide.carregar = function () {
        if (slide.carregada) return;
        slide.carregada = true;
        if (s.slug) {
          avif.sizes = webp.sizes = "100vw";
          avif.srcset = conjunto(s.slug, "avif");
          webp.srcset = conjunto(s.slug, "webp");
        }
        im.src = s.src;
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
})();
