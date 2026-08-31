/**
 * Homepage hero: types the statement, holds, erases, then retypes it in the
 * next language, cycling forever (terminal style).
 *
 * - The Japanese statement is server-rendered inside #hero-type, so crawlers
 *   and no-JS visitors always get real text; this script only takes over the
 *   already-rendered line.
 * - The animated line is aria-hidden; screen readers get the static
 *   .sr-only copy next to it, so the churn is never announced.
 * - prefers-reduced-motion: leave the static text alone entirely.
 */
(function () {
    'use strict';

    var el = document.getElementById('hero-type');
    if (!el) return;
    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // The ja text must match the server-rendered content of #hero-type:
    // the cycle starts by holding, then erasing what is already on screen.
    var LANGS = [
        { lang: 'ja', text: '対象としたマテリアルやメディアの本来の姿や性質を、異なる視点で捉えて再構築する。' },
        { lang: 'en', text: 'Reconstructing the original form and nature of material and media from a different perspective.' },
        { lang: 'fr', text: 'Reconstruire la forme et la nature originelles de la matière et des médias sous une perspective différente.' },
        { lang: 'de', text: 'Die ursprüngliche Form und Natur von Material und Medien aus einer anderen Perspektive rekonstruieren.' },
        { lang: 'es', text: 'Reconstruir la forma y la naturaleza originales del material y los medios desde una perspectiva diferente.' },
        { lang: 'it', text: 'Ricostruire la forma e la natura originarie di materiali e media da una prospettiva diversa.' },
        { lang: 'zh-Hans', text: '以不同的视角，重构材料与媒介本来的形态与性质。' },
        { lang: 'ko', text: '대상이 된 재료와 미디어 본래의 모습과 성질을 다른 시각에서 재구성한다.' }
    ];

    var TYPE_MS = 55;    // per character while typing
    var ERASE_MS = 20;   // per character while erasing
    var HOLD_MS = 2000;  // full sentence rest
    var GAP_MS = 450;    // empty-line rest before the next language

    // Array.from splits by code point, not UTF-16 unit, so no surrogate halves
    // ever appear mid-type.
    var current = 0;

    function typeOut(chars, i) {
        if (i <= chars.length) {
            el.textContent = chars.slice(0, i).join('');
            setTimeout(function () { typeOut(chars, i + 1); }, TYPE_MS);
        } else {
            setTimeout(erase, HOLD_MS);
        }
    }

    function erase() {
        var chars = Array.from(el.textContent);
        if (chars.length > 0) {
            el.textContent = chars.slice(0, -1).join('');
            setTimeout(erase, ERASE_MS);
        } else {
            current = (current + 1) % LANGS.length;
            el.setAttribute('lang', LANGS[current].lang);
            setTimeout(function () {
                typeOut(Array.from(LANGS[current].text), 1);
            }, GAP_MS);
        }
    }

    // The ja line is already on screen: rest on it first, then start the cycle.
    setTimeout(erase, HOLD_MS);
})();
