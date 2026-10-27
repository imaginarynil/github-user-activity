#!/usr/bin/env node

import { program } from "commander";
import axios from "axios";

program.argument("<username>");

program.parse();

const username = program.args[0];
const url = `https://api.github.com/users/${username}/events`;

const EventType = Object.freeze({
  PushEvent: "PushEvent",
  WatchEvent: "WatchEvent",
  CreateEvent: "CreateEvent",
  IssuesEvent: "IssuesEvent",
  ForkEvent: "ForkEvent",
});

function printEvents(events) {
  for (const event of events) {
    console.log(`- ${event}`);
  }
}

try {
  const res = await axios.get(url);
  const events = [];
  const countMap = new Map();
  // handle events
  for (const event of res.data) {
    switch (event["type"]) {
      case EventType.PushEvent:
        if (!countMap.has(EventType.PushEvent)) {
          countMap.set(EventType.PushEvent, new Map());
        }
        const m = countMap.get(EventType.PushEvent);
        const repoName = event["repo"]["name"];
        if (m.has(repoName)) {
          m.set(repoName, m.get(repoName) + 1);
        } else {
          m.set(repoName, 1);
        }
        break;
      case EventType.WatchEvent:
        break;
      case EventType.CreateEvent:
        break;
      case EventType.IssuesEvent:
        break;
      case EventType.ForkEvent:
        break;
      default:
        events.push(
          `Unregistered event of type \"${event.type}\" on ${event.repo.name}`,
        );
    }
  }
  for (const [key, value] of countMap.get(EventType.PushEvent).entries()) {
    events.unshift(`Pushed ${value} commits to ${key}`);
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
