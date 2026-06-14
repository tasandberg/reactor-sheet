/**
 * This is a dev-only entry point that enables React with HMR in foundry.
 * Steps:
 * 1. Inject the required "preamble" <script /> for React Refresh into the foundry header
 * 2. Inject the actual entrypoint (main.ts)
 */
import { id as APP_ID } from "../module.json";
import { devSetup } from "foundry-vtt-react";

devSetup(APP_ID, "dist/main.ts");
