// EventService.ts
/**
 * The application logic for Event operations
 * @packageDocumentation
 */
import { DynamoDB } from 'aws-sdk'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import utils from '../util'

/**
 * A class to perform actions for Event operations
 */
export default class EventService {
  private _dynamoDb: DynamoDB.DocumentClient
  private _date: string
  private _fictionName: string

  private TableName = `FichronEvent-${process.env.STAGE!}`

  constructor(fictionName: string) {
    this._fictionName = fictionName

    this._dynamoDb = utils.dynamoDbConnection()
    this._date = new Date().toString()
  }

  /**
   * Saves event to DynamoDb
   *
   * @returns boolean
   */
  public async saveEvent(propertyImdbId: string, event: any): Promise<boolean> {
    try {
      // Cleanup some data types
      event.eventDateAndTime = event.eventDateAndTime.toString()

      // Setting up our db object
      const Item = {
        id: uuidv4(),
        fictionName: this._fictionName,
        propertyImdbId,
        ...event,
        created: this._date,
        modified: this._date
      }

      const params = {
        TableName: this.TableName,
        Item
      }

      await this._dynamoDb.put(params).promise()

      return true
    } catch (err) {
      console.error(err)
    }

    return false
  }

  /**
   *
   * @param fiction - The fiction config to load
   * @param property - The movie name or IMDb ID to find
   * @returns The IMDb data or false
   */
  public async getPropertyDetails(fiction: string, property: string) {
    /** @todo eventually cache IMDb results in S3 */
    const imdbId = utils.validateProperty(fiction, property)
    let res

    if (imdbId) res = await axios.get(`https://imdb-api.com/en/API/Title/${process.env.IMDB_KEY}/${imdbId}`)
    if (res && res.data) return res.data

    return false
  }

  /**
   * Gets events based on index
   *
   * @param index - The name of the index to query
   * @param name - The name of the thing you're looking up
   * @returns
   */
  public async getEventsFromIndex(index: string, name: string) {
    try {
      const params = {
        TableName: this.TableName,
        IndexName: `${index}-index`,
        KeyConditionExpression: `${index} = :${index}`,
        ExpressionAttributeValues: { [`:${index}`]: name }
      }
      const res = await this._dynamoDb.query(params).promise()
      return res.Items
    } catch (err) {
      console.error(err)
    }
  }
}
