import { expect, test } from '@playwright/test';

test('loads the production registry and supports role navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Workflow Registry' })).toBeVisible();
  await expect(page.getByText('Prototype', { exact: true })).toBeVisible();

  const roleSwitcher = page.getByLabel('View as role');
  await roleSwitcher.selectOption('executive');
  await expect(roleSwitcher).toHaveValue('executive');
  await expect(page.locator('#root')).not.toBeEmpty();
});
