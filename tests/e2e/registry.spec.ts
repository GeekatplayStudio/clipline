import { expect, test } from '@playwright/test';

test('loads the production registry and supports role navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('upbound');
  await page.getByLabel('Password', { exact: true }).fill('rmf2026');
  await page.getByRole('button', { name: 'Sign in securely' }).click();
  await expect(page.getByRole('heading', { name: 'AI Workflow Registry' })).toBeVisible();
  await expect(page.getByText('Prototype', { exact: true })).toBeVisible();

  const lobTab = page.getByRole('button', { name: 'LOB Exposure Bars' });
  const networkTab = page.getByRole('button', { name: '3D Organizational Web' });
  const exportButton = page.getByRole('button', { name: 'Export Report' }).last();
  await expect(lobTab).toBeVisible();
  await expect(networkTab).toBeVisible();
  expect(
    await lobTab.evaluate(
      (node, other) => Boolean(node.compareDocumentPosition(other) & 4),
      await networkTab.elementHandle()
    )
  ).toBe(true);
  expect(
    await networkTab.evaluate(
      (node, other) => Boolean(node.compareDocumentPosition(other) & 4),
      await exportButton.elementHandle()
    )
  ).toBe(true);
  await networkTab.click();
  await expect(page.getByRole('heading', { name: '3D Organizational Risk Web' })).toBeVisible();

  const roleSwitcher = page.getByLabel('View as role');
  await roleSwitcher.selectOption('executive');
  await expect(roleSwitcher).toHaveValue('executive');
  await expect(page.locator('#root')).not.toBeEmpty();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'AI Workflow Registry' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
