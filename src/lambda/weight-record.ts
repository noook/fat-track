import { Handler, Context, Callback, APIGatewayEvent } from 'aws-lambda'


interface WeightPostBody {
  token: string;
  value: number;
}

interface Response {
  statusCode: number;
  body: string;
}

const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback<Response>) => {
  console.log(event.httpMethod);
  if (event.httpMethod !== 'POST') return callback(undefined, {
    statusCode: 405,
    body: JSON.stringify({ msg: 'Method not allowed' })
  });
  try {
    const payload: WeightPostBody = JSON.parse(event.body || '');
    return callback(undefined, {
      statusCode: 201,
      body: JSON.stringify({ msg: 'Created', entry: payload }),
    })
  } catch (e) {
    return callback(e, {
      statusCode: 400,
      body: JSON.stringify({ msg: 'Invalid payload' }),
    });
  }
}

export { handler }
