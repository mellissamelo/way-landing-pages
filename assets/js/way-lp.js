/* ==========================================================
   WAY GROUP — Script compartilhado das landing pages
   Lê a configuração de window.WAY_LP (definida em cada página).
   ========================================================== */
(function () {
  var cfg = window.WAY_LP || {};

  /* ---------- Vídeo do YouTube ----------
     Aceita o link inteiro (watch?v=, youtu.be/, shorts/, embed/) ou só o ID. */
  function youtubeId(input) {
    if (!input) return "";
    input = String(input).trim();
    if (/^[\w-]{11}$/.test(input)) return input;
    var m = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : "";
  }

  document.querySelectorAll("[data-video]").forEach(function (box) {
    var id = youtubeId(box.getAttribute("data-video") || cfg.youtube);
    if (!id) return; // mantém o aviso "vídeo em breve"

    box.innerHTML =
      '<img class="video__thumb" alt="" loading="lazy" src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" ' +
      "onload=\"if(this.naturalWidth<=120&&this.src.indexOf('maxres')>-1)this.src='https://i.ytimg.com/vi/" + id + "/hqdefault.jpg'\" " +
      "onerror=\"this.onerror=null;this.src='https://i.ytimg.com/vi/" + id + "/hqdefault.jpg'\">" +
      '<button class="video__play" type="button" aria-label="Assistir ao vídeo">' +
      '<span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></button>';

    box.querySelector(".video__play").addEventListener("click", function () {
      box.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1" title="Vídeo Way Group" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });
  });

  /* ---------- Links de WhatsApp ---------- */
  var waNumber = String(cfg.whatsapp || "").replace(/\D/g, "");
  var waLink = waNumber
    ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(cfg.mensagem || "Olá! Vim pelo site da Way Group.")
    : "#contato";
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.setAttribute("href", waLink);
    if (waNumber) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
  });

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", false); });
    });
  }

  /* ---------- Animação de entrada ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Rolagem suave (Lenis) — dá o "deslizar" contínuo que as animações de rolagem precisam ---------- */
  var lenis = null;
  if (window.Lenis && !reduz) {
    var toque = window.matchMedia("(pointer: coarse)").matches;
    lenis = new Lenis({
      duration: toque ? 1.0 : 1.5,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: .85,
      touchMultiplier: 1.2
    });
    (function quadro(t) { lenis.raf(t); requestAnimationFrame(quadro); })(performance.now());
    // links internos (#secao) rolam pelo Lenis, descontando o header fixo
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2 || a.hasAttribute("data-wa")) return;
        var alvo = document.querySelector(id);
        if (!alvo) return;
        e.preventDefault();
        lenis.scrollTo(alvo, { offset: -76 });
      });
    });
  }

  /* ---------- Itens de uma mesma lista entram em sequência ---------- */
  document.querySelectorAll(".pains, .pillars, .steps, .audience, .compare, .team, .crew__row").forEach(function (grupo) {
    grupo.querySelectorAll(":scope > .reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.09) + "s";
      // depois que entrou, tira o atraso para o hover responder na hora
      el.addEventListener("transitionend", function limpa(ev) {
        if (ev.propertyName === "opacity") { el.style.transitionDelay = ""; el.removeEventListener("transitionend", limpa); }
      });
    });
  });

  /* ---------- Linhas douradas se desenhando ao aparecer ---------- */
  if (!reduz && "IntersectionObserver" in window) {
    var paths = document.querySelectorAll(".swoosh:not(.swoosh--scrub) path");
    var ioLinha = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var p = e.target.querySelector("path");
          requestAnimationFrame(function () { p.classList.add("is-drawn"); });
          ioLinha.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    paths.forEach(function (p) {
      p.setAttribute("pathLength", "1");
      p.classList.add("is-drawable");
      ioLinha.observe(p.closest("svg"));
    });
  }

  /* ---------- Números do topo contando ---------- */
  if (!reduz) {
    document.querySelectorAll(".hero__proof strong").forEach(function (el) {
      var m = el.textContent.match(/^(\d+)(.*)$/);
      if (!m) return;
      var alvo = +m[1], resto = m[2], n = 0;
      el.textContent = "0" + resto;
      setTimeout(function () {
        var t = setInterval(function () {
          n++; el.textContent = n + resto;
          if (n >= alvo) clearInterval(t);
        }, 110);
      }, 700);
    });
  }

  /* ==========================================================
     ANIMAÇÕES POR ROLAGEM — tudo acompanha a posição do scroll
     ========================================================== */
  var vh = window.innerHeight;
  var cenas = [];
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  // 0 quando o topo do elemento está em "de" (fração da tela), 1 quando chega em "ate"
  function entrada(r, de, ate) { return clamp((vh * de - r.top) / (vh * (de - ate))); }
  function cena(el, fn) { if (el) cenas.push({ el: el, fn: fn }); }
  var desktop = window.matchMedia("(min-width: 981px)");

  /* Entregas: "tubo" dourado serpenteia pela seção, desenhado pela rolagem.
     Nos laços o tubo cruza por cima de si mesmo, com sombra só sobre o trecho de baixo. */
  document.querySelectorAll("[data-journey]").forEach(function (box) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = box.querySelector(".journey__svg");
    var road = box.querySelector(".journey__road");
    var stops = box.querySelectorAll(".stop");
    var amostras = [], total = 0, marcos = [], extras = [];
    var borda = document.createElementNS(NS, "path");
    borda.setAttribute("class", "journey__edge");
    svg.insertBefore(borda, road);

    function f(p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }
    function seg(a, c1, c2, b) { return [a, c1, c2, b]; }
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    function corte(s, t0, t1) { // trecho [t0,t1] de uma cúbica (de Casteljau)
      function divide(s, t) {
        var a = lerp(s[0], s[1], t), b = lerp(s[1], s[2], t), c = lerp(s[2], s[3], t);
        var d = lerp(a, b, t), e = lerp(b, c, t), m = lerp(d, e, t);
        return [[s[0], a, d, m], [m, e, c, s[3]]];
      }
      var dir = divide(s, t0)[1];
      return divide(dir, (t1 - t0) / (1 - t0))[0];
    }
    function txt(lista) {
      return lista.map(function (s, k) { return (k ? "" : "M" + f(s[0])) + " C" + f(s[1]) + " " + f(s[2]) + " " + f(s[3]); }).join("");
    }
    function el(tag, attrs, pai) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (pai || svg).appendChild(e); return e; }
    function medir(lista) { var t = el("path", { d: txt(lista) }); var L = t.getTotalLength(); t.remove(); return L; }

    function montar() {
      var b = box.getBoundingClientRect(), W = b.width, H = b.height;
      var celular = W < 700;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      extras.forEach(function (x) { x.g.remove(); }); extras = [];

      var segs = [], lacos = [];
      var cur = celular ? [22, -60] : [W + 160, -40], tan = celular ? [0, 1] : [-.8, .6]; // tangente de saída do ponto atual
      function ate(p, tanChegada, k) { // curva até p, chegando com a direção tanChegada
        // alcance das alças: considera também o deslocamento lateral, para curvas largas e suaves
        var dist = Math.abs(p[1] - cur[1]) * (k || .55) + Math.abs(p[0] - cur[0]) * .08;
        segs.push(seg(cur, [cur[0] + tan[0] * dist, cur[1] + tan[1] * dist], [p[0] - tanChegada[0] * dist, p[1] - tanChegada[1] * dist], p));
        cur = p; tan = tanChegada;
      }
      var alvos = [];
      var LACOS = []; // frentes com "voltinha" (ex.: [1, 4]); vazio = o caminho só faz curvas
      [].forEach.call(stops, function (st, k) {
        var r = st.getBoundingClientRect();
        var y = r.top - b.top + r.height / 2;
        alvos.push(y);
        if (celular) { ate([22, y], [0, 1]); return; }
        var esq = st.classList.contains("stop--left");
        var x = esq ? W * .565 : W * .435; // o tubo serpenteia pelo corredor central, entre as duas colunas de texto
        if (LACOS.indexOf(k) >= 0) {
          // laço redondo: desce na diagonal até o cruzamento K, contorna 270° de um círculo e cruza K de novo a 90°
          var s = esq ? 1 : -1, R = 108, C = [esq ? W * .74 : W * .26, Math.max(y, r.bottom - b.top - 30)]; // laço na altura do fim do texto: a saída na diagonal passa abaixo dele
          var P = function (dx, dy) { return [C[0] + s * dx, C[1] + dy]; };
          var K = P(-1.4142 * R, 0), A = P(-.7071 * R, .7071 * R), B = P(-.7071 * R, -.7071 * R);
          var d1 = [s * .7071, .7071], d2 = [-s * .7071, .7071];
          var linha = function (a, b) { return seg(a, lerp(a, b, 1 / 3), lerp(a, b, 2 / 3), b); };
          var arco = function (t0, t1) {
            var q = 4 / 3 * Math.tan((t1 - t0) / 4) * R;
            var c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
            return seg(P(R * c0, R * s0), P(R * c0 - q * s0, R * s0 + q * c0), P(R * c1 + q * s1, R * s1 - q * c1), P(R * c1, R * s1));
          };
          ate(K, d1);
          segs.push(linha(K, A));
          for (var q = 0; q < 3; q++) segs.push(arco((135 - 90 * q) * Math.PI / 180, (135 - 90 * (q + 1)) * Math.PI / 180));
          segs.push(linha(B, K));
          lacos.push(segs.length - 1); // índice da "volta" (B -> K)
          cur = K; tan = d2;
        } else {
          ate([x, y], [0, 1]);
        }
      });
      ate(celular ? [22, H + 80] : [W * .5, H + 160], [0, 1]);

      road.setAttribute("d", txt(segs)); borda.setAttribute("d", txt(segs));
      total = road.getTotalLength();
      [road, borda].forEach(function (p) { p.style.strokeDasharray = total + " " + (total + 200); p.style.strokeDashoffset = reduz ? 0 : total; });

      // sobreposição: fim da "volta" + começo do trecho seguinte por cima, com sombra mascarada no trecho de baixo
      lacos.forEach(function (iv, n) {
        var volta = segs[iv], depois = segs[iv + 1];
        if (!depois) return;
        var tO = Math.min(.5, 70 / medir([depois]));
        var cima = [corte(volta, .4, 1), corte(depois, 0, tO)];
        var inicio = medir(segs.slice(0, iv).concat([corte(volta, 0, .4)]));
        // o trecho de cima é redesenhado com o contorno escuro, separando os dois "fios" no cruzamento
        var g = el("g", {});
        var cimaCurta = [corte(volta, .46, 1), corte(depois, 0, tO * .8)]; // contorno um pouco menor: a ponta fica escondida sob o dourado
        var contorno = el("path", { d: txt(cimaCurta), class: "journey__edge journey__edge--corte" }, g);
        var over = el("path", { d: txt(cima), class: "journey__over" }, g);
        var len = over.getTotalLength();
        over.style.strokeDasharray = len + " " + (len + 200); over.style.strokeDashoffset = reduz ? 0 : len;
        // o contorno começa um pouco depois: mesmo desenho, deslocado
        var desloc = medir([corte(volta, .4, .46)]), lenC = contorno.getTotalLength();
        contorno.style.strokeDasharray = lenC + " " + (lenC + 200); contorno.style.strokeDashoffset = reduz ? 0 : lenC;
        extras.push({ g: g, over: over, contorno: contorno, inicio: inicio, len: len, inicioC: inicio + desloc, lenC: lenC });
      });

      amostras = [];
      for (var k = 0; k <= 900; k++) { var q = road.getPointAtLength(total * k / 900); amostras.push([total * k / 900, q.y]); }
      marcos = alvos.map(function (y) {
        for (var k = 0; k < amostras.length; k++) if (amostras[k][1] >= y - 60) return amostras[k][0];
        return total;
      });
    }
    function comprimentoNaAltura(y) {
      if (!amostras.length || y <= amostras[0][1]) return 0;
      for (var k = 1; k < amostras.length; k++) {
        if (amostras[k][1] >= y && amostras[k - 1][1] < y) {
          var a = amostras[k - 1], c = amostras[k], t = (y - a[1]) / ((c[1] - a[1]) || 1);
          return a[0] + (c[0] - a[0]) * t;
        }
      }
      return total;
    }
    montar();
    if (reduz) return;
    box.classList.add("is-armed");
    window.addEventListener("resize", function () { montar(); pedir(); });
    window.addEventListener("load", function () { montar(); pedir(); });

    // o desenho segue a rolagem com uma leve suavização (sem "degraus" a cada giro da roda do mouse)
    var alvoL = 0, atualL = 0, animando = false;
    function pintar(L) {
      road.style.strokeDashoffset = (total - L).toFixed(1); borda.style.strokeDashoffset = road.style.strokeDashoffset;
      extras.forEach(function (x) {
        x.over.style.strokeDashoffset = (x.len - Math.max(0, Math.min(x.len, L - x.inicio))).toFixed(1);
        x.contorno.style.strokeDashoffset = (x.lenC - Math.max(0, Math.min(x.lenC, L - x.inicioC))).toFixed(1);
      });
      stops.forEach(function (st, k) { st.classList.toggle("is-on", L >= marcos[k]); });
    }
    function passo() {
      atualL += (alvoL - atualL) * .085; // ~0,8 s para alcançar a rolagem
      if (Math.abs(alvoL - atualL) < .5) { atualL = alvoL; animando = false; } else requestAnimationFrame(passo);
      pintar(atualL);
    }
    cena(box, function (r) {
      // a ponta acompanha ~65% da altura da tela, proporcional ao avanço dentro da seção
      alvoL = total * clamp((vh * .8 - r.top) / (r.height - vh * .2)); // começa com a seção a 80% da tela e termina no fim dela
      if (!animando) { animando = true; requestAnimationFrame(passo); }
    });
  });

  /* O caminho "abre" na cor: círculo dourado cresce a partir da ponta do tubo e toma a seção seguinte */
  document.querySelectorAll("[data-open]").forEach(function (sec) {
    var jb = document.querySelector("[data-journey]");
    sec.classList.add("is-scrub");
    if (reduz) { sec.style.setProperty("--p", 1); return; }
    cena(sec, function (r) {
      if (jb) {
        var j = jb.getBoundingClientRect();
        var x = (j.width < 700 ? 22 : j.width * .5) + j.left - r.left;
        sec.style.setProperty("--ox", x.toFixed(1) + "px");
      }
      sec.style.setProperty("--p", entrada(r, .72, .12).toFixed(4));
    });
  });

  if (!reduz) {
    /* Títulos sobem de trás de uma "máscara" */
    document.querySelectorAll("main h2").forEach(function (h) {
      if (h.closest(".final-cta")) return;
      h.innerHTML = '<span class="rise"><span class="rise__in">' + h.innerHTML + "</span></span>";
      var inn = h.querySelector(".rise__in");
      cena(h, function (r) { inn.style.transform = "translateY(" + ((1 - entrada(r, .98, .72)) * 105).toFixed(2) + "%)"; });
    });

    /* Hero: foto desce mais devagar e o texto sobe e some */
    var heroBg = document.querySelector(".hero__bg"), heroTxt = document.querySelector(".hero__grid");
    cena(document.querySelector(".hero"), function (r) {
      var y = Math.max(0, -r.top);
      if (y > vh * 1.2) return;
      if (heroBg) heroBg.style.translate = "0 " + (y * .3).toFixed(1) + "px";
      if (heroTxt) { heroTxt.style.translate = "0 " + (-y * .15).toFixed(1) + "px"; heroTxt.style.opacity = clamp(1 - y / (vh * .7)).toFixed(3); }
    });

    /* Time: círculo marinho cresce até tomar a seção; cartões sobem em alturas diferentes */
    var time = document.querySelector(".team-section");
    if (time) {
      time.classList.add("is-scrub");
      cena(time, function (r) { time.style.setProperty("--r", (entrada(r, 1, .15) * 150).toFixed(1) + "%"); });
      time.querySelectorAll(".team .member").forEach(function (m, i) {
        cena(m, function (r) { m.style.translate = "0 " + ((1 - entrada(r, 1.05, .55)) * (90 + (i % 4) * 60)).toFixed(1) + "px"; });
      });
      // consultores: entram em "onda", um depois do outro
      time.querySelectorAll(".crew .member").forEach(function (m, i) {
        cena(m, function (r) {
          var p = entrada(r, 1.02 + i * .04, .62 + i * .04);
          m.style.translate = "0 " + ((1 - p) * 70).toFixed(1) + "px"; m.style.opacity = (.15 + p * .85).toFixed(3);
        });
      });
    }

    /* Linhas douradas que se desenham com a rolagem */
    document.querySelectorAll(".swoosh--scrub path").forEach(function (p) {
      p.classList.remove("is-drawable", "is-drawn");
      p.setAttribute("pathLength", "1");
      p.style.strokeDasharray = "1"; p.style.transition = "none";
      cena(p.closest("svg"), function (r) { p.style.strokeDashoffset = (1 - entrada(r, 1.1, .35)).toFixed(4); });
    });

    /* CTA final cresce ao chegar */
    var cta = document.querySelector(".final-cta");
    cena(cta, function (r) { var p = entrada(r, 1, .55); cta.style.scale = (.9 + p * .1).toFixed(4); });

    /* Rodapé: marca gigante sobe do fundo */
    var giant = document.querySelector(".footer__giant span");
    cena(giant, function (r) { giant.style.translate = "0 " + ((1 - entrada(r, 1.15, .75)) * 60).toFixed(1) + "%"; });
  }

  var pedido = false;
  function rodar() {
    pedido = false; vh = window.innerHeight;
    cenas.forEach(function (c) { c.fn(c.el.getBoundingClientRect()); });
  }
  function pedir() { if (!pedido) { pedido = true; requestAnimationFrame(rodar); } }
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  rodar();

  /* ---------- Header com sombra ao rolar ---------- */
  var header = document.querySelector(".header");
  if (header) {
    var aoRolar = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
    window.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar();
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
