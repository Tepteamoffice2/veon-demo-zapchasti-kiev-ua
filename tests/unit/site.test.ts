import { test } from "node:test";
import assert from "node:assert/strict";
import { phones, viber, telegram, mailRequest, email, nav, address, facebook, promReviews } from "../../src/data/site.ts";

test("phones are real tel: links in international format", () => {
  assert.equal(phones.length, 4);
  for (const p of phones) {
    assert.match(p.href, /^tel:\+380\d{9}$/);
    const local = p.display.replace(/\D/g, "");
    assert.equal(p.href.slice(-10), local, `${p.display} matches its link`);
  }
});

test("messengers point to the client's channels", () => {
  assert.equal(viber.href, "viber://chat?number=%2B380992008599");
  assert.equal(telegram.href, "https://t.me/Zapchasti_Kiev_Ua");
});

test("e-mail request is a mailto with a subject and a template body", () => {
  assert.ok(mailRequest.startsWith(`mailto:${email}?subject=`));
  const body = decodeURIComponent(mailRequest.split("&body=")[1]);
  assert.match(body, /Марка і модель/);
  assert.match(body, /VIN/);
});

test("navigation has the six anchors of the homepage in order", () => {
  assert.deepEqual(nav.map((n) => n.id), ["order", "range", "sto", "terms", "about", "contacts"]);
});

test("external links never lead to the current site", () => {
  for (const url of [address.map, facebook, promReviews, telegram.href]) {
    assert.doesNotMatch(new URL(url).hostname, /(^|\.)zapchasti\.kiev\.ua$/);
  }
});
