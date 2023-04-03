import base from "@playwright/test";

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
                await page.locator("form").getByText("Sign In").click();
                
            },

            async expectSignedInAs(name) {

                await page.waitForSelector("body.authenticated");
                await base
                    .expect(page.locator("aside .username"))
                    .toContainText(name);

            }

        });

    }

});
