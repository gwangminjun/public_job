import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.STUDY_TEST_URL ?? 'http://localhost:3002';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const click = async text => {
  await page.waitForFunction(value => [...document.querySelectorAll('button,a,summary')].some(el => el.textContent.trim() === value), {}, text);
  assert.ok(await page.evaluate(value => {
    const element = [...document.querySelectorAll('button,a,summary')].find(el => el.textContent.trim() === value);
    element?.click();
    return !!element;
  }, text), `Missing control: ${text}`);
};
const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow: ${page.url()}`);

try {
  // Missing routes, dropped topic content, premature answers, or broken persistence must fail this test.
  const response = await page.goto(`${base}/study/review`, { waitUntil: 'networkidle0' });
  assert.equal(response.status(), 200, 'Exam review must be available after deployment');
  await page.waitForSelector('[data-topic-id="search"]');
  assert.ok(await page.$('table'), 'Comparison tables must render as tables');
  await page.type('#study-search', '존재하지않는학습주제');
  await page.waitForSelector('[data-empty-results]');
  await click('검색 초기화');
  await click('머신러닝');
  await page.waitForSelector('[data-topic-id="reinforcement"]');
  await page.type('#study-search', 'DQN');
  assert.ok(await page.$('[data-topic-id="reinforcement"]'));
  await click('검색 초기화');

  await page.goto(`${base}/study/recall?subject=algorithm&topic=search`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#recall-answer:not([disabled])');
  assert.equal(await page.$('[data-reference-answer]'), null, 'Answer must start hidden');
  await page.type('#recall-answer', '정렬된 배열에서 탐색 범위를 절반씩 줄인다.');
  await click('답안 확인');
  await page.waitForSelector('[data-reference-answer]');
  await click('다시 공부');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#recall-answer:not([disabled])');
  assert.equal(await page.$eval('#recall-answer', el => el.value), '정렬된 배열에서 탐색 범위를 절반씩 줄인다.');
  assert.equal(await page.$('[data-reference-answer]'), null, 'Reload must hide answer again');
  await click('답안 확인');
  await click('원문 참고');
  await page.waitForSelector('[data-source-content]');
  await page.waitForFunction(() => document.querySelector('[data-source-content]')?.textContent.includes('순차 탐색'));
  assert.ok(await page.$eval('[data-source-content]', el => el.textContent.includes('순차 탐색')));
  await click('다음 주제');
  await page.waitForFunction(() => !location.search.includes('topic=search'));
  assert.equal(await page.$('[data-reference-answer]'), null, 'Next topic must hide its answer');
  assert.equal(await page.$eval('#recall-answer', el => el.value), '', 'Drafts must be isolated by topic');
  await page.goBack({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#recall-answer:not([disabled])');
  assert.equal(await page.$eval('#recall-answer', el => el.value), '정렬된 배열에서 탐색 범위를 절반씩 줄인다.');

  await click('다음 주제');
  await page.waitForSelector('[data-topic-id="balanced-hash"]');
  await click('답안 확인');
  await click('다시 공부');
  await click('이전 주제');
  await page.waitForSelector('[data-topic-id="search"]');
  await page.click('input[type="checkbox"]');
  await page.click('nav[aria-label="백지 공부 주제"] a[href*="balanced-hash"]');
  await page.waitForSelector('[data-topic-id="balanced-hash"]');
  assert.equal(await page.$eval('input[type="checkbox"]', el => el.checked), true, 'Review filter must persist when changing topics');
  assert.equal(await page.$$eval('nav[aria-label="백지 공부 주제"] a', items => items.length), 2);
  assert.equal(await page.$('nav[aria-label="주제 이동"] a[href*="greedy"]'), null, 'Filtered navigation must not jump to unmarked topics');

  await mkdir('.study-check', { recursive: true });
  for (const width of [320, 390, 1280]) {
    await page.setViewport({ width, height: 900 });
    for (const route of ['review', 'recall']) {
      await page.goto(`${base}/study/${route}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('[data-study-screen]');
      await noOverflow();
      await page.screenshot({ path: `.study-check/${route}-${width}.png`, fullPage: false });
    }
  }
  await page.goto(`${base}/study/recall?subject=invalid&topic=invalid`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#recall-answer:not([disabled])');
  assert.ok(await page.$('[data-topic-id="search"]'), 'Invalid query must fall back safely');
  await page.evaluate(() => localStorage.setItem('study-recall-v1', '{invalid'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#recall-answer:not([disabled])');
  await page.type('#recall-answer', '손상된 저장값 이후에도 공부 계속');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#recall-answer:not([disabled])');
  assert.equal(await page.$eval('#recall-answer', el => el.value), '손상된 저장값 이후에도 공부 계속');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
  await page.type('#recall-answer', ' 저장 실패');
  await page.waitForFunction(() => document.body.innerText.includes('저장 불가'));
  assert.ok(await page.$eval('#recall-answer', el => el.value.endsWith('저장 실패')), 'Storage failure must preserve the current draft');
  const missingSource = await fetch(`${base}/api/study/notes/not-a-topic`);
  assert.equal(missingSource.status, 404);
  await page.goto(base, { waitUntil: 'networkidle0' });
  assert.ok(await page.$('a[href="/study/review"]'), 'Hub must link to exam review');
  assert.ok(await page.$('a[href="/study/recall"]'), 'Hub must link to recall practice');
  assert.deepEqual(errors, []);
  console.log('PASS: hub links, review/search/subjects, hidden answers, topic isolation, save/reload/back, original notes, invalid query, 3 responsive widths. Screenshots: .study-check/');
} finally {
  await browser.close();
}
