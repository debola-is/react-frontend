const AWS = require ("aws-sdk")
const docClient = new AWS.DynamoDBDocumentClient()
const groupsTable = process.env.GROUP_TABLE



exports.handler = async (event) => {
    // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
    // let nextKey // Next key to continue scan operation if necessary
    // let limit // Maximum number of elements to return
  
    console.log('Processing event: ', event)
    let limit
    let nextKey
    
    try {
        limit = parseLimitParameter(event) || 5
        nextKey = parseNextKeyParameter(event)
    }
    catch(e) {
        console.log("Failed to parse query parameters")
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: "Invalid query parameters"
            })
        }
    }
    

    // HINT: You might find the following method useful to get an incoming parameter value
    // getQueryParameter(event, 'param')
  
    // TODO: Return 400 error if parameters are invalid
  
    // Scan operation parameters
    const scanParams = {
      TableName: groupsTable,
      Limit: limit,
      ExlclusiveStartKey: nextKey,
    }
    console.log('Scan params: ', scanParams)
  
    const result = await docClient.scan(scanParams).promise()
  
    const items = result.Items
  
    console.log('Result: ', result)
  
    // Return result
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items,
        // Encode the JSON object so a client can return it in a URL as is
        nextKey: encodeNextKey(result.LastEvaluatedKey)
      })
    }
  }



//Encodes value of NextKey as this value has to be encoded in our response body
  function encodeNextKey(lastEvaluatedKey) {
    if (!lastEvaluatedKey) {
      return null
    }
  
    return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
  }

// This function obtains the value of the nextKey from the query parameters,
//decodes it and returns the value as a JSON object.

function parseNextKeyParameter(event) {
    const nextKeyStr = getQueryParameters(event, 'nextkey')
    if (!nextKeyStr){
        return undefined
    }

    const decodedValue = decodeURIComponent(nextKeyStr)
    return JSON.parse(decodedValue)
}

//This funtion obtains the value of limit from the query parameters,
//and returns it as a more useful integer

function parseLimitParameter(event) {
    const limitStr = getQueryParameters(event, 'limit')
    if (!limitStr){
        return undefined
    }

    //convert the limit gotten from the query parameters to type int
    const limit = parseInt(limitStr, 10)
    
    if(limit <=0 || limit != Math.floor(limit)){
        throw new Error ("Limit should be a positive integer!")
    }

    return limit
    
}
  
function getQueryParameters(event, name) {
    const queryParams = event.queryStringParameters
    if (!queryParams) {
        return undefined
    }

    return queryParams[name]
}