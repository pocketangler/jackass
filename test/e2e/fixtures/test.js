import base, { expect } from "@playwright/test";

export const test = base.extend({

    login: async ({ page, context }, use) => {

        await use({

            async withUsernameAndPassword(username, password) {

                await page.goto("/");
                const storageState = await context.storageState();
                if(!storageState.origins.some(o => o.localStorage.find(x => x.name === "dev-mode")))
                {
                    await page.evaluate(() => localStorage.setItem("dev-mode", true));
                    await page.reload();
                }
                await page.getByText("Sign in").click();
                await page.locator("form").getByText("Email").fill(username);
                await page.locator("form").getByText("Password").fill(password);
                await Promise.all([
                    page.waitForURL("/"),
                    page.locator("form").getByText("Sign In").click()
                ]);

            },

            async expectSignedInAs(name) {

                await page.waitForSelector("body.authenticated");
                await expect(page.locator("aside .username")).toContainText(name);
                await expect(page.locator("aside button", { hasText: "Sign out"})).toBeVisible();

            },

            async signOut() {

                await page.click("button", { hasText: "Sign out" });

            },

            async expectSignedOut() {


                await page.waitForSelector("body.authentication-initialised:not(.authenticated)");
                await expect(page.locator("aside button", { hasText: "Sign in" })).toBeVisible();

            }

        });

    }

});
