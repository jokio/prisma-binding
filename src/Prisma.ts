import { Binding } from 'graphql-binding'
import { Exists, PrismaOptions } from './types'
import { makeLinkWithAuthorization } from './link'
import { buildExistsInfo } from './info'
// import { SharedLink } from './SharedLink'
import { getTypesAndWhere } from './utils'
import { getCachedTypeDefs } from './cache'
import { makeRemoteExecutableSchema } from 'graphql-tools';

// const sharedLink = new SharedLink()

export class Prisma extends Binding {
  exists: Exists

  constructor({
    typeDefs,
    endpoint,
    authorizationHeader,
    fragmentReplacements,
    debug,
  }: PrismaOptions) {
    if (!typeDefs) {
      throw new Error('No `typeDefs` provided when calling `new Prisma()`')
    }

    if (typeDefs.endsWith('.graphql')) {
      typeDefs = getCachedTypeDefs(typeDefs)
    }

    if (endpoint === undefined) {
      throw new Error(
        `No Prisma endpoint found. Please provide the \`endpoint\` constructor option.`,
      )
    }

    if (!endpoint!.startsWith('http')) {
      throw new Error(`Invalid Prisma endpoint provided: ${endpoint}`)
    }

    fragmentReplacements = fragmentReplacements || []

    debug = debug || false

    // const token = secret ? sign({}, secret!) : undefined
    const link = makeLinkWithAuthorization({ endpoint: endpoint!, authorizationHeader, debug })

    const remoteSchema = makeRemoteExecutableSchema({
      link: link as any,
      schema: typeDefs,
    })

    super({
      schema: remoteSchema,
      fragmentReplacements,
    })

    this.exists = this.buildExists()
  }

  private buildExists(): Exists {
    const queryType = this.schema.getQueryType()
    if (!queryType) {
      return {}
    }
    if (queryType) {
      const types = getTypesAndWhere(queryType)

      return types.reduce((acc, { type, pluralFieldName }) => {
        return {
          ...acc,
          [type]: args =>
            this.delegate(
              'query',
              pluralFieldName,
              { where: args },
              buildExistsInfo(pluralFieldName, this.schema),
            ).then(res => res.length > 0),
        }
      }, {})
    }

    return {}
  }
}
