# kanu

Kanu is a web app for building and exploring network graphs of people, made for students, researchers, and the curious who want to see how people connect.

## What it does

Kanu has two modes.

**Explorer mode.** Search a historical figure and see their relationship web pulled from Wikidata, drawn as an interactive node and edge graph with a timeline. An AI helper writes short biography summaries and explains how two people are connected.

**Builder mode.** Draw your own graph on a canvas and edit it by talking to an AI chat assistant. In plain language you can ask it to add, remove, recolor, and relink nodes and edges, with optional web and image search.

Signed in users can save their projects.

## Who it is for

Kanu is for students, researchers, writers, and anyone curious about how people relate to each other. You do not need to know graph theory or write any code. You explore and build by searching and by talking to the AI in plain language.

## Stack

* Vite
* React
* TypeScript
* Tailwind CSS
* shadcn-ui
* ReactFlow
* Supabase for Postgres, Auth, and Deno edge functions
* The Wikidata public API
* An AI gateway running Gemini 2.5 Flash

It was generated with Lovable.

## Run it locally

You need Node and npm installed.

```bash
git clone https://github.com/danielvhofmann/kanu.git
cd kanu
npm install
npm run dev
```

The app runs a local dev server. Open the URL that the terminal prints.

Explorer mode and public browsing work out of the box. Sign in, saving projects, and the AI features need Supabase and AI gateway credentials, which are read from environment variables. Do not commit secrets. Keep your keys in a local env file that is ignored by git.

## Status

This is an early hackathon build. Expect rough edges, missing features, and breaking changes. It is shared to explore the idea, not as a finished product.

## License

MIT.
