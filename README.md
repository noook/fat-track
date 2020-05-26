# fat-track

[![Netlify Status](https://api.netlify.com/api/v1/badges/7fe6ee59-bb00-4e14-8835-51d07dadb5c3/deploy-status)](https://app.netlify.com/sites/fat-tracker/deploys)

A serverless app that records your weight on a daily basis through Google Assistant

## Usage

```
- Ok Google, save my weight: 82.5 kilograms
- Alright I'm saving it, 82.5 kilograms.
```

It Sends a POST request containing the value to the app, then value is saved into FaunaDB

Then later I'll try to make some graphs, stats and a dashboard to visualize the data
