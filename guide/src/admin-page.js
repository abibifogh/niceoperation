/* The portal. One page, two tabs, no build step and no framework, for the
   same reason the guide has none: it has to be editable by whoever is here
   in five years, with a text editor and no toolchain. */
export const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Somewhere Nice · portal</title>
<style>
:root{
  --paper:#FAF7F0;--white:#fff;--line:#EAE3D5;--line2:#F2ECE0;
  --ink:#231F1A;--ink2:#6B6358;--ink3:#9A9185;--brown:#4A3418;--gold:#9A7B3F;
  --sunk:#F7F2E8;--red:#A32E22;--green:#5A7350;
  --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --serif:Georgia,'Times New Roman',serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--sans);font-size:16px;line-height:1.6;color:var(--ink);background:var(--paper)}
.wrap{max-width:1000px;margin:0 auto;padding:0 20px}
h1,h2,h3{font-family:var(--serif);font-weight:400;color:var(--brown);line-height:1.2}
h1{font-size:1.5rem}h2{font-size:1.3rem}h3{font-size:1.1rem}
header{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}
header .wrap{display:flex;align-items:center;gap:1rem;padding-top:.9rem;padding-bottom:.9rem;flex-wrap:wrap}
header .who{margin-left:auto;font-size:.82rem;color:var(--ink3)}
nav{display:flex;gap:.4rem;background:var(--sunk);border-radius:100px;padding:3px}
nav button{background:none;border:0;cursor:pointer;font:inherit;font-size:.9rem;color:var(--ink2);padding:.35rem .9rem;border-radius:100px}
nav button[aria-selected="true"]{background:#fff;color:var(--brown);font-weight:600;box-shadow:0 1px 3px rgba(74,52,24,.12)}
main{padding:2rem 0 5rem}
.panel[hidden]{display:none}
.card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1.2rem;margin-bottom:12px}
.muted{color:var(--ink3);font-size:.88rem}
.tiles{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:1.4rem}
.tile{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1rem}
.tile b{display:block;font-family:var(--serif);font-size:2rem;color:var(--brown);line-height:1}
.tile span{display:block;font-size:.84rem;color:var(--ink3);margin-top:.2rem}
.bars{display:grid;gap:5px;margin-top:.8rem}
.bar{display:grid;grid-template-columns:1fr auto;gap:.8rem;align-items:center;font-size:.9rem}
.bar .t{position:relative;background:var(--sunk);border-radius:4px;padding:.25rem .55rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.bar .t i{position:absolute;inset:0 auto 0 0;background:#EFE4CB;z-index:0}
.bar .t span{position:relative;z-index:1}
.bar .n{font-weight:600;color:var(--brown);font-variant-numeric:tabular-nums}
.spark{display:flex;align-items:flex-end;gap:2px;height:60px;margin-top:.8rem}
.spark i{flex:1;background:#D8C89C;border-radius:2px 2px 0 0;min-height:2px}
.spark i.today{background:var(--gold)}
.row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}
.grow{flex:1;min-width:0}
label{display:block;font-size:.82rem;font-weight:600;color:var(--ink2);margin-bottom:.25rem}
label .opt{font-weight:400;color:var(--ink3)}
input,textarea,select{width:100%;border:1.5px solid var(--line);border-radius:7px;padding:.5rem .65rem;font:inherit;font-size:.93rem;background:#fff;color:var(--ink)}
input:focus,textarea:focus,select:focus{outline:2px solid var(--gold);outline-offset:0;border-color:var(--gold)}
textarea{min-height:5rem;resize:vertical}
.fields{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:700px){.fields{grid-template-columns:1fr 1fr}.wide{grid-column:1/-1}}
.btn{border:1.5px solid var(--line);background:#fff;border-radius:7px;cursor:pointer;font:inherit;font-size:.9rem;font-weight:600;padding:.45rem .9rem;color:var(--ink)}
.btn:hover{border-color:var(--brown)}
.btn.p{background:var(--brown);border-color:var(--brown);color:#fff}
.btn.d{color:var(--red)}
.btn.d:hover{border-color:var(--red)}
.dlist{display:grid;gap:10px}
.d{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1rem 1.1rem}
.d.off{opacity:.55}
.d h3{font-size:1.1rem}
.d .meta{font-size:.85rem;color:var(--ink3);margin-top:.1rem}
.d .runs{display:flex;gap:4px;flex-wrap:wrap;margin-top:.5rem}
.d .runs span{background:var(--sunk);border-radius:100px;padding:.12rem .55rem;font-size:.78rem;color:var(--ink2)}
.pill{display:inline-block;border-radius:100px;padding:.12rem .55rem;font-size:.74rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
.pill.live{background:#E6EDE2;color:#3F5637}
.pill.hid{background:#F0E9DA;color:var(--ink2)}
.pill.via{background:#F7E6E2;color:var(--red)}
.note{background:var(--sunk);border-left:3px solid var(--gold);border-radius:7px;padding:.8rem 1rem;font-size:.88rem;color:var(--ink2);margin-bottom:1.2rem}
.note b{color:var(--brown)}
.err{background:#F7E6E2;border:1px solid #EBD5D0;color:var(--red);border-radius:7px;padding:.7rem .9rem;font-size:.9rem;margin-bottom:1rem}
.err[hidden]{display:none}
.ok{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(140%);background:var(--brown);color:#fff;border-radius:8px;padding:.6rem 1.1rem;font-size:.9rem;transition:transform .22s ease;z-index:50}
.ok.on{transform:translateX(-50%)}
.rate{display:grid;grid-template-columns:1fr 120px auto;gap:6px;margin-bottom:6px}
@media(max-width:560px){.rate{grid-template-columns:1fr 90px auto}}
.spin{color:var(--ink3);font-size:.9rem;padding:2rem 0;text-align:center}
</style>
</head>
<body>
<header><div class="wrap">
  <h1>Somewhere Nice</h1>
  <nav role="tablist">
    <button role="tab" id="tTraffic" aria-selected="true" aria-controls="pTraffic">Traffic</button>
    <button role="tab" id="tDrivers" aria-selected="false" aria-controls="pDrivers">Drivers</button>
  </nav>
  <span class="who">__WHO__</span>
</div></header>

<main class="wrap">
  <p class="err" id="err" hidden></p>

  <section class="panel" id="pTraffic">
    <div class="row" style="margin-bottom:1rem">
      <h2 class="grow">What guests looked at</h2>
      <select id="range" style="width:auto">
        <option value="7">Last 7 days</option>
        <option value="30" selected>Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>
    <div id="traffic" class="spin">Loading…</div>
  </section>

  <section class="panel" id="pDrivers" hidden>
    <p class="note"><b>These go straight onto the guide.</b> A driver set to
    <i>Ask reception</i> appears with their name, car and routes, but their number is not
    printed on the page at all. Please ask each driver before publishing their number.</p>
    <div class="row" style="margin-bottom:1rem">
      <h2 class="grow">Drivers</h2>
      <button class="btn p" id="add">Add a driver</button>
    </div>
    <div id="drivers" class="spin">Loading…</div>
  </section>
</main>

<div class="ok" id="ok"></div>

<script>
var $ = function (s) { return document.querySelector(s); };
function el(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
  return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function toast(m) { var o = $("#ok"); o.textContent = m; o.classList.add("on");
  setTimeout(function () { o.classList.remove("on"); }, 2200); }
function oops(m) { var e = $("#err"); e.textContent = m; e.hidden = !m; if (m) window.scrollTo(0, 0); }

async function api(path, opts) {
  var r = await fetch(path, Object.assign({ headers: { "content-type": "application/json" } }, opts || {}));
  var t = await r.text();
  var d; try { d = JSON.parse(t); } catch (e) { d = { error: t.slice(0, 200) }; }
  if (!r.ok) throw new Error(d.error || ("Request failed (" + r.status + ")"));
  return d;
}

/* --- tabs --------------------------------------------------------------- */
[["tTraffic", "pTraffic"], ["tDrivers", "pDrivers"]].forEach(function (p) {
  $("#" + p[0]).addEventListener("click", function () {
    [["tTraffic", "pTraffic"], ["tDrivers", "pDrivers"]].forEach(function (q) {
      var on = q[0] === p[0];
      $("#" + q[0]).setAttribute("aria-selected", String(on));
      $("#" + q[1]).hidden = !on;
    });
    if (p[0] === "tDrivers") loadDrivers();
  });
});

/* --- traffic ------------------------------------------------------------ */
var LABELS = { place: "Places opened", route: "Routes opened", interest: "Interests chosen",
               driver: "Driver contacted", section: "Sections reached" };

async function loadTraffic() {
  var host = $("#traffic");
  host.className = "spin"; host.textContent = "Loading…";
  try {
    var d = await api("/admin/api/stats?days=" + $("#range").value);
    host.className = ""; host.textContent = "";
    if (!d.total) {
      host.appendChild(el("div", "card", "<p class=\\"muted\\">Nothing recorded yet. Numbers " +
        "start appearing as guests open the guide.</p>"));
      return;
    }
    var days = d.series.length, best = d.series.reduce(function (m, r) { return Math.max(m, r.n); }, 1);
    var tiles = el("div", "tiles");
    tiles.appendChild(el("div", "tile", "<b>" + d.total.toLocaleString() + "</b><span>visits in " + d.days + " days</span>"));
    tiles.appendChild(el("div", "tile", "<b>" + Math.round(d.total / Math.max(1, days)) + "</b><span>a day on average</span>"));
    tiles.appendChild(el("div", "tile", "<b>" + best + "</b><span>busiest day</span>"));
    host.appendChild(tiles);

    var c = el("div", "card", "<h3>Visits a day</h3>");
    var sp = el("div", "spark");
    d.series.forEach(function (r, i) {
      var b = el("i", i === d.series.length - 1 ? "today" : null);
      b.style.height = Math.max(2, Math.round(r.n / best * 60)) + "px";
      b.title = r.day + ": " + r.n;
      sp.appendChild(b);
    });
    c.appendChild(sp);
    c.appendChild(el("p", "muted", d.series[0].day + " to " + d.series[d.series.length - 1].day));
    host.appendChild(c);

    Object.keys(LABELS).forEach(function (k) {
      var rows = d.by[k];
      if (!rows || !rows.length) return;
      var max = rows[0].n;
      var box = el("div", "card", "<h3>" + LABELS[k] + "</h3>");
      var bars = el("div", "bars");
      rows.forEach(function (r) {
        var b = el("div", "bar",
          '<span class="t"><i style="width:' + Math.round(r.n / max * 100) + '%"></i>' +
          '<span>' + esc(r.k) + '</span></span><span class="n">' + r.n + '</span>');
        bars.appendChild(b);
      });
      box.appendChild(bars);
      host.appendChild(box);
    });
  } catch (e) { host.className = ""; host.textContent = ""; oops(e.message); }
}
$("#range").addEventListener("change", loadTraffic);

/* --- drivers ------------------------------------------------------------ */
var DRIVERS = [];

async function loadDrivers() {
  var host = $("#drivers");
  host.className = "spin"; host.textContent = "Loading…";
  try {
    var d = await api("/admin/api/drivers");
    DRIVERS = d.drivers || [];
    drawDrivers();
  } catch (e) { host.className = ""; host.textContent = ""; oops(e.message); }
}

function drawDrivers() {
  var host = $("#drivers");
  host.className = "dlist"; host.textContent = "";
  if (!DRIVERS.length) {
    host.appendChild(el("div", "card", '<p class="muted">No drivers yet. Press ' +
      '<b>Add a driver</b> and they appear on the guide as soon as you save.</p>'));
    return;
  }
  DRIVERS.forEach(function (d) {
    var card = el("article", "d" + (d.live ? "" : " off"));
    card.innerHTML =
      '<div class="row"><h3 class="grow">' + esc(d.n) + '</h3>' +
        '<span class="pill ' + (d.live ? "live" : "hid") + '">' + (d.live ? "On the guide" : "Hidden") + '</span>' +
        (d.via ? '<span class="pill via">Ask reception</span>' : "") + '</div>' +
      '<p class="meta">' + esc(d.car || "No car listed") +
        (d.via ? "" : (d.ph ? " · " + esc(d.ph) : " · no number")) + '</p>' +
      '<div class="runs">' + d.runs.map(function (r) { return "<span>" + esc(r) + "</span>"; }).join("") + '</div>' +
      (d.updated ? '<p class="meta" style="margin-top:.5rem">Last changed ' + esc(d.updated) + '</p>' : "");
    var row = el("div", "row"); row.style.marginTop = ".8rem";
    var ed = el("button", "btn", "Edit"); ed.addEventListener("click", function () { form(d); });
    var tg = el("button", "btn", d.live ? "Hide from guide" : "Show on guide");
    tg.addEventListener("click", function () {
      d.live = d.live ? 0 : 1;
      put(d, d.live ? "Back on the guide" : "Hidden from the guide");
    });
    var rm = el("button", "btn d", "Delete");
    rm.addEventListener("click", function () {
      if (!confirm("Delete " + d.n + " from the guide? This cannot be undone.")) return;
      api("/admin/api/drivers?id=" + encodeURIComponent(d.id), { method: "DELETE" })
        .then(function () { toast("Deleted"); loadDrivers(); }, function (e) { oops(e.message); });
    });
    row.appendChild(ed); row.appendChild(tg); row.appendChild(rm);
    card.appendChild(row);
    host.appendChild(card);
  });
}

function put(d, msg) {
  api("/admin/api/drivers", { method: "POST", body: JSON.stringify(d) })
    .then(function () { oops(""); toast(msg || "Saved"); loadDrivers(); },
          function (e) { oops(e.message); });
}

$("#add").addEventListener("click", function () { form(null); });

function form(d) {
  d = d || { runs: [], rates: [], star: 2, live: 1, via: false };
  var host = $("#drivers");
  host.className = ""; host.textContent = "";
  var box = el("div", "card");
  box.innerHTML =
    "<h2 style='margin-bottom:1rem'>" + (d.id ? "Edit " + esc(d.n) : "New driver") + "</h2>" +
    '<div class="fields">' +
      f("Name", "n", d.n, "Who to ask for") +
      f("Phone number", "ph", d.ph, "+233 24 123 4567") +
      f("WhatsApp number <span class=\\"opt\\">digits only, blank if none</span>", "wa", d.wa, "233241234567") +
      f("Car", "car", d.car, "Toyota Corolla, air conditioning, 4 seats") +
      f("Where they like going <span class=\\"opt\\">commas between</span>", "runs", (d.runs || []).join(", "), "Airport, Cape Coast, Kumasi", 1) +
      f("Languages", "langs", d.langs, "English, Twi") +
      f("On your list since", "since", d.since, "2019") +
      '<div><label for="fstar">How hard do you vouch?</label><select id="fstar">' +
        [1, 2, 3].map(function (v) {
          return '<option value="' + v + '"' + (Number(d.star || 2) === v ? " selected" : "") + '>' +
                 "★".repeat(v) + " " + ["", "worth knowing", "we recommend", "we insist"][v] + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="wide"><label for="fflex">What are they flexible about?</label>' +
        '<textarea id="fflex" maxlength="900" placeholder="Will wait while you visit a site and take you on. Answers at four in the morning for airport runs.">' +
        esc(d.flex) + "</textarea></div>" +
    "</div>" +
    '<h3 style="margin:1.4rem 0 .5rem">Typical prices</h3>' +
    '<div id="rates"></div>' +
    '<button class="btn" type="button" id="addRate" style="margin-top:.4rem">Add a price</button>' +
    '<div style="margin-top:1.4rem;padding-top:1rem;border-top:1px solid var(--line2)">' +
      '<label><input type="checkbox" id="fvia" style="width:auto;margin-right:.4rem"' +
        (d.via ? " checked" : "") + '>Do not print their number. Guests ask reception for it.</label>' +
      '<label style="margin-top:.5rem"><input type="checkbox" id="flive" style="width:auto;margin-right:.4rem"' +
        (d.live ? " checked" : "") + '>Show on the guide</label>' +
    "</div>" +
    '<div class="row" style="margin-top:1.4rem">' +
      '<button class="btn p" type="button" id="save">Save</button>' +
      '<button class="btn" type="button" id="cancel">Cancel</button></div>';
  host.appendChild(box);

  var rates = (d.rates || []).slice();
  if (!rates.length) rates.push({ w: "", p: "" });
  function drawRates() {
    var r = $("#rates"); r.textContent = "";
    rates.forEach(function (x, i) {
      var row = el("div", "rate");
      var a = el("input"); a.value = x.w || ""; a.placeholder = "Airport pickup"; a.maxLength = 60;
      a.addEventListener("input", function () { rates[i].w = a.value; });
      var b = el("input"); b.value = x.p || ""; b.placeholder = "GH₵ 150"; b.maxLength = 30;
      b.addEventListener("input", function () { rates[i].p = b.value; });
      var c = el("button", "btn d", "×"); c.type = "button";
      c.addEventListener("click", function () { rates.splice(i, 1); if (!rates.length) rates.push({ w: "", p: "" }); drawRates(); });
      row.appendChild(a); row.appendChild(b); row.appendChild(c);
      r.appendChild(row);
    });
  }
  drawRates();
  $("#addRate").addEventListener("click", function () { rates.push({ w: "", p: "" }); drawRates(); });
  $("#cancel").addEventListener("click", function () { oops(""); loadDrivers(); });
  $("#save").addEventListener("click", function () {
    var out = {
      id: d.id, n: $("#fn").value, ph: $("#fph").value, wa: $("#fwa").value,
      car: $("#fcar").value, langs: $("#flangs").value, since: $("#fsince").value,
      star: $("#fstar").value, flex: $("#fflex").value,
      runs: $("#fruns").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
      rates: rates.filter(function (x) { return (x.w || "").trim() || (x.p || "").trim(); }),
      via: $("#fvia").checked, live: $("#flive").checked, pos: d.pos || 0
    };
    if (!out.n.trim()) { oops("A driver needs a name."); return; }
    put(out, d.id ? "Saved" : "Added to the guide");
  });
}

function f(label, id, val, ph, wide) {
  return '<div' + (wide ? ' class="wide"' : "") + '><label for="f' + id + '">' + label + "</label>" +
    '<input id="f' + id + '" value="' + esc(val == null ? "" : val) + '" placeholder="' + esc(ph) + '" maxlength="140"></div>';
}

loadTraffic();
</script>
</body>
</html>`;
