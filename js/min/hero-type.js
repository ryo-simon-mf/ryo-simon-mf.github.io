/**
 * Homepage hero: types the statement, holds, erases, then retypes it in the
 * next language, cycling forever (terminal style).
 *
 * Japanese is typed the way it is really written: romaji keystrokes compose
 * into kana (ta -> た), and each phrase then converts to kanji the way an IME
 * commits a segment. The in-progress segment is underlined like IME
 * composition text (.ime-composing). Other languages type plainly.
 *
 * - The Japanese statement is server-rendered inside #hero-type, so crawlers
 *   and no-JS visitors always get real text. An inline script right after the
 *   hero markup clears it pre-paint (same conditions as here), and this
 *   script retypes it from the first keystroke on landing.
 * - The animated line is aria-hidden; screen readers get the static
 *   .sr-only copy next to it, so the churn is never announced.
 * - prefers-reduced-motion: the static text is left alone entirely.
 */
(function () {
    'use strict';

    var el = document.getElementById('hero-type');
    if (!el) return;
    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Japanese, as IME conversion segments. The concatenated `out` strings
    // must equal the server-rendered ja statement (and the sr-only copy).
    // units: [displayed kana, romaji keystrokes that produce it]
    var JA_SEGMENTS = [
        { out: '対象とした',   units: [['た','ta'],['い','i'],['しょ','sho'],['う','u'],['と','to'],['し','shi'],['た','ta']] },
        { out: 'マテリアルや', units: [['ま','ma'],['て','te'],['り','ri'],['あ','a'],['る','ru'],['や','ya']] },
        { out: 'メディアの',   units: [['め','me'],['でぃ','dhi'],['あ','a'],['の','no']] },
        { out: '本来の',       units: [['ほ','ho'],['ん','nn'],['ら','ra'],['い','i'],['の','no']] },
        { out: '姿や',         units: [['す','su'],['が','ga'],['た','ta'],['や','ya']] },
        { out: '性質を、',     units: [['せ','se'],['い','i'],['し','shi'],['つ','tsu'],['を','wo'],['、',',']] },
        { out: '異なる',       units: [['こ','ko'],['と','to'],['な','na'],['る','ru']] },
        { out: '視点で',       units: [['し','shi'],['て','te'],['ん','nn'],['で','de']] },
        { out: '捉えて',       units: [['と','to'],['ら','ra'],['え','e'],['て','te']] },
        { out: '再構築する。', units: [['さ','sa'],['い','i'],['こ','ko'],['う','u'],['ち','chi'],['く','ku'],['す','su'],['る','ru'],['。','.']] }
    ];

    var LANGS = [
        { lang: 'ja', ime: JA_SEGMENTS },
        { lang: 'en', text: 'Reconstructing the original form and nature of material and media from a different perspective.' },
        { lang: 'fr', text: 'Reconstruire la forme et la nature originelles de la matière et des médias sous une perspective différente.' },
        { lang: 'de', text: 'Die ursprüngliche Form und Natur von Material und Medien aus einer anderen Perspektive rekonstruieren.' },
        { lang: 'es', text: 'Reconstruir la forma y la naturaleza originales del material y los medios desde una perspectiva diferente.' },
        { lang: 'it', text: 'Ricostruire la forma e la natura originarie di materiali e media da una prospettiva diversa.' },
        { lang: 'zh-Hans', text: '以不同的视角，重构材料与媒介本来的形态与性质。' },
        { lang: 'ko', text: '대상이 된 재료와 미디어 본래의 모습과 성질을 다른 시각에서 재구성한다.' }
    ];

    var TYPE_MS = 45;     // per keystroke
    var ERASE_MS = 20;    // per character while erasing
    var HOLD_MS = 2000;   // full sentence rest
    var GAP_MS = 450;     // empty-line rest before the next language
    var CONVERT_MS = 240; // kana shown, "space pressed": pause before kanji
    var SEG_GAP_MS = 100; // between committed segment and next keystroke
    var START_MS = 500;   // after load, before the first keystroke

    // committed = confirmed text; composing = IME pre-edit (underlined)
    var committed = '';
    var composing = '';
    var committedNode = document.createTextNode('');
    var composingSpan = document.createElement('span');
    composingSpan.className = 'ime-composing';
    el.textContent = '';
    el.appendChild(committedNode);
    el.appendChild(composingSpan);

    function render() {
        committedNode.textContent = committed;
        composingSpan.textContent = composing;
    }

    var current = 0;

    // Plain typing (non-Japanese). Array.from splits by code point, so no
    // surrogate halves ever appear mid-type.
    function typeOut(chars, i) {
        if (i <= chars.length) {
            committed = chars.slice(0, i).join('');
            render();
            setTimeout(function () { typeOut(chars, i + 1); }, TYPE_MS);
        } else {
            setTimeout(erase, HOLD_MS);
        }
    }

    // Japanese IME typing: romaji -> kana -> converted segment.
    function typeJa(segments, si) {
        if (si >= segments.length) {
            setTimeout(erase, HOLD_MS);
            return;
        }
        var seg = segments[si];
        var kanaDone = '';
        var ui = 0;
        var li = 0;

        function keystroke() {
            var unit = seg.units[ui];
            li++;
            if (li >= unit[1].length) {
                // final letter of the unit: romaji resolves into kana
                kanaDone += unit[0];
                composing = kanaDone;
                ui++;
                li = 0;
            } else {
                composing = kanaDone + unit[1].slice(0, li);
            }
            render();
            if (ui >= seg.units.length) {
                setTimeout(convert, CONVERT_MS);
            } else {
                setTimeout(keystroke, TYPE_MS);
            }
        }

        function convert() {
            committed += seg.out;
            composing = '';
            render();
            setTimeout(function () { typeJa(segments, si + 1); }, SEG_GAP_MS);
        }

        keystroke();
    }

    function typeCurrent() {
        var item = LANGS[current];
        el.setAttribute('lang', item.lang);
        if (item.ime) {
            typeJa(item.ime, 0);
        } else {
            typeOut(Array.from(item.text), 1);
        }
    }

    function erase() {
        var chars = Array.from(committed);
        if (chars.length > 0) {
            committed = chars.slice(0, -1).join('');
            render();
            setTimeout(erase, ERASE_MS);
        } else {
            current = (current + 1) % LANGS.length;
            setTimeout(typeCurrent, GAP_MS);
        }
    }

    setTimeout(typeCurrent, START_MS);
})();
