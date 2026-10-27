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

function handlePushEvent(countMap, repoName) {
  if (!countMap.has(EventType.PushEvent)) {
    countMap.set(EventType.PushEvent, new Map());
  }
  const m = countMap.get(EventType.PushEvent);
  if (m.has(repoName)) {
    m.set(repoName, m.get(repoName) + 1);
  } else {
    m.set(repoName, 1);
  }
}

try {
  const res = await axios.get(url);
  if (res.data.length === 0) {
    console.log("No events");
    process.exit(0);
  }
  const events = [];
  const countMap = new Map();
  // handle events
  for (const event of res.data) {
    switch (event["type"]) {
      case EventType.PushEvent:
        handlePushEvent(countMap, event["repo"]["name"]);
        break;
      case EventType.WatchEvent:
        events.push(`Starred ${event.repo.name}`);
        break;
      case EventType.CreateEvent:
        events.push(
          `Created a ${event.payload.ref_type} in ${event.repo.name}`,
        );
        break;
      case EventType.IssuesEvent:
        events.push(
          `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} an issue in ${event.repo.name}`,
        );
        break;
      case EventType.ForkEvent:
        events.push(`Forked ${event.repo.name}`);
        break;
      default:
        events.push(
          `Unregistered event of type \"${event.type}\" on ${event.repo.name}`,
        );
    }
  }
  // add commit counts to events
  if (countMap.has(EventType.PushEvent)) {
    for (const [key, value] of countMap.get(EventType.PushEvent).entries()) {
      events.unshift(`Pushed ${value} commits to ${key}`);
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
      console.error(error);
  }
}
