import { PlacementEngine } from "./engine.js";
import { writeFileSync } from "fs";
import { Policies } from "./types.js";
const companies = require("./data/companies.json");
const students = require("./data/students.json");
const policies = require("./data/policy.json");

const company = companies[0];

const engine = await PlacementEngine.create(students, company, policies);
const engine2 = await PlacementEngine.create(students, company, 'https://raw.githubusercontent.com/karthikeyan05046/collage-placement-decision-engine/main/src/data/policy.json');

writeFileSync("output.json", JSON.stringify(engine.getSummaryReport(), null, 3));