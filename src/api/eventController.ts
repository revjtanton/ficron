// eventController.ts
/**
 * The API handlers for Event operations
 * @packageDocumentation
 */
 import { HttpResponse } from 'aws-sdk'
 import { APIGatewayProxyEvent } from 'aws-lambda'
 import lu from 'lambda-restful-util'
 import Joi from 'joi'

 // Defines our responses
const ok = lu.withStatusCode(lu.HttpStatusCode.OK, JSON.stringify)
const created = lu.withStatusCode(lu.HttpStatusCode.CREATED, JSON.stringify)
const bad = lu.withStatusCode(lu.HttpStatusCode.BAD_REQUEST)
const notFound = lu.withStatusCode(lu.HttpStatusCode.NOT_FOUND)

const EventSchema = Joi.object({
  fictionName: Joi.string().required(),
  movieName: Joi.string().required(),
  characterName: Joi.string().required()
})

/**
 * Creates an event
 *
 * @param event - The AWS event passed from the requestor
 * @returns The appropriate HTTP response object
 */
exports.createEvent = async (event: APIGatewayProxyEvent): Promise<HttpResponse> => {
  if (event.body) {
    try {
      const req = await EventSchema.validateAsync(JSON.parse(event.body))
      return created(req)
    } catch (err: any) {
      console.error(err)
    }
  }

  return bad()
}