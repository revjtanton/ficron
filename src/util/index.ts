import { DynamoDB } from 'aws-sdk'
import marvel from '../config/marvel.json'

/**
 * Creates a DynamoDB connection
 *
 * @returns The DynamoDB connection
 */
const dynamoDbConnection = (): DynamoDB.DocumentClient => {
  if (process.env.NODE_ENV === 'development') {
    const args = {
      region: 'localhost',
      endpoint: 'http://db:8000',
      accessKeyId: process.env.S3_ACCESS || 'S3RVER',
      secretAccessKey: process.env.S3_SECRET || 'S3RVER'
    }

    return new DynamoDB.DocumentClient(args)
  } else {
    return new DynamoDB.DocumentClient()
  }
}

/**
 * Validates that a property is in a fiction
 *
 * @param fiction - The fiction to search
 * @param property - The name or IMDb ID of a property
 * @returns The IMDbID if valid otherwise false
 */
const validateProperty = (fiction: string, property: string) => {
  const fictionDetails = loadFiction(fiction)

  for (const prop of fictionDetails.properties) {
    if (prop.name === property || prop.imdbId === property) return prop.imdbId
  }

  return false
}

/**
 * Gets the fiction from config
 *
 * @param fiction - The fiction to load
 * @returns A JSON object of the fiction
 */
const loadFiction = (fiction: string) => {
  let fictionDetails

  // Swapping out config dynamically
  switch (fiction) {
    default:
      fictionDetails = marvel
      break
  }

  return fictionDetails
}

export default {
  dynamoDbConnection,
  validateProperty,
  loadFiction
}
