import { PlacementEngine } from "./engine.js";
import { writeFileSync } from "fs";
const companies = require("./data/companies.json");
const students = require("./data/students.json");
const policies = require("./data/policy.json");

const company = companies[0];

// const engine = await PlacementEngine.create(students, company, policies);
const engine = await PlacementEngine.create(students, company, 'https://placement-engine.s3.ap-south-1.amazonaws.com/policy.json');

writeFileSync("output.json", JSON.stringify(engine.getSummaryReport(), null, 3));