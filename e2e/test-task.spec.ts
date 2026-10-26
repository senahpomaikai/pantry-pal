import { expect, test, type Page } from '@playwright/test';

async function skipIntro(page: Page) {
  await expect(page.getByRole('heading', { name: 'Welcome! This is a rough draft.' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip, take me to the app' }).click();
}

async function saveAndShare(page: Page, recipe: string) {
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Recipes' }).click();
  await page.getByRole('button', { name: new RegExp(recipe) }).click();
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('status')).toHaveText('Saved to Recipes › Saved');
  await page.getByRole('button', { name: 'Share recipe' }).click();
  await page.getByRole('button', { name: 'Maya' }).click();
  await page.getByRole('button', { name: 'Send to 1 friend' }).click();
}

test('variant A: + tab → scan spinach → save and share a spinach recipe', async ({ page }) => {
  await page.goto('./?v=a');
  await skipIntro(page);
  await expect(page.getByRole('button', { name: /Test task: 0 of 3/ })).toBeVisible();

  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Scan an item' }).click();
  await page.getByRole('button', { name: 'Pretend to scan: baby spinach' }).click();
  await page.getByRole('button', { name: 'Add to my pantry' }).click();
  await expect(page.getByRole('status')).toHaveText('Baby spinach added to your pantry');
  await expect(page.getByRole('button', { name: /Test task: 1 of 3/ })).toBeVisible();

  await saveAndShare(page, 'Spinach & Tomato Frittata');
  await expect(page.getByRole('dialog', { name: 'Test task complete!' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await expect(page.getByRole('button', { name: /Test task: 3 of 3/ })).toBeVisible();
});

test('variant B: no + tab; pantry Add → type spinach → save and share a spinach recipe', async ({ page }) => {
  await page.goto('./?v=b');
  await skipIntro(page);
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('button')).toHaveText(['Home', 'Pantry', 'Recipes', 'Me']);

  await nav.getByRole('button', { name: 'Pantry' }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Write a recipe' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Type it in' }).click();
  await page.getByLabel('What is it?').fill('Spinach');
  await page.getByRole('button', { name: 'Add to my pantry' }).click();
  await expect(page.getByRole('status')).toHaveText('Spinach added to your pantry');

  await saveAndShare(page, 'Green Smoothie');
  await expect(page.getByRole('dialog', { name: 'Test task complete!' })).toBeVisible();
});

test('variant sticks for the session after a refresh', async ({ page }) => {
  await page.goto('./?v=b&intro=0');
  await page.goto('./?intro=0');
  await expect(page.locator('html')).toHaveAttribute('data-variant', 'b');
});

test('task=0 hides the test-task layer', async ({ page }) => {
  await page.goto('./?task=0');
  await expect(page.getByText('lo-fi prototype')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Scan groceries' })).toBeVisible();
});

test.describe('desktop laptop (1366x768)', () => {
  test.use({ viewport: { width: 1366, height: 768 }, isMobile: false, hasTouch: false });

  test('the phone frame fits the window and stays clickable', async ({ page }) => {
    await page.goto('./?intro=0');
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
