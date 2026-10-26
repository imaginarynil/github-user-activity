#!/usr/bin/env node

import { program } from "commander";
import axios from "axios";

program.argument("<username>");

program.parse();

const username = program.args[0];
const url = `https://api.github.com/users/${username}/events`;

function getCommitMap(events) {
  const map = new Map();
  for (const event of events) {
    if (event["type"] == "PushEvent") {
      const repoName = event["repo"]["name"];
      if (map.has(repoName)) {
        map.set(repoName, map.get(repoName) + 1);
      } else {
        map.set(repoName, 1);
      }
    }
  }
  return map;
}

function printEvents(events) {
  for (const event of events) {
    console.log(`- ${event}`);
  }
}

try {
  const res = await axios.get(url);
  const events = [];
  // handle push events
  const commitMap = getCommitMap(res.data);
  for (const [key, value] of commitMap.entries()) {
    events.push(`Pushed ${value} commits to ${key}`);
  }
  // handle other events
  for (const event of res.data) {
    switch (event["type"]) {
      case "WatchEvent":
        break;
      case "CreateEvent":
        break;
      case "IssuesEvent":
        break;
      case "ForkEvent":
        break;
      default:
    }
  }
  // print events
  printEvents(events);
} catch (error) {
  switch (error.status) {
    case 404:
      console.log("Username is not found");
      break;
    default:
      console.log("An error has occured");
  }
}

/*
WatchEvent
PushEvent
CreateEvent
IssuesEvent
ForkEvent */
