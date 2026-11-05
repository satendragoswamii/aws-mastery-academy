import { expect, test, type Page } from "@playwright/test";

const LESSON = "what-is-cloud-computing";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("e2e");
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
}

test.describe.configure({ mode: "serial" });

test("signed-out visitors are sent to the login page", async ({ page }) => {
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/login$/);
});

test("a new learner starts at lesson 1 with honest zero progress", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText("What is cloud computing?").first()).toBeVisible();
  await expect(page.getByText("0 / ")).toBeVisible(); // nothing mastered
  await expect(page.getByText("No assessments taken yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Start learning" })).toBeVisible();
});

test("learning a lesson section by section and resuming exactly there", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Start learning" }).click();
  await expect(page).toHaveURL(new RegExp(`/learn/${LESSON}$`));
  await page.getByRole("link", { name: "Start lesson" }).click();

  await expect(page).toHaveURL(new RegExp(`/learn/${LESSON}/what$`));
  await expect(page.getByRole("heading", { name: "The simple version" })).toBeVisible();

  await page.getByRole("link", { name: /Next.*B\. Why does it exist\?/ }).click();
  await expect(page).toHaveURL(new RegExp(`/learn/${LESSON}/why$`));
  await expect(page.getByRole("heading", { name: "The problem the cloud solves" })).toBeVisible();

  // Progress is saved after render; poll the dashboard until it shows the resume point.
  await expect(async () => {
    await page.goto("/");
    await expect(page.getByText("You stopped at B. Why does it exist?")).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByText("1 day streak")).toBeVisible(); // streak
  await expect(page.getByText("0 / ")).toBeVisible(); // reading is not mastery

  await page.getByRole("link", { name: "Resume where I stopped" }).click();
  await expect(page).toHaveURL(new RegExp(`/learn/${LESSON}/why$`));
});

test("the curriculum shows status and planned lessons can't be opened", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Curriculum", exact: true }).click();
  const row = page.getByRole("listitem").filter({ hasText: "What is cloud computing?" });
  await expect(row.getByText("In progress")).toBeVisible();
  // A planned (not yet written) lesson is listed but not linked. Uses the last curriculum lesson,
  // which is written last; update this when the whole curriculum is complete.
  await expect(page.getByRole("link", { name: "Cost Explorer, Budgets and the Pricing Calculator" })).toHaveCount(0);
  // The not-found UI renders. The HTTP status stays 200 because the layout has already
  // started streaming (documented Next.js behaviour); the page gets robots=noindex.
  await page.goto("/learn/cost-management");
  await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible();
  await page.goto(`/learn/${LESSON}/not-a-section`);
  await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible();
});

test("bookmarks: add on a section, see it on the notes page, remove it", async ({ page }) => {
  await signIn(page);
  await page.goto(`/learn/${LESSON}/cli`);
  await page.getByRole("button", { name: "Bookmark this section" }).click();
  await expect(page.getByRole("button", { name: "Bookmarked", exact: true })).toBeVisible();

  await page.goto("/notes");
  await expect(page.getByRole("link", { name: "What is cloud computing?" }).last()).toBeVisible();
  await expect(page.getByText("H. AWS CLI commands")).toBeVisible();

  await page.goto(`/learn/${LESSON}/cli`);
  await page.getByRole("button", { name: "Bookmarked", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bookmark this section" })).toBeVisible();
});

test("notes: write, edit, keep text on a rejected save, delete", async ({ page }) => {
  await signIn(page);
  await page.goto(`/learn/${LESSON}/what`);

  await page.getByLabel("New note").fill("Cloud = renting, not owning.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Cloud = renting, not owning.")).toBeVisible();
  await expect(page.getByLabel("New note")).toHaveValue(""); // cleared after success

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Edit note").fill("Cloud = renting compute on demand.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Cloud = renting compute on demand.")).toBeVisible();

  // Over the 10,000-character limit: error shown, text NOT lost.
  const long = "x".repeat(10_050);
  await page.getByLabel("New note").fill(long);
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Notes can be at most 10000" })).toBeVisible();
  await expect(page.getByLabel("New note")).toHaveValue(long);

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Cloud = renting compute on demand.")).toHaveCount(0);
});

test("self-check requires your own answer before the model answer", async ({ page }) => {
  await signIn(page);
  await page.goto(`/learn/${LESSON}/check`);
  const compare = page.getByRole("button", { name: "Compare with model answer" }).first();
  await expect(compare).toBeDisabled();

  await page.getByRole("button", { name: "Give me a hint" }).first().click();
  await expect(page.getByText(/Hint 1:/).first()).toBeVisible();

  await page.getByLabel("Your answer, in your own words").first().fill("Elasticity, because they scale up for the sale.");
  await expect(compare).toBeEnabled();
  await compare.click();
  await expect(page.getByText("Model answer").first()).toBeVisible();
});

test("sign out ends the session", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
