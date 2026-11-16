const { test, expect } = require("@playwright/test");

test("configured tariff calculation, history searching, month filtering, and sorting", async ({
  page,
}) => {
  page.on("dialog", (d) => d.accept());
  await page.goto("/");
  await page
    .getByRole("button", { name: "Calculate bill", exact: true })
    .click();
  await page.getByRole("textbox").first().fill("65");
  await page
    .getByRole("button", { name: "Calculate estimate", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save calculation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Configure tariffs", exact: true })
    .click();
  await page.getByRole("textbox").nth(2).fill("10");
  await page
    .getByRole("button", { name: "Save tariff configuration", exact: true })
    .click();
  // The displayed and saved result retains its original tariff until recalculated.
  await expect(
    page.getByText("Rs. 950.00", { exact: true }).last(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Calculate estimate", exact: true })
    .click();
  await expect(
    page.getByText("Rs. 1,010.00", { exact: true }).last(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save calculation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View saved calculations", exact: true })
    .click();
  await page.getByRole("textbox").fill("1010");
  await expect(
    page.getByText("1 matching records", { exact: true }),
  ).toBeVisible();
  await page.getByText("Rs. 1,010.00", { exact: true }).last().click();
  await expect(page.getByText("Rs. 10.00/kWh", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(
    page.getByText("No matching records", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox").fill("950");
  await expect(
    page.getByText("Rs. 950.00", { exact: true }).last(),
  ).toBeVisible();
  await page.getByRole("textbox").fill("");
  const now = new Date(),
    month = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
    ].join("-");
  await page.getByRole("button", { name: month, exact: true }).click();
  // Current month has a demonstration bill and the original saved 65-unit estimate.
  await expect(
    page.getByText("2 matching records", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All months", exact: true }).click();
  await page.getByRole("button", { name: "All records", exact: true }).click();
  await page.getByRole("textbox").fill("demo-meter");
  await expect(
    page.getByText("4 matching records", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Bill estimates", exact: true })
    .click();
  await expect(
    page.getByText("No matching records", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All records", exact: true }).click();
  await page.getByRole("textbox").fill("");
  await page.getByRole("button", { name: "Oldest", exact: true }).click();
  await expect(
    page.getByRole("button").filter({ hasText: "ID: demo-" }).first(),
  ).toContainText("demo-meter-0");
});
