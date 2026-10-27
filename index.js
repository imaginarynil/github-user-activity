#!/usr/bin/env node

import { Command } from "commander";
import axios from "axios";

const program = new Command();
program.argument("<username>").option("-t, --type <type>", "event type");
program.parse();
const options = program.opts();

const username = program.args[0];
const url = `https://api.github.com/users/${username}/events`;

const EventType = Object.freeze({
  PushEvent: "PushEvent",
  WatchEvent: "WatchEvent",
  CreateEvent: "CreateEvent",
  IssuesEvent: "IssuesEvent",
  ForkEvent: "ForkEvent",
  UnregisteredEvent: "UnregisteredEvent",
});

function printEvents(eventReports) {
  if (eventReports.length === 0) {
    console.log("No events");
  }
  for (const eventReport of eventReports) {
    console.log(`- ${eventReport.report}`);
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

class EventReport {
  constructor(type, report) {
    this.type = type;
    this.report = report;
  }
}

function getEventReports(data) {
  const eventReports = [];
  const countMap = new Map();
  // handle events
  for (const event of data) {
    switch (event["type"]) {
      case EventType.PushEvent:
        handlePushEvent(countMap, event["repo"]["name"]);
        break;
      case EventType.WatchEvent:
        eventReports.push(
          new EventReport(EventType.WatchEvent, `Starred ${event.repo.name}`),
        );
        break;
      case EventType.CreateEvent:
        eventReports.push(
          new EventReport(
            EventType.CreateEvent,
            `Created a ${event.payload.ref_type} in ${event.repo.name}`,
          ),
        );
        break;
      case EventType.IssuesEvent:
        eventReports.push(
          new EventReport(
            EventType.IssuesEvent,
            `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} an issue in ${event.repo.name}`,
          ),
        );
        break;
      case EventType.ForkEvent:
        eventReports.push(
          new EventReport(EventType.ForkEvent, `Forked ${event.repo.name}`),
        );
        break;
      default:
        eventReports.push(
          new EventReport(
            EventType.UnregisteredEvent,
            `Unregistered event of type \"${event.type}\" on ${event.repo.name}`,
          ),
        );
    }
  }
  // add commit counts to events
  if (countMap.has(EventType.PushEvent)) {
    for (const [key, value] of countMap.get(EventType.PushEvent).entries()) {
      eventReports.unshift(
        new EventReport(
          EventType.PushEvent,
          `Pushed ${value} commits to ${key}`,
        ),
      );
    }
  }
  return eventReports;
}

async function main() {
  try {
    const res = await axios.get(url);
    if (res.data.length === 0) {
      console.log("No events");
      process.exit(0);
    }
    let eventReports = getEventReports(res.data);
    if (options.type) {
      eventReports = eventReports.filter(
        (e) => e.type.toLowerCase() === options.type.toLowerCase(),
      );
    }
    printEvents(eventReports);
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
}

main();
