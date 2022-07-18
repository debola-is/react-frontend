const AWS = require ("aws-sdk")
const docClient = new AWS.DynamoDBDocumentClient()

const result = await docClient.scan({
    TableName: process.env.GROUP_TABLE,
    Limit: 2
}).promise()

const items = result.Items
const nextKey = result.LastEvakluatedKey

if(nextKey != null) {
    const moreData = await docClient.scan({
        TableName: process.env.GROUP_TABLE,
        Limit: 3,
        ExlclusiveStartKey: nextKey
    }).promise()
}