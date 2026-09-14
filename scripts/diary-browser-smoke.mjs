import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.DIARY_TEST_URL ?? 'http://localhost:3001';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const today = new Date();
const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const entries = ['A', 'B'].map((author, i) => ({ id: `00000000-0000-4000-8000-00000000000${i}`, author, authorName: author === 'A' ? '민준' : '서연', entryDate: date, mood: i ? '😊' : '🥰', content: i ? '함께 걸었던 길과 따뜻한 저녁을 오래 기억하고 싶다.' : '오늘은 함께 산책하고 커피를 마셨다. 평범하지만 소중한 하루였다.', photoUrls: [], photoPaths: [], createdAt: '2026-09-14T10:00:00.000Z', updatedAt: '2026-09-14T10:00:00.000Z', comments: [] }));
let draft = null;
const writes = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.setRequestInterception(true);
page.on('request', async (request) => {
  const url = new URL(request.url());
  if (!url.pathname.startsWith('/api/diary')) return request.continue();
  const method = request.method();
  let body;
  if (url.pathname === '/api/diary/me') body = { author: 'A', authorName: '민준', authors: [{ id: 'A', name: '민준' }, { id: 'B', name: '서연' }] };
  else if (url.pathname === '/api/diary/draft') {
    if (method === 'PUT') { const input = JSON.parse(request.postData()); writes.push(input); draft = { author: 'A', entry_date: input.entryDate, mood: input.mood, content: input.content, version: crypto.randomUUID(), updated_at: new Date().toISOString() }; }
    if (method === 'DELETE') draft = null;
    body = { draft };
  } else if (url.pathname === '/api/diary/calendar') body = { days: [{ date, count: 2, entries: entries.map((entry) => ({ ...entry, excerpt: entry.content })) }], summary: { entries: 2, days: 1, moods: { '🥰': 1, '😊': 1 } } };
  else if (url.pathname === '/api/diary/dashboard') body = { month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`, authors: [{ author: 'A', authorName: '민준', entries: 1, days: 1, favoriteMood: '🥰' }, { author: 'B', authorName: '서연', entries: 1, days: 1, favoriteMood: '😴' }] };
  else if (url.pathname === '/api/diary/entries') body = method === 'GET' ? { entries: url.searchParams.get('q') === '없는검색어' ? [] : entries, nextCursor: null } : { entry: entries[0] };
  else body = entries.find((entry) => url.pathname.includes(entry.id)) ?? {};
  await request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
});
const overflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `horizontal overflow: ${page.url()}`);
const clickText = async (text) => { const clicked = await page.evaluate((value) => { const element = [...document.querySelectorAll('button,a')].find((item) => item.textContent.trim() === value); element?.click(); return !!element; }, text); assert.ok(clicked, `missing ${text}`); };
try {
  await mkdir('.diary-check', { recursive: true });
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewport({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.goto(`${base}/diary`, { waitUntil: 'networkidle0' });
      await page.evaluate((value) => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
      await page.waitForSelector('#diary-search');
      assert.ok(await page.$('#author-diaries'));
      assert.equal(await page.$$eval('.diary-author-column', (items) => items.length), 2);
      assert.ok(await page.$('button[aria-label="카카오톡으로 일기장 공유"]'));
      assert.ok(await page.$('button[aria-label="일기장 로그아웃"]'));
      await overflow();
      await page.screenshot({ path: `.diary-check/list-${width}-${theme}.png`, fullPage: true });
      await page.goto(`${base}/diary/calendar`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('#selected-day');
      assert.equal(await page.$$eval('a[href^="/diary/00000000"]', (items) => items.length), 2);
      await page.evaluate((value) => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
      await overflow();
      await page.screenshot({ path: `.diary-check/calendar-${width}-${theme}.png`, fullPage: true });
    }
  }
  await page.goto(`${base}/diary`, { waitUntil: 'networkidle0' });
  await page.type('#diary-search', '없는검색어');
  await clickText('검색');
  await page.waitForFunction(() => location.search.includes('q='));
  await page.waitForFunction(() => document.body.innerText.includes('조건에 맞는 일기가 없어요'));
  await page.goBack({ waitUntil: 'networkidle0' });
  assert.equal(await page.$eval('#diary-search', (input) => input.value), '');
  await page.goto(`${base}/diary/${entries[1].id}`, { waitUntil: 'networkidle0' });
  assert.equal(await page.$$eval('a[href$="/edit"]', (items) => items.length), 0);
  await page.goto(`${base}/diary/${entries[0].id}/edit`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#entry-content');
  assert.equal(await page.$eval('#entry-content', (input) => input.value), entries[0].content);
  await page.setViewport({ width: 375, height: 900 });
  await overflow();
  await page.screenshot({ path: '.diary-check/edit-mobile.png', fullPage: true });
  await page.goto(`${base}/diary/write`, { waitUntil: 'networkidle0' });
  await page.type('#entry-content', '자동 저장 확인용 일기');
  await page.waitForFunction(() => document.body.innerText.includes('임시 저장됨'), { timeout: 10000 });
  assert.equal(writes.at(-1).content, '자동 저장 확인용 일기');
  assert.equal(writes.at(-1).version, null);
  await page.reload({ waitUntil: 'networkidle0' });
  await clickText('이어서 쓰기');
  assert.equal(await page.$eval('#entry-content', (input) => input.value), '자동 저장 확인용 일기');
  await overflow();
  await page.screenshot({ path: '.diary-check/write-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: 4 widths × 2 themes, list/calendar overflow, search/back, ownership, edit hydration, server draft save/restore. Screenshots: .diary-check/');
} finally { await browser.close(); }
