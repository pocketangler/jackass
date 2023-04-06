import { expect } from "@playwright/test";

export default async ({ page, context }, use) => {

    await use({

        async withUsernameAndPassword(username, password) {

            await page.goto("/");
            const storageState = await context.storageState();
            if(!storageState.origins.some(o => o.localStorage.find(x => x.name === "dev-mode")))
            {
                console.log("1234");
                await page.evaluate(() => localStorage.setItem("dev-mode", true));
                console.log("2345");
                console.log(await page.url());
                await page.goto("/");
            }
            await Promise.all([
                page.waitForURL("/login.html"),
                page.getByText("Sign in").click()
            ]);
            while(!await page.locator("form").getByText("Email").inputValue())
                await page.locator("form").getByText("Email").fill(username);
            while(!await page.locator("form").getByText("Password").inputValue())
                await page.locator("form").getByText("Password").fill(password);
            await Promise.all([
                page.waitForURL("/"),
                page.locator("form").getByRole("button", { hasText: "Sign In" }).click().then(() => console.log("signed in"))
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
