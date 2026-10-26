#!/usr/bin/env node

import { program } from "commander";
import axios from "axios";

program.argument("<username>");

program.parse();

const username = program.args[0];
const url = `https://api.github.com/users/${username}/events`;

try {
  const res = await axios.get(url);
  console.log(res.data);
} catch (error) {
  console.log(error);
}

/*
PushEvent
WatchEvent
CreateEvent
IssuesEvent
ForkEvent */
