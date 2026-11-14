import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import cucumberJson from "wdio-cucumberjs-json-reporter";
import report from "multiple-cucumber-html-reporter";
import videoRecorder from "./tests/config/videoRecorder.js";

const JSON_REPORT_DIR = path.resolve(process.cwd(), "tests/reports/json");
const HTML_REPORT_DIR = path.resolve(process.cwd(), "tests/reports/html");
const BRAND_LOGO_PATH = path.resolve(process.cwd(), "src/assets/logo.jpeg");
const CUSTOM_STYLE_PATH = path.resolve(
  process.cwd(),
  "tests/config/emuna-report.css",
);

const isHeadless = process.env.HEADLESS === "true";

// Captura --tag="..." desde la CLI o variable de entorno TAG
const tagArg = process.argv.find((arg) => arg.startsWith("--tag="));
const tagExpression = tagArg
  ? tagArg.replace("--tag=", "")
  : process.env.TAG || "";

// Códigos de color ANSI nativos para terminal
const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

let currentStepIndex = 0;
let totalStepsInScenario = 0;
let scenarioSteps = [];

export const config = {
  runner: "local",
  specs: ["./tests/features/**/*.feature"],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          "--start-maximized",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          ...(isHeadless
            ? ["--headless=new", "--disable-gpu", "--window-size=1920,1080"]
            : []),
        ],
      },
    },
  ],
  logLevel: "warn",
  bail: 0,
  baseUrl: process.env.BASE_URL || "http://localhost:5173",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: "cucumber",
  reporters: [
    [
      "cucumberjs-json",
      {
        jsonFolder: JSON_REPORT_DIR,
        language: "es",
      },
    ],
  ],
  cucumberOpts: {
    require: ["./tests/steps/**/*.js"],
    retry: 1, // Reintenta 1 vez únicamente los escenarios que fallan
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tags: tagExpression,
    timeout: 60000,
    ignoreUndefinedDefinitions: false,
  },

  onPrepare: function () {
    fs.rmSync(JSON_REPORT_DIR, { recursive: true, force: true });
    fs.rmSync(HTML_REPORT_DIR, { recursive: true, force: true });
    fs.mkdirSync(JSON_REPORT_DIR, { recursive: true });
    fs.mkdirSync(HTML_REPORT_DIR, { recursive: true });
  },

  beforeScenario: async function (world) {
    await videoRecorder.start();
    if (!isHeadless) {
      await browser.maximizeWindow();
    }
    currentStepIndex = 0;
    scenarioSteps = world.pickle.steps;
    totalStepsInScenario = scenarioSteps.length;
    console.log(
      `\n${COLORS.cyan}▶ Scenario: ${world.pickle.name}${COLORS.reset}`,
    );
  },

  afterStep: async function (step, _scenario, { passed, error }) {
    currentStepIndex++;
    const stepText = `${step.keyword}${step.text}`.trim();

    if (passed) {
      console.log(
        `${COLORS.green}[STEP ${currentStepIndex}/${totalStepsInScenario}] ${stepText} ✓${COLORS.reset}`,
      );
    } else {
      console.log(
        `${COLORS.red}[STEP ${currentStepIndex}/${totalStepsInScenario}] ${stepText} ✖${COLORS.reset}`,
      );
      if (error) {
        console.log(
          `${COLORS.dim}   ↳ ${error.message || error}${COLORS.reset}`,
        );
      }

      const screenshot = await browser.takeScreenshot();
      cucumberJson.attach(screenshot, "image/png");
    }
  },

  afterScenario: async function () {
    while (currentStepIndex < totalStepsInScenario) {
      const skippedStep = scenarioSteps[currentStepIndex];
      currentStepIndex++;
      console.log(
        `${COLORS.yellow}[STEP ${currentStepIndex}/${totalStepsInScenario}] ${skippedStep.text} - (skipped)${COLORS.reset}`,
      );
    }

    const videoBase64 = await videoRecorder.stopAndEncode();
    if (videoBase64) {
      cucumberJson.attach(videoBase64, "video/webm");
    }
  },

  onComplete: async function () {
    await report.generate({
      jsonDir: JSON_REPORT_DIR,
      reportPath: HTML_REPORT_DIR,
      language: "es",
      pageTitle: "Emuná Estudio Pilates • Reporte de Calidad",
      reportName: "Emuná Estudio Pilates • Reporte E2E",
      brandLogo: BRAND_LOGO_PATH,
      customStyle: CUSTOM_STYLE_PATH,
      externalizeMedia: false,
      modalShowContext: true,
      displayDuration: true,
      displayReportTime: true,
      displayChartPercentages: true,
      humanReadableDuration: true,
      dateFormat: "dd/MM/yyyy",
      pageFooter:
        '<div style="text-align:center;padding:16px 0;font-size:12px;opacity:0.75;">Emuná Estudio Pilates • Movimiento Consciente • Reporte Automatizado de Calidad</div>',
      customData: {
        projectName: "Emuná Estudio Pilates",
        release: "Panel Administrativo v1.0",
        testCycle: "Regresión E2E • Administración y Alumnos",
        environment: "Testing (Vite + Firebase)",
      },
      metadata: {
        browser: {
          name: "chrome",
          version: "latest",
        },
        device: "Local Machine",
        platform: {
          name: process.platform,
          version: process.arch,
        },
      },
    });
  },
};