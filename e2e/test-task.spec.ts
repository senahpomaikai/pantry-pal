import { expect, test, type Page } from '@playwright/test';

const A = './A/';
const B = './B/';

async function finishSetup(page: Page) {
  await page.getByRole('button', { name: 'Go to my pantry' }).click();
  await expect(page.getByRole('heading', { name: 'Set up your household' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Scan groceries' })).toBeAttached(); // Home stays underneath
  await expect(page.getByText('My pantry')).toHaveCount(0);
  await page.getByRole('button', { name: '4', exact: true }).click();
  await page.getByRole('button', { name: 'Vegetarian' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Set up your household' })).toHaveCount(0);
}

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

/** Task 1: type the groceries in, using suggestions. */
async function addGroceries(page: Page) {
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Type it in' }).click();
  for (const [typed, food] of [['milk', 'Milk'], ['yog', 'Yogurt'], ['straw', 'Strawberries'], ['ground', 'Ground beef'], ['bre', 'Bread']]) {
    await page.getByLabel('What is it?').fill(typed);
    await page.getByRole('option', { name: new RegExp(food) }).click();
    await page.getByRole('button', { name: 'Add to my pantry' }).click();
    await expect(page.getByRole('status')).toHaveText(food + ' added to your pantry');
  }
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText('My pantry')).toBeVisible();
}

/** Task 2: cook a spinach recipe from Home and update the pantry. */
async function cookFrittata(page: Page) {
  await nav(page).getByRole('button', { name: 'Home' }).click();
  await page.getByRole('button', { name: 'Cook what’s expiring' }).click();
  await page.getByRole('button', { name: /Spinach & Tomato Frittata/ }).click();
  await page.getByRole('button', { name: /Start cooking/ }).click();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /^(Next step|I’m done cooking)/ }).click();
  await expect(page.getByText('What did you use up?')).toBeVisible();
}

for (const [name, url, showsCard] of [['control', A, false], ['impact message', B, true]] as const) {
  test(`${name}: Task 1, then Task 2`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveURL(/\/[AB]\/$/);
    // A marker that a reload would wipe, and the Back history, to prove the URL changes in place.
    await page.evaluate(() => { (window as unknown as { marker: number }).marker = 1; });
    const history = await page.evaluate(() => window.history.length);
    await finishSetup(page);
    await expect(page).toHaveURL(/\?task=1-1$/);

    // Both versions share the same layout.
    await expect(nav(page).getByRole('button')).toHaveText(['Home', 'Pantry', 'Add', 'Recipes', 'Me']);

    await addGroceries(page);
    await expect(page).toHaveURL(/\?task=1-2$/);
    await expect(page.getByRole('dialog')).toHaveCount(0); // adding food never shows the card

    await cookFrittata(page);
    await expect(page).toHaveURL(/\?task=1-2$/);
    await page.getByRole('button', { name: 'Update my pantry' }).click();
    await expect(page).toHaveURL(/\?task=2$/);
    expect(await page.evaluate(() => [(window as unknown as { marker: number }).marker, window.history.length])).toEqual([1, history]);

    const card = page.getByRole('dialog', { name: 'Your impact' });
    if (showsCard) {
      await expect(card).toHaveText(/You saved ~\$2 and 0\.5 lbs of food from going to the landfill/);
      await page.waitForTimeout(3000); // outlasts the 2.6s pop-ups
      await expect(card).toBeVisible();
      await page.getByRole('button', { name: 'Done' }).click();
      await expect(card).toHaveCount(0);
    } else {
      await expect(page.getByRole('status')).toHaveText(/Pantry updated/);
      await expect(card).toHaveCount(0);
    }
  });
}

test('impact message: skipping the pantry update shows nothing', async ({ page }) => {
  await page.goto(B + '?intro=0');
  await cookFrittata(page);
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('impact message: "I used it" on food at risk shows the card, "I tossed it" does not', async ({ page }) => {
  await page.goto(B + '?intro=0');
  await nav(page).getByRole('button', { name: 'Pantry' }).click();
  await page.getByRole('button', { name: /Spinach/ }).click();
  await page.getByRole('button', { name: 'I used it' }).click();
  await expect(page.getByRole('dialog', { name: 'Your impact' })).toHaveText(/You saved/);
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: /Chicken thighs/ }).click();
  await page.getByRole('button', { name: 'I tossed it' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('suggestions cap at three, and Where moves the days', async ({ page }) => {
  await page.goto(A + '?intro=0');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Type it in' }).click();
  await page.getByLabel('What is it?').fill('ch');
  await expect(page.getByRole('option')).toHaveCount(3);
  await page.getByLabel('What is it?').fill('ground');
  await page.getByRole('option', { name: /Ground beef/ }).click();
  await expect(page.getByRole('option')).toHaveCount(0);
  await expect(page.getByLabel('How much? (optional)')).toHaveValue('1 lb');
  await expect(page.getByRole('group', { name: 'Good for about' }).getByRole('button', { name: '2 days' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Where?' }).getByRole('button', { name: 'Freezer' }).click();
  await expect(page.getByRole('group', { name: 'Good for about' }).getByRole('button', { name: '4 months' })).toHaveAttribute('aria-pressed', 'true');
});

test('the scanner walks through the groceries', async ({ page }) => {
  await page.goto(A + '?intro=0');
  await page.getByRole('button', { name: 'Scan groceries' }).click();
  await page.getByRole('button', { name: 'Pretend to scan: milk' }).click();
  await page.getByRole('button', { name: 'Add to my pantry' }).click();
  await expect(page.getByRole('status')).toHaveText('Milk added to your pantry');
  await page.getByRole('button', { name: 'Pretend to scan: yogurt' }).click();
  await expect(page.getByText('We found')).toBeVisible();
  await page.getByRole('button', { name: 'Add to my pantry' }).click();
  await page.getByRole('button', { name: 'Close scanner' }).click();
  await expect(page.getByText('My pantry')).toBeVisible();
});

test('setup can be skipped, and the welcome screen stays gone', async ({ page }) => {
  await page.goto(A);
  await page.getByRole('button', { name: 'Go to my pantry' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Go to my pantry' })).toHaveCount(0);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the card shows the full numbers straight away', async ({ page }) => {
    await page.goto(B + '?intro=0');
    await nav(page).getByRole('button', { name: 'Pantry' }).click();
    await page.getByRole('button', { name: /Spinach/ }).click();
    await page.getByRole('button', { name: 'I used it' }).click();
    await expect(page.getByRole('dialog', { name: 'Your impact' }).locator('.impact-text')).toHaveText(/You saved ~\$\d/);
    const moving = await page.evaluate(() => document.getAnimations().length);
    expect(moving).toBe(0);
  });
});

test('the homepage offers both versions', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /Version B/ }).click();
  await expect(page).toHaveURL(/\/pantry-pal\/B\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'b');
  await page.goto('./');
  await page.getByRole('link', { name: /Version A/ }).click();
  await expect(page).toHaveURL(/\/pantry-pal\/A\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'a');
});

test('the task stays in step with the app, keeping other values', async ({ page }) => {
  await page.goto(A + '?intro=0&task=2'); // a stale value from a reload is reset
  await expect(page).toHaveURL(/\/A\/\?intro=0&task=1-1$/);
});

test('?v= cannot switch a build', async ({ page }) => {
  await page.goto(A + '?v=b');
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'a');
});

test.describe('desktop laptop (1366x768)', () => {
  test.use({ viewport: { width: 1366, height: 768 }, isMobile: false, hasTouch: false });

  test('the phone frame fits the window and stays clickable', async ({ page }) => {
    await page.goto(A + '?intro=0');
    const box = (await page.locator('.frame').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(768);
    expect(box.height / box.width).toBeCloseTo(844 / 390, 1);
    const scroll = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
    expect(scroll).toEqual([1366, 768]);
    await page.getByRole('button', { name: 'Scan groceries' }).click();
    await expect(page.getByText('Scan an item')).toBeVisible();
  });
});
