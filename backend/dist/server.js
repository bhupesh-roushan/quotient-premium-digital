"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const db_1 = require("./db");
async function main() {
    await (0, db_1.connectMongo)();
    const app = (0, app_1.createApp)();
    app.listen(process.env.PORT, () => {
        console.log("api is now running");
    });
}
main().catch((err) => {
    console.error("boot failed", err);
    process.exit(1);
});
