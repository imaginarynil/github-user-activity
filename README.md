# github-user-activity

A console application to get activities of a Github user. A solution for [GitHub User Activity](https://roadmap.sh/projects/github-user-activity).

## How to Run

Clone this repository

```
git clone https://github.com/imaginarynil/github-user-activity.git
```

Go to folder and install dependencies.

```
cd github-user-activity
npm install
```

Enter a valid Github username

```
node index.js <username>
```

Example:

```
node index.js imaginarynil
```

### Filter by Type

Enter the event type that you want in **any** case, preferably lowercase. Events that are currently supported:

- PushEvent
- WatchEvent
- CreateEvent
- IssuesEvent
- ForkEvent
- UnregisteredEvent (events other than the events above)

```
node index.js imaginarynil --type pushevent
node index.js imaginarynil -t pushevent
```
