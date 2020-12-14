import { Handler, Context, Callback, APIGatewayEvent } from 'aws-lambda';
import { query, Client, values } from 'faunadb';

interface Response {
  statusCode: number;
  body: string;
}

interface WeightRecord {
  ts: number;
  ref: values.Ref;
  after: any,
  data: {
    value: number;
  };
}

const { Paginate, Documents, Collection, Lambda, Get, Map } = query
const client = new Client({
  secret: process.env.FAUNADB_SECRET!
})

function getDate(date: Date): string {
  return [
    date.getDate().toString().padStart(2, '0'),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getFullYear(),
  ].join('/');
}

const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback<Response>) => {
  if (event.httpMethod !== 'GET') {
    return callback(undefined, {
      statusCode: 405,
      body: JSON.stringify({ msg: 'Method not allowed' })
    });
  }

  const query = client.query<{ data: WeightRecord[] }>(Map(
    Paginate(Documents(Collection('weight_records')), { size: 500 }),
    Lambda(x => Get(x))
  ));


  return query.then((results) => {
    let body;

    if (event.queryStringParameters?.txt !== undefined) {
      body = results.data
        .map(entry => `${getDate(new Date(entry.ts / 1000))} ${entry.data.value.toFixed(1)}Kg`)
        .join('\n');
    } else {
      body = JSON.stringify({
        results: results.data.map(entry => ({
          date: new Date(entry.ts / 1000),
          value: entry.data.value,
          humanReadableDate: getDate(new Date(entry.ts / 1000)),
          unit: 'Kg',
        }))
      }, null, event.queryStringParameters?.human !== undefined ? 0 : 2)
    }

    return callback(undefined, {
      statusCode: 200,
      body,
    });
  })
  .catch((error) => callback(error, {
    statusCode: 500,
    body: JSON.stringify(error)
  }))
}

export { handler }
