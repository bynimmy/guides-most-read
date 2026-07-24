// GUIDES PAGE — "most read" featured-card swap.
// I (Claude) will register this on the /guides page for you via the Webflow API
// once you give me your GitHub repo, so the FEATURED_JSON_URL below points at your
// featured.json. It fetches the winner and re-renders the featured card. If the
// fetch fails for any reason, the existing featured card is left untouched (safe).
(function () {
  // vvv I set this to your real raw URL when your repo exists vvv
  var FEATURED_JSON_URL = 'https://raw.githubusercontent.com/USERNAME/REPO/main/featured.json';

  var G = {
    families: {
      u: '/lifestyle-family-portraits-guide-what-to-wear',
      i: 'https://cdn.prod.website-files.com/683f7180d53670425a61e36f/6a61d5e3b24a88b97d7522ac_guides-featured-families.jpg',
      t: 'What to Wear · Family &amp; <em>Lifestyle</em> Sessions',
      b: "Dress your whānau for a session that actually looks like you: colour theory, eight ready-to-wear palettes, and honest do's and don'ts.",
      c: 'Families & lifestyle', m: 9
    },
    headshots: {
      u: '/the-corporate-headshot-field-guide-what-to-wear-how-to-prepare',
      i: 'https://cdn.prod.website-files.com/683f7180d53670425a61e36f/6a61d5e376c3cfbf0e89b3ed_guides-featured-corporate.jpg',
      t: 'What to Wear &amp; How to Prepare · <em>Corporate</em> Headshots',
      b: 'Look sharp and like yourself on the day: outfits that read well on camera, grooming, backdrops, and how to prep your team.',
      c: 'Headshots', m: 11
    },
    weddings: {
      u: '/the-ultimate-wedding-guide',
      i: 'https://cdn.prod.website-files.com/683f7180d53670425a61e36f/6a6031b47ca3055992927a06_wed-hero.jpg',
      t: 'The Ultimate <em>Wedding</em> Guide',
      b: 'Timelines, family formals, first looks and golden hour: everything to plan a day that flows and still feels like you.',
      c: 'Weddings', m: 20
    }
  };

  function render(k) {
    var g = G[k]; if (!g) return;
    var slot = document.getElementById('featured-slot'); if (!slot) return;
    slot.innerHTML =
      '<a class="feat-media" href="' + g.u + '"><img src="' + g.i + '" alt="" loading="lazy"></a>' +
      '<div class="feat-body"><span class="feat-flag">most read guide</span><h2>' + g.t + '</h2>' +
      '<p class="feat-blurb">' + g.b + '</p>' +
      '<div class="feat-meta"><span class="gtag">' + g.c + '</span><span class="rt">' + g.m + ' min read</span></div>' +
      '<div class="feat-actions"><a class="btn" href="' + g.u + '">read the guide</a></div></div>';
  }

  function run() {
    fetch(FEATURED_JSON_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.featured && G[d.featured]) render(d.featured); })
      .catch(function () { /* leave the existing featured card as-is */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
