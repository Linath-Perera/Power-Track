const { test, expect } = require("@playwright/test");
test("offline manager flows, validation, persistence, filters, and details", async ({
  page,
  context,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto("/");
  await expect(
    page.getByText("Energy in perspective.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("7", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Appliances" }).click();
  await page
    .getByRole("button", { name: "Add appliance", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save appliance", exact: true })
    .click();
  await expect(
    page.getByText("Enter an appliance name.", { exact: true }),
  ).toBeVisible();
  let inputs = page.getByRole("textbox");
  await inputs.nth(0).fill("Study Lamp");
  await inputs.nth(1).fill("20");
  await inputs.nth(2).fill("5");
  await page.getByRole("button", { name: "Lighting", exact: true }).click();
  await page
    .getByRole("button", { name: "Save appliance", exact: true })
    .click();
  await expect(page.getByText("Study Lamp", { exact: true })).toBeVisible();
  await page.getByRole("textbox").fill("study");
  await expect(page.getByText("Study Lamp", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Ceiling Fan", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Kitchen", exact: true }).click();
  await expect(
    page.getByText("No appliances found", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByText("Study Lamp", { exact: true }).click();
  await expect(page.getByText("3 kWh", { exact: true }).last()).toBeVisible();
  await page
    .getByRole("button", { name: "Edit appliance", exact: true })
    .click();
  await page.getByRole("textbox").nth(1).fill("40");
  await page
    .getByRole("button", { name: "Save appliance", exact: true })
    .click();
  await expect(page.getByText("6 kWh", { exact: true }).last()).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Energy in perspective.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("8", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Record meter reading", exact: true })
    .click();
  inputs = page.getByRole("textbox");
  await inputs.nth(0).fill("2024-02-30");
  await inputs.nth(1).fill("9000");
  await page.getByRole("button", { name: "Save reading", exact: true }).click();
  await expect(page.getByText(/Use a valid reading date/)).toBeVisible();
  // Today's date may be the demo baseline on the first of a month; choose yesterday and a compatible value.
  const now = new Date();
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.min(now.getDate(), 2),
  );
  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
  if (now.getDate() > 1) {
    await inputs.nth(0).fill(date);
    await inputs.nth(1).fill("8700");
    await page
      .getByRole("button", { name: "Save reading", exact: true })
      .click();
  } else {
    await page.getByRole("button", { name: /back/i }).first().click();
  }
  await page
    .getByRole("button", { name: "Calculate bill", exact: true })
    .click();
  await page.getByRole("textbox").first().fill("65");
  await page
    .getByRole("button", { name: "Calculate estimate", exact: true })
    .click();
  await expect(
    page.getByText("Rs. 950.00", { exact: true }).last(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save calculation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View saved calculations", exact: true })
    .click();
  await page.getByText("Rs. 950.00", { exact: true }).last().click();
  await expect(
    page.getByText("Saved tariff snapshot", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(
    page.getByText("Rs. 950.00", { exact: true }).last(),
  ).not.toBeVisible();
  // Return to the root so all tab routes can be verified.
  await page.reload();
  await page.getByRole("tab", { name: "Analytics" }).click();
  await expect(
    page.getByText("Understand your energy", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("textbox").fill("0");
  await page.getByRole("button", { name: "Save budget", exact: true }).click();
  await expect(page.getByText(/Monthly budget must be a number/)).toBeVisible();
  await page.getByRole("textbox").fill("100");
  await page.getByRole("button", { name: "Save budget", exact: true }).click();
  await expect(
    page.getByText(/Budget reached or exceeded/).last(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page
    .getByRole("button", { name: "Configure electricity tariffs", exact: true })
    .click();
  await expect(
    page.getByText("Your tariff, your estimate", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox").nth(2).fill("10");
  await page
    .getByRole("button", { name: "Save tariff configuration", exact: true })
    .click();
  await page.reload();
  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(
    page.getByRole("button", { name: "Light", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "Appliances" }).click();
  await page.getByRole("textbox").fill("Study Lamp");
  await page.getByText("Study Lamp", { exact: true }).click();
  await page
    .getByRole("button", { name: "Delete appliance", exact: true })
    .click();
  await expect(page.getByText("Study Lamp", { exact: true })).not.toBeVisible();
  // With the bundle loaded, disabling networking must not prevent local edits or calculations.
  await page.getByRole("textbox").fill("");
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Add appliance", exact: true })
    .click();
  inputs = page.getByRole("textbox");
  await inputs.nth(0).fill("Offline Fan");
  await inputs.nth(1).fill("50");
  await inputs.nth(2).fill("2");
  await page
    .getByRole("button", { name: "Save appliance", exact: true })
    .click();
  await expect(page.getByText("Offline Fan", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/appliances.png",
    fullPage: true,
  });
  await context.setOffline(false);
  await page.reload();
  await page.getByRole("tab", { name: "Appliances" }).click();
  await expect(page.getByText("Offline Fan", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("meter edits, deletion, reset confirmation, and empty appliance states", async ({
  page,
}) => {
  page.on("dialog", (d) => d.accept());
  await page.goto("/");
  await expect(
    page.getByText("Energy in perspective.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard.png", fullPage: true });
  await page.getByRole("tab", { name: "Meter" }).click();
  await page.getByText("8,685 kWh", { exact: true }).last().click();
  await page.getByRole("button", { name: "Edit reading", exact: true }).click();
  await page.getByRole("textbox").nth(1).fill("8400");
  await page.getByRole("button", { name: "Save reading", exact: true }).click();
  await expect(
    page.getByText(/Readings must increase over time/),
  ).toBeVisible();
  await page.getByRole("textbox").nth(1).fill("9000");
  await page.getByRole("button", { name: "Save reading", exact: true }).click();
  await expect(
    page.getByText("9,000 kWh", { exact: true }).last(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(page.getByText("9,000 kWh", { exact: true })).not.toBeVisible();
  await page.getByRole("tab", { name: "Appliances" }).click();
  for (const name of [
    "Ceiling Fan",
    "Television",
    "Refrigerator",
    "LED Bulb",
    "Rice Cooker",
    "Washing Machine",
    "Air Conditioner",
  ]) {
    await page.getByText(name, { exact: true }).last().click();
    await page
      .getByRole("button", { name: "Delete appliance", exact: true })
      .click();
  }
  await expect(
    page.getByText("No appliances found", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Analytics" }).click();
  await expect(
    page.getByText("No appliance estimates", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page
    .getByRole("button", { name: "Reset demonstration data", exact: true })
    .click();
  await page.getByRole("tab", { name: "Appliances" }).click();
  await expect(page.getByText("Ceiling Fan", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("7", { exact: true })).toBeVisible();
});
