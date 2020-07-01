import { Handler, Context, Callback, APIGatewayEvent } from 'aws-lambda';
import { query, Client, values } from 'faunadb';

interface Response {
  statusCode: number;
  body: string;
}

interface WeightRecord {
  ts: number;
  ref: values.Ref;
  data: {
    value: number;
  };
}

const { Paginate, Documents, Collection, Lambda, Get, Map } = query
const client = new Client({
  secret: process.env.FAUNADB_SECRET!
})

const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback<Response>) => {
  if (event.httpMethod !== 'GET') return callback(undefined, {
    statusCode: 405,
    body: JSON.stringify({ msg: 'Method not allowed' })
  });

  client.query<{ data: WeightRecord[] }>(Map(
    Paginate(Documents(Collection('weight_records'))),
    Lambda(x => Get(x))
  )).then((results) => callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        results: results.data.map(entry => ({
          date: new Date(entry.ts / 1000),
          value: entry.data.value,
          humanReadableDate: (date => [
            date.getDate().toString().padStart(2, '0'),
            (date.getMonth() + 1).toString().padStart(2, '0'),
            date.getFullYear(),
          ].join('/'))(new Date(entry.ts / 1000)),
          unit: 'Kg',
        }))
      }),
    }))
    .catch((error) => callback(error, {
      statusCode: 500,
      body: JSON.stringify(error)
    }))
}

export { handler }
