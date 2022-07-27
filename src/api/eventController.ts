// eventController.ts
/**
 * The API handlers for Event operations
 * @packageDocumentation
 */
import { HttpResponse } from 'aws-sdk'
import { APIGatewayProxyEvent } from 'aws-lambda'
import lu from 'lambda-restful-util'
import Joi from 'joi'
import { EventService } from '../service'
import utils from '../util'

// Defines our responses
const ok = lu.withStatusCode(lu.HttpStatusCode.OK, JSON.stringify)
const created = lu.withStatusCode(lu.HttpStatusCode.CREATED, JSON.stringify)
const bad = lu.withStatusCode(lu.HttpStatusCode.BAD_REQUEST)
const notFound = lu.withStatusCode(lu.HttpStatusCode.NOT_FOUND)

const EventSchema = Joi.object({
  characterName: Joi.string().required(),
  eventDateAndTime: Joi.date().required(),
  eventType: Joi.string().required()
})

const validFictions = ['marvel']

/**
 * Creates an event
 *
 * @param event - The AWS event passed from the requestor
 * @returns The appropriate HTTP response object
 */
exports.createEvent = async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
  if (
    event.body &&
    event.pathParameters &&
    event.pathParameters.fictionName &&
    event.pathParameters.propertyName &&
    validFictions.indexOf(event.pathParameters.fictionName) > -1
  ) {
    const propertyImdbId = utils.validateProperty(event.pathParameters.fictionName, event.pathParameters.propertyName)

    if (propertyImdbId) {
      try {
        const service = new EventService()

        const req = await EventSchema.validateAsync(JSON.parse(event.body))
        const res = await service.saveEvent(event.pathParameters.fictionName, propertyImdbId, req)

        if (res) return created(res)
      } catch (err: any) {
        console.error(err)
      }
    }
  }

  return bad()
}

/**
 * Gets all events related to a particular movie
 *
 * @param event - The AWS event passed from the requestor
 * @returns The appropriate HTTP response object
 */
exports.getPropertyEvents = async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
  if (
    event.pathParameters &&
    event.pathParameters.fictionName &&
    event.pathParameters.propertyName &&
    validFictions.indexOf(event.pathParameters.fictionName) > -1
  ) {
    const propertyImdbId = utils.validateProperty(event.pathParameters.fictionName, event.pathParameters.propertyName)

    if (propertyImdbId) {
      try {
        const service = new EventService()
        const events = service.getEventsFromIndex('propertyImdbId', propertyImdbId)
        const deets =
          event.queryStringParameters && event.queryStringParameters.details
            ? service.getPropertyDetails(event.pathParameters.fictionName, propertyImdbId)
            : undefined

        const res = await Promise.all([events, deets])

        if (res) return ok({ items: res[0], propertyDetails: res[1] })
      } catch (err: any) {
        console.error(err)
      }
    }
  }

  return bad()
}

/**
 * Gets all events related to a particular character
 *
 * @param event - The AWS event passed from the requestor
 * @returns The appropriate HTTP response object
 */
exports.getCharacterEvents = async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
  if (
    event.pathParameters &&
    event.pathParameters.fictionName &&
    event.pathParameters.characterName &&
    validFictions.indexOf(event.pathParameters.fictionName) > -1
  ) {
    try {
      const service = new EventService()
      const events = service.getEventsFromIndex('characterName', event.pathParameters.characterName)

      const res = await Promise.all([events])

      if (res) return ok({ items: res[0] })
    } catch (err: any) {
      console.error(err)
    }
  }

  return bad()
}
