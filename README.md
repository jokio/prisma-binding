# remote-graphql-binding

[![npm version](https://badge.fury.io/js/remote-graphql-binding.svg)](https://badge.fury.io/js/remote-graphql-binding)


## Overview

`remote-graphql-binding` helps to generate sdk for remote graphql services and use power of intellisense & type safety (using Typescript).

## How it works
1. Create graphqlconfig file using graphql cli:
```sh
graphql init
``` 
2. Add generation script in package.json:
```js
{
  ...
  "scripts": {
    ...
    "generate": "graphql get-schema --all && graphql codegen"
  }
}
```
3. Generate sdk for remote graphql service:
```sh
yarn generate
# or
npm run generate
```

Thats it, now you can use generated file to make remote calls, please check example


## Install
```sh
yarn add remote-graphql-binding
# or
npm install --save remote-graphql-binding
```

## Example
folder structure:
- src/index.ts
- .grpahqlconfig
- .env

.grpahqlconfig
```json
{
  "projects": {
    "Neo4jService": {
      "schemaPath": "schemas/db.graphql",
      "extensions": {
        "endpoints": {
          "dev": {
            "url": "${env:DB_SERVICE_URL}",
            "headers": {
              "Authorization": "basic ${env:DB_AUTH_TOKEN}"
            }
          }
        },
        "codegen": [
          {
            "generator": "remote-graphql-binding",
            "language": "typescript",
            "output": {
              "binding": "src/generated/neo4j-service.ts"
            }
          }
        ]
      }
    }
  }
}
```

.env
```env
DB_SERVICE_URL=
DB_AUTH_TOKEN=
```

src/index.ts
```ts
import { Binding as DB } from './generated/neo4j-service'

const service = new DB({
  endpoint: process.env.DB_SERVICE_URL,
  authorizationHeader: `basic ${process.env.DB_AUTH_TOKEN}`,
})

service.query.Song({}).then(x => console.log(x))
```



## API

### `constructor(options: Options): Binding`

The `Options` type has the following fields:

| Key | Required |  Type | Default | Note |
| ---  | --- | --- | --- | --- |
| `endpoint` | Yes | `string` | - | The endpoint of your Prisma service |
| `authorizationHeader` | No | `string` | `null` | Authorization header for secured services |
| `fragmentReplacements` | No | `FragmentReplacements` |  `null` | A list of GraphQL fragment definitions, specifying fields that are required for the resolver to function correctly |
| `debug` | No | `boolean` |  `false` | Log all queries/mutations to the console |

### `request`

The `request` method lets you send GraphQL queries/mutations to your Prisma service. The functionality is identical to the auto-generated delegate resolves, but the API is more verbose as you need to spell out the full query/mutation. `request` uses [`graphql-request`](https://github.com/graphcool/graphql-request) under the hood.

Here is an example of how it can be used:

```js
const query = `
  query ($userId: ID!){
    user(id: $userId) {
      id
      name
    }
  }
`

const variables = { userId: 'abc' }

binding.request(query, variables)
  .then(result => console.log(result))
// sample result:
// {"data": { "user": { "id": "abc", "name": "Sarah" } } }
```
