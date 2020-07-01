import { Handler, Context, Callback, APIGatewayEvent } from 'aws-lambda';
import { query, Client, values } from 'faunadb';

interface WeightPostBody {
  token: string;
  value: number;
}

interface Response {
  statusCode: number;
  body: string;
}

const { Create, Ref } = query
const client = new Client({
  secret: process.env.FAUNADB_SECRET!
})

const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback<Response>) => {
  if (event.httpMethod !== 'POST') return callback(undefined, {
    statusCode: 405,
    body: JSON.stringify({ msg: 'Method not allowed' })
  });

  try {
    const payload: WeightPostBody = JSON.parse(event.body || '');
    const { value } = payload;

    return client.query(
      Create(Ref('classes/weight_records'), {
        data: { value }
      })
    )
      .then((response) => callback(null, {
        statusCode: 201,
        body: JSON.stringify({ msg: 'Created', entry: payload }),
      }))
      .catch((error) => callback(error, {
        statusCode: 500,
        body: JSON.stringify(error)
      }))
  } catch (e) {
    return callback(e, {
      statusCode: 400,
      body: JSON.stringify({ msg: 'Invalid payload' }),
    });
  }
}

export { handler }
