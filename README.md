# Truss Technical Interview

This project is my work sample being submitted to Trussworks for consideration. Please see the [notes](./docs/workingNotes.md) page for issues I ran into during this project.

## Ways to run

The [`./sample.csv`](./sample.csv) and [`sample-with-broken-utf8.csv`](./sample-with-broken-utf8.csv) files are stored in the repo and hardcoded as the default arguments to be passed in to the CLI, should you not feel like typing in the arguments.

### Run using node
1. clone this repository
2. `cd truss_csv`
3. `npm install`
4. `npm start [inputFilePath] [outputFilePath]`

### Run using docker-compose
1. install `docker` and `docker-compose`
2. `docker-compose up --build`
3. `docker-compose down` when finished.

The transformed csv will be pulled from [`./sample.csv`](./sample.csv) and output to `./output.csv` by default unless you pass in your own arguments.
