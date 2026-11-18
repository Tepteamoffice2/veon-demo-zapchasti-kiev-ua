import { test, expect, type Page } from "@playwright/test";

const H1 = "Нові запчастини для європейських іномарок під замовлення у Києві";
const SECTIONS = ["top", "hero", "order", "range", "sto", "terms", "about", "contacts", "footer"];

async function noHorizontalScroll(page: Page) {
  const { sw, vw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(vw);
}

test("one H1, sections in concept order, lang uk, noindex", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator("h1")).toHaveCount(1);
  expect((await page.locator("h1").innerText()).replace(/\s+/g, " ").trim()).toBe(H1);
  const ids = await page.evaluate((list) => list.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : -1;
  }), SECTIONS);
  for (const y of ids) expect(y).toBeGreaterThanOrEqual(0);
  for (let i = 1; i < ids.length; i++) expect(ids[i]).toBeGreaterThanOrEqual(ids[i - 1]);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld["@type"]).toBe("AutoPartsStore");
});

test("every link is an existing anchor or an allowed channel", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") || ""));
  const ids = await page.$$eval("[id]", (els) => els.map((e) => e.id));
  for (const h of hrefs) {
    expect(h, "no empty links").not.toBe("");
    expect(h).not.toBe("#");
    expect(h).not.toMatch(/^https?:\/\/([\w-]+\.)?zapchasti\.kiev\.ua/i);
    if (h.startsWith("#")) expect(ids, `anchor ${h}`).toContain(h.slice(1));
    else expect(h).toMatch(/^(tel:\+380|viber:\/\/|mailto:email@zapchasti\.kiev\.ua|https:\/\/t\.me\/Zapchasti_Kiev_Ua|https:\/\/www\.facebook\.com\/zapchasti\.kiev\.ua|https:\/\/prom\.ua\/opinions\/list\/65999|https:\/\/www\.google\.com\/maps\/)/);
  }
});

test("anchor navigation scrolls the section under the sticky header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Розділи головної", exact: true }).getByRole("link", { name: "Умови" }).click();
  await expect(page).toHaveURL(/#terms$/);
  await page.waitForTimeout(900);
  const top = await page.locator("#terms").evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(top - 72)).toBeLessThan(6);
});

test("order switcher: three states, keyboard arrows", async ({ page }) => {
  await page.goto("/");
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#panel-nocode")).toHaveClass(/is-active/);
  await expect(page.getByRole("link", { name: "Написати запит на e-mail" })).toHaveAttribute("href", /^mailto:email@zapchasti\.kiev\.ua\?subject=/);
  await tabs.nth(1).press("ArrowRight");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
});

test("future pages are inactive with a note, not links", async ({ page }) => {
  await page.goto("/");
  const future = page.locator(".future-link");
  expect(await future.count()).toBeGreaterThan(30);
  for (const el of await future.all()) {
    await expect(el).toHaveAttribute("aria-disabled", "true");
    expect(await el.evaluate((e) => e.closest("a"))).toBeNull();
  }
  await expect(page.locator(".code-strip__go")).toContainText("Пошук за кодом з'явиться у повній версії сайту");
});

test("mobile: call and messengers on the first screen, menu opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/");
  const call = page.locator("#hero a.btn--primary");
  await expect(call).toBeInViewport();
  await expect(page.locator("#hero .btn-pair").getByRole("link", { name: "Viber" })).toBeInViewport();
  const toggle = page.locator(".menu-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.locator("#mobile-menu").getByRole("link", { name: "Контакти" }).click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#mobile-menu")).toBeHidden();
  await expect(page).toHaveURL(/#contacts$/);
});

test("mobile: action bar appears after the first screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/");
  const bar = page.locator(".action-bar");
  await expect(bar).not.toHaveClass(/is-shown/);
  await page.evaluate(() => document.getElementById("range")?.scrollIntoView());
  await expect(bar).toHaveClass(/is-shown/);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`no horizontal scroll at ${width}px, key buttons inside the screen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await noHorizontalScroll(page);
    for (const sel of [".site-header__inner", "#hero a.btn--primary", ".code-strip__go", ".menu-toggle, .site-nav"]) {
      const box = await page.locator(sel).first().boundingBox();
      if (!box || box.width === 0) continue;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
    }
  });
}

test("content is visible without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  for (const id of ["panel-code", "panel-nocode", "panel-b2b"]) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator("#range-title")).toBeVisible();
  expect(await page.locator("#range-title").evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  await ctx.close();
});

test("reduced motion: headings are in place without animation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const style = await page.locator("#about-title").evaluate((e) => ({ o: getComputedStyle(e).opacity, t: getComputedStyle(e).transform }));
  expect(style.o).toBe("1");
  expect(style.t === "none" || style.t === "matrix(1, 0, 0, 1, 0, 0)").toBeTruthy();
  await ctx.close();
});
