# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.


### Configuring your project

- Clone the project

```
git clone https://github.com/albertsundjaja/private_blockchain.git
```

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm install
```


## Testing

To test code:

1: Create a blockchain with dummy datas
```
node main.js
```

2: Run check.js to check for functionality

```
node check.js
```

## Framework for API endpoint

this project uses `Express.js` as router

## API Endpoint

### GET /block/:block_height

Get the block with height specified by the parameter

#### Sample Response

```$xslt
{
    "hash": "148c848d797e4c0736d8841a11267770cda4190c0ed86fbc435a390375aa02d2",
    "height": 10,
    "body": "Test Block - 10",
    "time": "1548170851",
    "previousBlockHash": "786ac673130a3c7eed334c899e95fb364198d0c367f19a42c9f5e5ed78a74b93"
}
```

### POST /block

Add a new block with content

```$xslt
{
    "body":"the content of the block"
}
```

#### Sample Response

will response with the newly added block detail

```$xslt
{
    "hash": "cfacf23fcd12cfc6d3b35bba3e9483056269e753198be0299b91dd143e750f16",
    "height": 11,
    "body": "this is a new block",
    "time": "1548172385",
    "previousBlockHash": "148c848d797e4c0736d8841a11267770cda4190c0ed86fbc435a390375aa02d2"
}
```